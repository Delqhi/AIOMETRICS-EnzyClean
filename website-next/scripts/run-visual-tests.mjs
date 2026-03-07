#!/usr/bin/env node

import { spawn } from "node:child_process";
import net from "node:net";

const HOST = process.env.VISUAL_HOST ?? "127.0.0.1";
const TIMEOUT_MS = Number(process.env.VISUAL_TIMEOUT_MS ?? "120000");

function findOpenPort(startPort = 4173) {
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
    setTimeout(() => reject(new Error("Unable to find open port for visual tests")), 10000);
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

const port = await findOpenPort();
const baseUrl = `http://${HOST}:${port}`;
const server = spawn("npm", ["run", "start", "--", "--hostname", HOST, "--port", String(port)], {
  shell: process.platform === "win32",
  stdio: "inherit"
});

const playwrightArgs = ["playwright", "test", "-c", "playwright.visual.config.ts", ...process.argv.slice(2)];

let exitCode = 1;
try {
  await waitForUrl(baseUrl, TIMEOUT_MS);
  exitCode = await runCommand("npx", playwrightArgs, {
    env: {
      ...process.env,
      PLAYWRIGHT_BASE_URL: baseUrl
    }
  });
} finally {
  await stopServer(server);
}

process.exit(exitCode);
