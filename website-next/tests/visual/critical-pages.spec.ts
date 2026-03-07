import { expect, test } from "@playwright/test";

const criticalPaths = ["/de", "/de/patent", "/de/technology", "/de/faq", "/de/contact", "/de/waitlist", "/en", "/en/patent"];

const reduceMotionStyles = `
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    scroll-behavior: auto !important;
    caret-color: transparent !important;
  }
`;

function screenshotName(path: string): string {
  const normalized = path.replace(/^\//, "").replace(/\//g, "-");
  return `${normalized || "root"}.png`;
}

test.describe("critical pages visual baselines", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((styleText) => {
      const style = document.createElement("style");
      style.innerHTML = styleText;
      document.addEventListener("DOMContentLoaded", () => {
        document.head.appendChild(style);
      });
    }, reduceMotionStyles);
  });

  for (const path of criticalPaths) {
    test(`matches snapshot for ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("domcontentloaded");
      await page.locator("main").waitFor();
      await page.evaluate(async () => {
        if ("fonts" in document) {
          await (document as Document & { fonts: FontFaceSet }).fonts.ready;
        }
      });

      await expect(page).toHaveScreenshot(screenshotName(path), {
        fullPage: true,
        animations: "disabled",
        caret: "hide"
      });
    });
  }
});
