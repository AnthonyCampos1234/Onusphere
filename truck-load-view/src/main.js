import "./styles.css";
import { PackingViewer } from "./viewer";

document.addEventListener("DOMContentLoaded", async () => {
  const viewer = new PackingViewer("viewer");
  window.viewer = viewer;
  let simData = null;
  const isScreenshotMode = window.IS_SCREENSHOT_MODE === true;

  // Hide UI if in screenshot mode
  if (isScreenshotMode) {
    [
      "prev-truck",
      "next-truck",
      "back-to-trucks",
      "toggle-dimensions",
      "view-unplaced",
      "refresh-simulation",
      "placement-form",
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });
  }

  // Load initial simulation data
  try {
    const response = await fetch(
      "http://localhost:8000/packing/simulations/sim1.json"
    );
    console.log("Fetch status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    simData = await response.json();
    console.log("Loaded simulation data:", simData);

    if (!simData.trucks || simData.trucks.length === 0) {
      throw new Error("Simulation contains no trucks.");
    }

    viewer.loadSimulation(simData);
    viewer.simulationLoaded = true;
    console.log("✅ viewer.simulationLoaded set to true");
  } catch (error) {
    console.error("❌ Failed to load simulation:", error);
    alert(`Error loading simulation: ${error.message}`);
  }

  // Skip all interactions in screenshot mode
  if (!isScreenshotMode) {
    document.getElementById("prev-truck")?.addEventListener("click", () => {
      viewer.previousTruck();
    });

    document.getElementById("next-truck")?.addEventListener("click", () => {
      viewer.nextTruck();
    });

    document.getElementById("back-to-trucks")?.addEventListener("click", () => {
      viewer.showTruckScenes();
    });

    document
      .getElementById("toggle-dimensions")
      ?.addEventListener("click", () => {
        viewer.toggleDimensions();
      });

    document.getElementById("view-unplaced")?.addEventListener("click", () => {
      if (!simData || !simData.unplaced_items) {
        console.log("No unplaced items to display");
        return;
      }
      viewer.createUnplacedItemsScene(simData.unplaced_items);
    });

    const refreshButton = document.getElementById("refresh-simulation");
    if (refreshButton) {
      refreshButton.addEventListener("click", async () => {
        const loadingIndicator = document.getElementById("loading-indicator");
        if (loadingIndicator) loadingIndicator.style.display = "block";

        await window.updateState();

        if (loadingIndicator) loadingIndicator.style.display = "none";
      });
    }

    document
      .getElementById("placement-form")
      ?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const placementData = {
          item_id: parseInt(document.getElementById("item-id").value),
          truck_id: parseInt(document.getElementById("truck-id").value),
          position: [
            parseFloat(document.getElementById("pos-x").value),
            parseFloat(document.getElementById("pos-y").value),
            parseFloat(document.getElementById("pos-z").value),
          ],
          rotation: [
            parseFloat(document.getElementById("rot-x").value),
            parseFloat(document.getElementById("rot-y").value),
            parseFloat(document.getElementById("rot-z").value),
          ],
        };

        try {
          const response = await fetch(
            "http://localhost:8000/packing/place_item",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(placementData),
            }
          );

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to place item");
          }

          await window.updateState();
        } catch (error) {
          console.error("Error placing item:", error);
          alert("Failed to place item: " + error.message);
        }
      });
  }

  // Shared functions (regardless of mode)
  window.updateState = async function () {
    try {
      const response = await fetch("http://localhost:8000/packing/get_state");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedData = await response.json();
      console.log("Fetched updated simulation data:", updatedData);

      if (!updatedData.trucks || !Array.isArray(updatedData.trucks)) {
        throw new Error("Invalid simulation data format");
      }

      simData = updatedData;
      viewer.loadSimulation(simData);
      return true;
    } catch (error) {
      console.error("Failed to update simulation state:", error);
      alert(`Error updating simulation: ${error.message}`);
      return false;
    }
  };

  window.setCameraPosition = (...args) => {
    if (window.viewer?.setCameraPosition) {
      window.viewer.setCameraPosition(...args);
    } else {
      console.error("❌ viewer.setCameraPosition not found");
    }
  };

  const originalSetCameraAngle = window.setCameraAngle;
  window.setCameraAngle = function (angle, distance = 400) {
    console.log(
      `setCameraAngle called with angle=${angle}, distance=${distance}`
    );
    if (typeof originalSetCameraAngle === "function") {
      try {
        originalSetCameraAngle(angle, distance);
        console.log(`setCameraAngle executed successfully`);
      } catch (error) {
        console.error(`Error in setCameraAngle:`, error);
        throw error;
      }
    } else {
      console.error("Original setCameraAngle function not found");
    }
  };
});
