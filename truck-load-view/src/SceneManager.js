import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  CSS2DObject,
  CSS2DRenderer,
} from "three/examples/jsm/renderers/CSS2DRenderer";

export class SceneManager {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scenes = [];
    this.currentSceneIndex = 0;
    this.setupRenderer();
    this.setupLabelRenderer();
    this.setupCamera();
    this.setupLights();
    this.setupControls();
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);
  }

  setupLabelRenderer() {
    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.labelRenderer.domElement.style.position = "absolute";
    this.labelRenderer.domElement.style.top = "0";
    this.labelRenderer.domElement.style.pointerEvents = "none";
    this.container.appendChild(this.labelRenderer.domElement);
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100000
    );
    this.camera.position.set(3000, 1000, 3000); // or any large position to start

    // Delay camera lookAt until the scene is loaded
    this.deferLookAtCenter = true;
  }

  setupLights() {
    this.lights = {
      ambient: new THREE.AmbientLight(0x404040),
      directional: new THREE.DirectionalLight(0xffffff, 0.5),
    };
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 100000;
  }

  createScene(addFloor = true) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(-10, 10, -10);
    scene.add(light);

    const light2 = new THREE.DirectionalLight(0xffffff, 1);
    light2.position.set(10, 10, 10);
    scene.add(light2);

    // Add floor only if requested
    if (addFloor) {
      const planeGeometry = new THREE.PlaneGeometry(2000, 2000);
      const planeMaterial = new THREE.MeshPhongMaterial({
        color: 0xcccccc,
        opacity: 0.5,
        transparent: true,
      });
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = 0;
      scene.add(plane);
    }

    return scene;
  }

  addGroundAndGrid(scene) {
    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundMaterial = new THREE.MeshPhongMaterial({
      color: 0xcccccc,
      side: THREE.DoubleSide,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Grid helper
    const gridHelper = new THREE.GridHelper(1000, 100, 0x555555, 0x555555);
    gridHelper.material.opacity = 0.8;
    gridHelper.material.transparent = true;
    gridHelper.material.linewidth = 1;
    scene.add(gridHelper);
  }

  addAxisHelper(scene) {
    // Create an axis helper
    const axisHelper = new THREE.AxesHelper(5);
    // X axis is red, Y axis is green, Z axis is blue
    scene.add(axisHelper);

    // Add labels for the axes
    const createAxisLabel = (text, position, color) => {
      const div = document.createElement("div");
      div.className = "axis-label";
      div.textContent = text;
      div.style.color = color;
      div.style.fontWeight = "bold";

      const label = new CSS2DObject(div);
      label.position.copy(position);
      return label;
    };

    // Create labels for each axis
    const xLabel = createAxisLabel("X", new THREE.Vector3(6, 0, 0), "red");
    const yLabel = createAxisLabel("Y", new THREE.Vector3(0, 6, 0), "green");
    const zLabel = createAxisLabel("Z", new THREE.Vector3(0, 0, 6), "blue");

    scene.add(xLabel);
    scene.add(yLabel);
    scene.add(zLabel);
  }

  nextScene() {
    if (this.currentSceneIndex < this.scenes.length - 1) {
      this.currentSceneIndex++;
      return true;
    }
    return false;
  }

  previousScene() {
    if (this.currentSceneIndex > 0) {
      this.currentSceneIndex--;
      return true;
    }
    return false;
  }

  getCurrentScene() {
    return this.scenes[this.currentSceneIndex];
  }

  render() {
    requestAnimationFrame(this.render.bind(this));
    this.controls.update();
    const currentScene = this.getCurrentScene();
    if (currentScene) {
      this.renderer.render(currentScene, this.camera);
      this.labelRenderer.render(currentScene, this.camera);
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.labelRenderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
  }
}
