import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";
import { SceneManager } from "./SceneManager";

export class PackingViewer {
  constructor(containerId) {
    this.sceneManager = new SceneManager(containerId);
    this.dimensionsVisible = false;
    this.dimensionLabels = new Set();
    this.originalSceneCount = 0;
    window.addEventListener("resize", this.onWindowResize.bind(this), false);
  }

  toggleDimensions() {
    this.dimensionsVisible = !this.dimensionsVisible;
    this.dimensionLabels.forEach((label) => {
      label.visible = this.dimensionsVisible;
    });
  }

  addDimensionLabels(object, dimensions) {
    const edges = [
      { axis: "x", color: "red", size: dimensions.length },
      { axis: "z", color: "green", size: dimensions.width },
      { axis: "y", color: "blue", size: dimensions.height },
    ];

    // Get object's position (center)
    const position = object.position;

    edges.forEach(({ axis, color, size }) => {
      const label = document.createElement("div");
      label.className = "dimension-label";

      // Calculate actual min/max coordinates (from corner, not center)
      const min = position[axis] - size / 2;
      const max = position[axis] + size / 2;
      label.textContent = `${axis}: ${min.toFixed(1)} to ${max.toFixed(1)}`;

      label.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
      label.style.padding = "2px 5px";
      label.style.borderRadius = "3px";
      label.style.fontSize = "12px";
      label.style.color = color;

      const labelObject = new CSS2DObject(label);
      labelObject.position.set(0, 0, 0); // Position at center, will be adjusted below

      // Position labels along the appropriate axis
      switch (axis) {
        case "x":
          labelObject.position.set(0, -size / 2, -size / 2);
          break;
        case "y":
          labelObject.position.set(-size / 2, 0, -size / 2);
          break;
        case "z":
          labelObject.position.set(-size / 2, -size / 2, 0);
          break;
      }

      object.add(labelObject);
      labelObject.visible = this.dimensionsVisible;
      this.dimensionLabels.add(labelObject);
    });
  }

  loadSimulation(simData) {
    console.log("Starting to load simulation with data:", simData);

    // Clear existing scenes
    this.sceneManager.scenes = [];

    // Create a scene for each truck
    simData.trucks.forEach((truckData, index) => {
      console.log(`Creating scene for truck ${index}:`, truckData);
      const scene = this.sceneManager.createScene();
      this.sceneManager.scenes.push(scene);

      // Add truck to scene
      const truck = this.createTruck(truckData.dimensions);
      scene.add(truck);

      // Add all items to the truck
      truckData.loaded_items.forEach((itemData) => {
        console.log("Creating item:", itemData);
        const item = this.createItem(itemData);
        if (!item) {
          console.log("Failed to create item!");
          return;
        }
        if (itemData.type === "compound") {
          console.log(
            "Created compound item with position:",
            item.position,
            "and children:",
            item.children.length
          );
        }
        scene.add(item);
      });

      // At the end of loadSimulation(simData)
      this.sceneManager.render(); // already exists
      console.log("Finished loading simulation");
    });

    // Store the number of truck scenes
    this.originalSceneCount = this.sceneManager.scenes.length;

    // Start rendering
    this.sceneManager.render();
    console.log("Finished loading simulation");

    // 👇 Add this:
    if (this.sceneManager.deferLookAtCenter) {
      const scene = this.sceneManager.getCurrentScene();
      const truck = scene.children.find(
        (obj) => obj.geometry?.type === "BoxGeometry"
      );

      if (!truck) {
        console.warn("❌ No truck found to center camera on.");
        return;
      }

      const box = new THREE.Box3().setFromObject(truck);
      const center = new THREE.Vector3();
      box.getCenter(center);

      this.sceneManager.controls.target.copy(center);
      this.sceneManager.controls.update();

      this.sceneManager.camera.position.set(
        center.x + 3000,
        center.y + 1000,
        center.z + 3000
      );
    }
  }

