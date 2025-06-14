import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function init() {
	let scene = new THREE.Scene();
    let gui = new dat.GUI();

    let cubeMaterial = new THREE.MeshStandardMaterial({
		color: 0xffffff,
        roughness: 0,
        metalness: 1,
	});
    let planeMaterial = new THREE.MeshStandardMaterial({
		color: 0xffffff,
        roughness: 0.2,
		side: THREE.DoubleSide
	});

	let cube = getCube(1, cubeMaterial);
	let plane = getPlane(100, planeMaterial);
    let light1 = getSpotLight(20);
    let light2 = getSpotLight(20);

	plane.rotation.x = Math.PI / 2;
	cube.position.y = cube.geometry.parameters.height / 2;

    light1.position.y = 3;
    light1.position.x = 5;
    light1.position.z = -5;

    light2.position.y = 3;
    light2.position.x = -5;
    light2.position.z = -5;

    let path = "./public/yokohoma/";
    let format = '.jpg';
    let urls = [
        path + 'posx' + format, path + 'negx' + format,
        path + 'posy' + format, path + 'negy' + format,
        path + 'posz' + format, path + 'negz' + format,
    ];
    let reflectionCube = new THREE.CubeTextureLoader().load(urls);

    let loader = new THREE.TextureLoader();
    planeMaterial.map = loader.load('public/textures/brick.jpg');
    planeMaterial.bumpMap = loader.load('public/textures/brick.jpg');
    planeMaterial.roughnessMap = loader.load('public/textures/brick.jpg');
    planeMaterial.envMap = reflectionCube;

    cubeMaterial.map = loader.load('public/textures/gold.jpg');
    cubeMaterial.bumpMap = loader.load('public/textures/gold.jpg');
    cubeMaterial.roughnessMap = loader.load('public/textures/gold.jpg');
    cubeMaterial.envMap = reflectionCube;

    const maps = [ 'map', 'bumpMap', 'roughnessMap' ];
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
	camera.position.x = 1;
	camera.position.y = 2;
	camera.position.z = 5;

	let renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setSize(window.innerWidth, window.innerHeight);

    let controls = new OrbitControls(camera, renderer.domElement);

	document.getElementById('webgl').appendChild(renderer.domElement);
	update(renderer, scene, camera, controls);

    let folder0 = gui.addFolder('box');
    folder0.add(cube.position, 'x', -10, 10);
    folder0.add(cube.position, 'y', 0, 10);
    folder0.add(cube.position, 'z', -10, 10);
    folder0.add(cube.rotation, 'x', 0, Math.PI);
    folder0.add(cube.rotation, 'y', 0, Math.PI);
    folder0.add(cube.rotation, 'z', 0, Math.PI);

    let folder1 = gui.addFolder('light-1');
    folder1.add(light1, 'intensity', 0, 20);
    folder1.add(light1.position, 'x', -10, 10);
    folder1.add(light1.position, 'y', 0, 10);
    folder1.add(light1.position, 'z', -10, 10);

    let folder2 = gui.addFolder('light-2');
    folder2.add(light2, 'intensity', 0, 20);
    folder2.add(light2.position, 'x', -10, 10);
    folder2.add(light2.position, 'y', 0, 10);
    folder2.add(light2.position, 'z', -10, 10);

    let folder3 = gui.addFolder('cube-material');
    folder3.add(cubeMaterial, 'roughness', 0, 1);
    folder3.add(cubeMaterial, 'metalness', 0, 1);
    folder3.open()

    let folder4 = gui.addFolder('plane-material');
    folder4.add(planeMaterial, 'roughness', 0, 1);
    folder4.add(planeMaterial, 'metalness', 0, 1);
    folder4.open()

    return scene
}

function update(renderer, scene, camera, controls) {
    renderer.render(
        scene,
        camera,
    )

    controls.update();

    requestAnimationFrame(function() {
        update(renderer, scene, camera, controls);
    })
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

let scene = init();
