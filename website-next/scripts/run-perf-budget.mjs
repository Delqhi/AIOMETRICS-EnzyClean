#!/usr/bin/env node

import { copyFile, mkdir, mkdtemp, readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import net from "node:net";

const HOST = process.env.PERF_HOST ?? "127.0.0.1";
const BASE_PATH = process.env.PERF_PATH ?? "/de";
const TIMEOUT_MS = Number(process.env.PERF_TIMEOUT_MS ?? "90000");
const MIN_SCORE = Number(process.env.PERF_MIN_SCORE ?? "0.85");
const MAX_LCP_MS = Number(process.env.PERF_MAX_LCP_MS ?? "2500");
const MAX_CLS = Number(process.env.PERF_MAX_CLS ?? "0.1");
const REPORT_FILE = process.env.PERF_REPORT_FILE ?? ".reports/lighthouse-report.json";

function normalizePath(value) {
  if (!value || value === "/") return "/";
  return value.startsWith("/") ? value : `/${value}`;
}

function findOpenPort(startPort = 4300) {
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
    setTimeout(() => reject(new Error("Unable to find open port for perf check")), 10000);
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
const tmpDir = await mkdtemp(join(tmpdir(), "aiometrics-lighthouse-"));
const tmpReportFile = join(tmpDir, "report.json");

const server = spawn("npm", ["run", "start", "--", "--hostname", HOST, "--port", String(port)], {
  shell: process.platform === "win32",
  stdio: "inherit"
});

let lhExitCode = 1;
try {
  await waitForUrl(url, TIMEOUT_MS);

  lhExitCode = await runCommand("npx", [
    "-y",
    "lighthouse",
    url,
    "--only-categories=performance",
    "--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage",
    "--output=json",
    `--output-path=${tmpReportFile}`,
    "--quiet"
  ]);
} finally {
  await stopServer(server);
}

if (lhExitCode !== 0) {
  process.exit(lhExitCode);
}

const report = JSON.parse(await readFile(tmpReportFile, "utf8"));

await mkdir(dirname(REPORT_FILE), { recursive: true });
await copyFile(tmpReportFile, REPORT_FILE);

const perfScore = Number(report?.categories?.performance?.score ?? 0);
const lcpMs = Number(report?.audits?.["largest-contentful-paint"]?.numericValue ?? Number.NaN);
const cls = Number(report?.audits?.["cumulative-layout-shift"]?.numericValue ?? Number.NaN);

const failures = [];
if (perfScore < MIN_SCORE) {
  failures.push(`Performance score ${perfScore.toFixed(2)} is below threshold ${MIN_SCORE.toFixed(2)}`);
}
if (!Number.isNaN(lcpMs) && lcpMs > MAX_LCP_MS) {
  failures.push(`LCP ${Math.round(lcpMs)}ms exceeds max ${Math.round(MAX_LCP_MS)}ms`);
}
if (!Number.isNaN(cls) && cls > MAX_CLS) {
  failures.push(`CLS ${cls.toFixed(3)} exceeds max ${MAX_CLS.toFixed(3)}`);
}

console.log(
  `perf score=${perfScore.toFixed(2)} lcp_ms=${Number.isNaN(lcpMs) ? "n/a" : Math.round(lcpMs)} cls=${
    Number.isNaN(cls) ? "n/a" : cls.toFixed(3)
  }`
);

if (failures.length > 0) {
  for (const issue of failures) {
    console.error(issue);
  }
  process.exit(1);
}

console.log(`perf budget check passed for ${url}`);
