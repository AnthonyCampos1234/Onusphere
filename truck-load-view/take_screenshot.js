const puppeteer = require("puppeteer");

// Add a timeout function for better control
const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  let browser;
  try {
    console.log("Launching browser...");
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      timeout: 30000,
    });

    console.log("Creating new page...");
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
      window.IS_SCREENSHOT_MODE = true;
    });
    await page.setViewport({ width: 1280, height: 720 });

    // Add console logging
    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
    page.on("pageerror", (err) => console.log("PAGE ERROR:", err.message));

    console.log("Navigating to application...");
    await page.goto("http://localhost:3000", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    console.log("Waiting for simulation to load...");
    await page.waitForFunction(() => window.viewer?.simulationLoaded === true, {
      timeout: 20000,
      polling: 1000,
    });

    await timeout(2000);

    // Define your exact camera views here
    const views = [
      {
        label: "front-left",
        position: { x: -90.38, y: 153, z: -211.17 },
        target: { x: 315.5, y: 55, z: 50 },
      },
      {
        label: "side-left",
        position: { x: 314.72, y: 114.89, z: -323.39 },
        target: { x: 315.5, y: 55, z: 50 },
      },
      {
        label: "side-right",
        position: { x: 319.45, y: 86.59, z: 426.82 },
        target: { x: 315.5, y: 55, z: 50 },
      },
      {
        label: "top-down",
        position: { x: 315.2, y: 452.43, z: 21.12 },
        target: { x: 315.5, y: 55, z: 50 },
      },
    ];

    console.log(
      `Taking screenshots for ${views.length} views:`,
      JSON.stringify(views, null, 2)
    );

    for (let i = 0; i < views.length; i++) {
      const view = views[i];
      console.log(
        `📸 [${i + 1}/${views.length}] Setting camera: ${view.label}`
      );

      try {
        const success = await page.evaluate(({ position, target }) => {
          if (typeof window.setCameraPosition === "function") {
            window.setCameraPosition(
              position.x,
              position.y,
              position.z,
              target.x,
              target.y,
              target.z
            );
            return true;
          } else {
            console.error("setCameraPosition not found");
            return false;
          }
        }, view);

        if (!success) {
          throw new Error("Camera positioning failed");
        }

        console.log("Waiting for render to complete...");
        await timeout(3000);

        const screenshotPath = `screenshot_${view.label}.png`;
        await page.screenshot({ path: screenshotPath, fullPage: false });
        console.log(`✅ Screenshot saved: ${screenshotPath}`);
      } catch (err) {
        console.error(
          `❌ Error taking screenshot for ${view.label}:`,
          err.message
        );
      }

      await timeout(1000);
    }

    console.log("All screenshots completed!");
  } catch (err) {
    console.error("Fatal error in screenshot process:", err);
    process.exit(1);
  } finally {
    if (browser) {
      console.log("Closing browser...");
      await browser.close();
    }
  }
})();
