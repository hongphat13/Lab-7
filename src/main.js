import * as THREE from "three";
import { OrbitControls } from "./OrbitControls.js"; // Đã thay đổi: Sử dụng tệp OrbitControls cục bộ

function init() {
  let scene = new THREE.Scene();

  let cubeMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0,
    metalness: 1,
  });
  let planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.2,
    side: THREE.DoubleSide,
  });

  let cube = getCube(1, cubeMaterial);
  let plane = getPlane(100, planeMaterial);
  let light1 = getSpotLight(20);
  let light2 = getSpotLight(20);

  plane.rotation.x = Math.PI / 2;
  cube.position.y = 0.5; // Giá trị ban đầu

  light1.position.y = 3;
  light1.position.x = 5;
  light1.position.z = -5;

  light2.position.y = 3;
  light2.position.x = -5;
  light2.position.z = -5;

  let path = "./public/SwedishRoyalCastle/";
  let format = ".jpg";
  let urls = [
    path + "posx" + format,
    path + "negx" + format,
    path + "posy" + format,
    path + "negy" + format,
    path + "posz" + format,
    path + "negz" + format,
  ];
  let reflectionCube = new THREE.CubeTextureLoader().load(urls);

  let loader = new THREE.TextureLoader();
  planeMaterial.map = loader.load("public/textures/stone-wall-texture.jpg");
  planeMaterial.bumpMap = loader.load("public/textures/stone-wall-texture.jpg");
  planeMaterial.roughnessMap = loader.load(
    "public/textures/stone-wall-texture.jpg"
  );
  planeMaterial.envMap = reflectionCube;

  cubeMaterial.map = loader.load("public/textures/Diamond.jpg");
  cubeMaterial.bumpMap = loader.load("public/textures/Diamond.jpg");
  cubeMaterial.roughnessMap = loader.load("public/textures/Diamond.jpg");
  cubeMaterial.envMap = reflectionCube;

  const maps = ["map", "bumpMap", "roughnessMap"];
  maps.forEach((mapName) => {
    const texture = planeMaterial[mapName];
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(15, 15);
  });

  scene.background = reflectionCube;

  scene.add(plane);
  scene.add(cube);
  scene.add(light1);
  scene.add(light2);

  let camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(1, 2, 5);

  let renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.setSize(window.innerWidth, window.innerHeight);

  let controls = new OrbitControls(camera, renderer.domElement);

  document.getElementById("webgl").appendChild(renderer.domElement);

  // --- Thiết lập bảng điều khiển mới ---
  setupCustomControls({ cube, light1, light2, cubeMaterial, planeMaterial });

  update(renderer, scene, camera, controls);

  return scene;
}

function setupCustomControls(assets) {
  const { cube, light1, light2, cubeMaterial, planeMaterial } = assets;

  // Logic cho các mục có thể thu gọn/mở rộng
  document.querySelectorAll(".section-header").forEach((header) => {
    header.addEventListener("click", () => {
      header.parentElement.classList.toggle("open");
    });
  });

  // Hàm trợ giúp để liên kết thanh trượt với thuộc tính
  function linkControl(inputId, valueId, target, property, isFloat = true) {
    const input = document.getElementById(inputId);
    const valueSpan = document.getElementById(valueId);
    input.addEventListener("input", (e) => {
      const value = isFloat
        ? parseFloat(e.target.value)
        : parseInt(e.target.value);
      target[property] = value;
      valueSpan.textContent = value.toFixed(isFloat ? 2 : 0);
    });
  }

  // Liên kết điều khiển khối hộp
  linkControl("cube-pos-x", "cube-pos-x-val", cube.position, "x");
  linkControl("cube-pos-y", "cube-pos-y-val", cube.position, "y");
  linkControl("cube-pos-z", "cube-pos-z-val", cube.position, "z");
  linkControl("cube-rot-x", "cube-rot-x-val", cube.rotation, "x");
  linkControl("cube-rot-y", "cube-rot-y-val", cube.rotation, "y");
  linkControl("cube-rot-z", "cube-rot-z-val", cube.rotation, "z");

  // Liên kết điều khiển ánh sáng 1
  linkControl(
    "light1-intensity",
    "light1-intensity-val",
    light1,
    "intensity",
    false
  );
  linkControl("light1-pos-x", "light1-pos-x-val", light1.position, "x");
  linkControl("light1-pos-y", "light1-pos-y-val", light1.position, "y");
  linkControl("light1-pos-z", "light1-pos-z-val", light1.position, "z");

  // Liên kết điều khiển ánh sáng 2
  linkControl(
    "light2-intensity",
    "light2-intensity-val",
    light2,
    "intensity",
    false
  );
  linkControl("light2-pos-x", "light2-pos-x-val", light2.position, "x");
  linkControl("light2-pos-y", "light2-pos-y-val", light2.position, "y");
  linkControl("light2-pos-z", "light2-pos-z-val", light2.position, "z");

  // Liên kết điều khiển material
  linkControl(
    "plane-roughness",
    "plane-roughness-val",
    planeMaterial,
    "roughness"
  );
  linkControl(
    "plane-metalness",
    "plane-metalness-val",
    planeMaterial,
    "metalness"
  );
  linkControl(
    "cube-roughness",
    "cube-roughness-val",
    cubeMaterial,
    "roughness"
  );
  linkControl(
    "cube-metalness",
    "cube-metalness-val",
    cubeMaterial,
    "metalness"
  );

  // Logic Upload Texture
  const uploader = document.getElementById("texture-uploader");
  const textureLoader = new THREE.TextureLoader();

  document.getElementById("upload-plane-btn").addEventListener("click", () => {
    uploader.targetMaterial = planeMaterial;
    uploader.click();
  });
  document.getElementById("upload-cube-btn").addEventListener("click", () => {
    uploader.targetMaterial = cubeMaterial;
    uploader.click();
  });

  uploader.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    const url = URL.createObjectURL(file);
    textureLoader.load(url, (newTexture) => {
      const material = uploader.targetMaterial;
      if (material === planeMaterial) {
        newTexture.wrapS = THREE.RepeatWrapping;
        newTexture.wrapT = THREE.RepeatWrapping;
        newTexture.repeat.set(15, 15);
      }
      material.map = newTexture;
      material.bumpMap = newTexture;
      material.roughnessMap = newTexture;
      material.needsUpdate = true;
      URL.revokeObjectURL(url);
    });
    this.value = "";
  });
}

function update(renderer, scene, camera, controls) {
  renderer.render(scene, camera);
  controls.update();
  requestAnimationFrame(() => update(renderer, scene, camera, controls));
}

function getSpotLight(intensity) {
  let light = new THREE.SpotLight(0xffffff, intensity);
  light.castShadow = true;
  light.penumbra = 0.5;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  light.shadow.bias = 0.001;
  return light;
}

function getCube(size, material) {
  let geometry = new THREE.BoxGeometry(size, size, size);
  let mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  return mesh;
}

function getPlane(size, material) {
  let geometry = new THREE.PlaneGeometry(size, size);
  let mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  return mesh;
}

init();
