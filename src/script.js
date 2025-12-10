import * as THREE from "three";
import GUI from "lil-gui";

/**
 * Debug
 */
const gui = new GUI();

const parameters = {
  materialColor: "#ffeded",
};

gui.addColor(parameters, "materialColor");

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// texture
const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load("/textures/gradients/5.jpg");
gradientTexture.magFilter = THREE.NearestFilter;

// materials
const material = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: gradientTexture,
});

/**
 * Objects
 */
const objDistance = 4;

const obj1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), material);
const obj2 = new THREE.Mesh(new THREE.CapsuleGeometry(1, 1, 4, 8), material);
const obj3 = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), material);
scene.add(obj1, obj2, obj3);

// Objects positions
obj1.position.y = -objDistance * 0;
obj2.position.y = -objDistance * 1;
obj3.position.y = -objDistance * 2;

obj1.position.x = -2;
obj2.position.x = 2;
obj3.position.x = -2;

// lights
const directionLight = new THREE.DirectionalLight("ffffff", 3);
directionLight.position.set(1, 1, 0);
scene.add(directionLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const cameraGp = new THREE.Group();
scene.add(cameraGp);
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100,
);
camera.position.z = 6;
cameraGp.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Check user scroll
let scrollY = window.scrollY;
window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
});

// Check user mouse Move
let cursor = {
  x: 0,
  y: 0,
};
window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Animate Objects
  obj1.rotation.x = elapsedTime * 0.1;
  obj1.rotation.y = elapsedTime * 0.12;

  obj2.rotation.x = -elapsedTime * 0.1;
  obj2.rotation.y = -elapsedTime * 0.12;

  obj3.rotation.x = elapsedTime * 0.1;
  obj3.rotation.y = elapsedTime * 0.12;

  let parallaxX = cursor.x * 0.5;
  let parallaxY = -cursor.y * 0.5;
  // easing + parallax
  cameraGp.position.x += (parallaxX - cameraGp.position.x) * deltaTime * 5;
  cameraGp.position.y += (parallaxY - cameraGp.position.y) * deltaTime * 5;

  // Move Camera as scroll
  camera.position.y = -(scrollY / sizes.height) * objDistance;

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
