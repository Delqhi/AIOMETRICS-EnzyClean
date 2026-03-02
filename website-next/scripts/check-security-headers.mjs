#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const configPath = resolve(process.cwd(), "next.config.ts");
const source = readFileSync(configPath, "utf8");

const requiredHeaderKeys = [
  "Content-Security-Policy",
  "Strict-Transport-Security",
  "X-Content-Type-Options",
  "Referrer-Policy"
];

const requiredCspClauses = [
  "default-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "worker-src 'self' blob:"
];

const requiredStaticRoutes = ["/models/:path*", "/posters/:path*", "/patent/:path*", "/model-viewer/:path*"];

const failures = [];

for (const key of requiredHeaderKeys) {
  if (!source.includes(key)) {
    failures.push(`Missing security header key: ${key}`);
  }
}

for (const clause of requiredCspClauses) {
  if (!source.includes(clause)) {
    failures.push(`Missing CSP clause: ${clause}`);
  }
}

for (const route of requiredStaticRoutes) {
  if (!source.includes(route)) {
    failures.push(`Missing static cache route: ${route}`);
  }
}

if (failures.length > 0) {
  console.error("Security header check failed:\n" + failures.map((line) => `- ${line}`).join("\n"));
  process.exit(1);
}

console.log("Security header check passed");