  createTruck(dimensions) {
    const geometry = new THREE.BoxGeometry(
      dimensions.length, // X (length)
      dimensions.height, // Y (height)
      dimensions.width // Z (width)
    );

    const material = new THREE.MeshPhongMaterial({
      color: 0x808080,
      opacity: 0.3,
      transparent: true,
      wireframe: false,
    });

    const truck = new THREE.Mesh(geometry, material);

    // Add edges
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x000000,
      linewidth: 2,
    });
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    truck.add(wireframe);

    // Position truck so its bottom-front-left corner is at origin
    truck.position.set(
      dimensions.length / 2, // Center in X
      dimensions.height / 2, // Center in Y
      dimensions.width / 2 // Center in Z
    );
    return truck;
  }

  createItem(itemData) {
    let geometry;
    let dimensions;

    if (itemData.type === "box") {
      dimensions = itemData.dimensions;
      geometry = new THREE.BoxGeometry(
        dimensions.length, // X
        dimensions.height, // Y
        dimensions.width // Z
      );
    } else if (itemData.type === "cylinder") {
      dimensions = {
        length: itemData.diameter,
        width: itemData.diameter,
        height: itemData.height,
      };
      geometry = new THREE.CylinderGeometry(
        itemData.diameter / 2,
        itemData.diameter / 2,
        itemData.height,
        32
      );
      // No need to rotate cylinder anymore since Y is up
      // geometry.rotateX(Math.PI / 2);  // Remove this line
    } else if (itemData.type === "compound") {
      return this.createCompoundItem(itemData);
    }

    const material = new THREE.MeshPhongMaterial({
      color: Math.random() * 0xffffff,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });

    const item = new THREE.Mesh(geometry, material);

    // Position the item so its bottom-front-left corner is at the specified position
    if (Array.isArray(itemData.position)) {
      item.position.set(
        itemData.position[0] + dimensions.length / 2,
        itemData.position[2] + dimensions.height / 2, // Swap Y and Z
        itemData.position[1] + dimensions.width / 2
      );
    }

    // Add edges
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x000000,
      linewidth: 1,
    });
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    item.add(wireframe);

    // Add dimension labels
    this.addDimensionLabels(item, dimensions);

    // Set rotation
    if (Array.isArray(itemData.rotation)) {
      item.rotation.set(
        itemData.rotation[0],
        itemData.rotation[1],
        itemData.rotation[2]
      );
    } else if (itemData.rotation) {
      item.rotation.set(
        itemData.rotation.x || 0,
        itemData.rotation.y || 0,
        itemData.rotation.z || 0
      );
    }

    item.renderOrder = 1;
    wireframe.renderOrder = 2;

    return item;
  }

  createCompoundItem(itemData) {
    console.log("Creating compound item:", itemData);
    const group = new THREE.Group();

    // First position the group's origin at the specified position
    if (Array.isArray(itemData.position)) {
      console.log("Setting compound item position to:", itemData.position);
      group.position.set(
        itemData.position[0],
        itemData.position[2], // Swap Y and Z
        itemData.position[1]
      );
    }

    // Add each sub-item, positioned relative to the group's origin
    itemData.items.forEach((subItem, index) => {
      console.log("Creating sub-item", index + ":", subItem);
      const item = this.createItem(subItem);
      const relativePos = itemData.relative_positions[index];

      if (Array.isArray(relativePos)) {
        // Get dimensions based on item type
        let subDimensions;
        if (subItem.type === "box") {
          subDimensions = subItem.dimensions;
        } else if (subItem.type === "cylinder") {
          subDimensions = {
            length: subItem.diameter,
            width: subItem.diameter,
            height: subItem.height,
          };
        } else {
          console.log("Unknown sub-item type:", subItem.type);
          return;
        }

        console.log(
          "Setting sub-item position. RelativePos:",
          relativePos,
          "Dimensions:",
          subDimensions
        );

        item.position.set(
          relativePos[0] + subDimensions.length / 2,
          relativePos[2] + subDimensions.height / 2, // Swap Y and Z
          relativePos[1] + subDimensions.width / 2
        );
        console.log("Final sub-item position:", item.position);
      }
      group.add(item);
    });

    // Apply rotation after all items are positioned
    if (Array.isArray(itemData.rotation)) {
      console.log("Applying rotation:", itemData.rotation);
      group.rotation.set(
        itemData.rotation[0],
        itemData.rotation[2], // Swap Y and Z rotations
        itemData.rotation[1]
      );
    }

    return group;
  }

  onWindowResize() {
    this.sceneManager.onWindowResize();
  }

  nextTruck() {
    // Don't advance beyond last truck scene
    if (this.sceneManager.currentSceneIndex >= this.originalSceneCount - 1) {
      return false;
    }
    const result = this.sceneManager.nextScene();
    this.updateUIControls();
    return result;
  }

  previousTruck() {
    const result = this.sceneManager.previousScene();
    this.updateUIControls();
    return result;
  }

  createUnplacedItemsScene(unplacedItems) {
    // Don't create if we're already showing unplaced items
    if (
      this.sceneManager.currentSceneIndex ===
        this.sceneManager.scenes.length - 1 &&
      this.sceneManager.scenes.length > this.originalSceneCount
    ) {
      return false;
    }

    console.log("Creating unplaced items scene:", unplacedItems);
    const scene = this.sceneManager.createScene(false); // Don't add floor

    // Position items along X axis with spacing
    const spacing = 3; // Space between items
    let currentX = 0;

    unplacedItems.forEach((itemData) => {
      // Create a copy of itemData with position removed
      const itemDataCopy = { ...itemData };
      delete itemDataCopy.position; // Remove any existing position

      const item = this.createItem(itemDataCopy);
      if (!item) {
        console.log("Failed to create unplaced item!");
        return;
      }

      // Get item dimensions to calculate spacing
      let dimensions;
      if (itemData.type === "box") {
        dimensions = itemData.dimensions;
      } else if (itemData.type === "cylinder") {
        dimensions = {
          length: itemData.diameter,
          width: itemData.diameter,
          height: itemData.height,
        };
      } else if (itemData.type === "compound") {
        // For compound items, use the first sub-item's dimensions as reference
        const firstItem = itemData.items[0];
        dimensions =
          firstItem.type === "box"
            ? firstItem.dimensions
            : {
                length: firstItem.diameter,
                width: firstItem.diameter,
                height: firstItem.height,
              };
      }

      // Position item along X axis
      item.position.set(
        currentX + dimensions.length / 2,
        dimensions.height / 2, // Center vertically
        dimensions.width / 2 // Center in Z
      );

      scene.add(item);

      // Update X position for next item
      currentX += dimensions.length + spacing;
    });

    // Add scene and switch to it
    this.sceneManager.scenes.push(scene);
    this.sceneManager.currentSceneIndex = this.sceneManager.scenes.length - 1;
    this.sceneManager.render();

    this.updateUIControls();
    return true;
  }

  showTruckScenes() {
    // Remove unplaced items scene if it exists
    if (this.sceneManager.scenes.length > this.originalSceneCount) {
      this.sceneManager.scenes.pop();
    }
    // Return to first truck scene
    this.sceneManager.currentSceneIndex = 0;
    this.sceneManager.render();
    this.updateUIControls();
  }

  updateUIControls() {
    const isUnplacedScene =
      this.sceneManager.currentSceneIndex ===
        this.sceneManager.scenes.length - 1 &&
      this.sceneManager.scenes.length > this.originalSceneCount;

    document.querySelector(".truck-controls").style.display = isUnplacedScene
      ? "none"
      : "block";
    document.querySelector(".unplaced-controls").style.display = isUnplacedScene
      ? "block"
      : "none";
  }

  setCameraPosition(x, y, z, lookAtX, lookAtY, lookAtZ) {
    const camera = this.sceneManager?.camera;
    const controls = this.sceneManager?.controls;

    if (!camera || !controls) {
      console.warn("Camera or controls not found");
      return;
    }

    camera.position.set(x, y, z);
    camera.lookAt(new THREE.Vector3(lookAtX, lookAtY, lookAtZ));

    controls.target.set(lookAtX, lookAtY, lookAtZ);
    controls.update();

    console.log(`📸 Camera position set to: (${x}, ${y}, ${z})`);
    console.log(
      `🎯 Camera target set to: (${lookAtX}, ${lookAtY}, ${lookAtZ})`
    );
  }
}
