import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    ignores: [
      ".next/**",
      ".open-next/**",
      "out/**",
      "build/**",
      "playwright-report-visual/**",
      "test-results/**",
      "public/model-viewer/decoders/**",
      "next-env.d.ts"
    ]
  }
];

export default config;
