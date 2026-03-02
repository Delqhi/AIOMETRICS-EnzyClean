#!/usr/bin/env node

import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname } from "node:path";
import net from "node:net";

const HOST = process.env.A11Y_HOST ?? "127.0.0.1";
const BASE_PATH = process.env.A11Y_PATH ?? "/";
const TIMEOUT_MS = Number(process.env.A11Y_TIMEOUT_MS ?? "90000");
const REPORT_FILE = process.env.A11Y_REPORT_FILE ?? ".reports/axe-results.json";

function normalizePath(value) {
  if (!value || value === "/") return "/";
  return value.startsWith("/") ? value : `/${value}`;
}

function findOpenPort(startPort = 4200) {
  return new Promise((resolve, reject) => {
    const probe = (port) => {
      const server = net.createServer();
      server.once("error", () => probe(port + 1));
      server.once("listening", () => {
        server.close(() => resolve(port));
      });
      server.listen(port, HOST);
    };

    probe(startPort);
    setTimeout(() => reject(new Error("Unable to find open port for a11y check")), 10000);
  });
}

async function waitForUrl(url, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url, { method: "GET", redirect: "follow" });
      if (response.ok) {
        return;
      }
    } catch {
      // wait and retry
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Timeout waiting for ${url}`);
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      shell: process.platform === "win32",
      stdio: "inherit",
      ...options
    });

    child.on("error", reject);
    child.on("close", (code) => resolve(code ?? 1));
  });
}

async function stopServer(server) {
  if (!server || server.killed) return;

  server.kill("SIGTERM");
  await new Promise((resolve) => setTimeout(resolve, 1200));
  if (!server.killed) {
    server.kill("SIGKILL");
  }
}

const pathForCheck = normalizePath(BASE_PATH);
const port = await findOpenPort();
const url = `http://${HOST}:${port}${pathForCheck}`;

await mkdir(dirname(REPORT_FILE), { recursive: true });

const server = spawn("npm", ["run", "start", "--", "--hostname", HOST, "--port", String(port)], {
  shell: process.platform === "win32",
  stdio: "inherit"
});

let exitCode = 1;
try {
  await waitForUrl(url, TIMEOUT_MS);

  exitCode = await runCommand("npx", [
    "-y",
    "@axe-core/cli",
    url,
    "--exit",
    "--save",
    REPORT_FILE
  ]);
} finally {
  await stopServer(server);
}

if (exitCode !== 0) {
  process.exit(exitCode);
}

console.log(`a11y check passed for ${url}`);
