import * as THREE from "three";
import GUI from "lil-gui";
import { gsap } from "gsap";

/**
 * Debug
 */
const gui = new GUI();

const parameters = {
  materialColor: "#ffeded",
};

gui.addColor(parameters, "materialColor").onChange(() => {
  material.color.set(parameters.materialColor);
});

/**
 * Base
 */
const domSections = document.querySelectorAll(".section");

domSections.forEach((section) => {
  // We check for h1 OR h2 just in case
  const title = section.querySelector("h1, h2");

  if (title) {
    const text = title.textContent;
    title.innerHTML = "";
    const letters = text.split("");

    letters.forEach((letter) => {
      const span = document.createElement("span");
      span.textContent = letter;
      // Preserve spaces
      if (letter === " ") span.style.marginRight = "0.5em";
      // Allow GSAP to animate these
      span.style.display = "inline-block";
      title.append(span);
    });
  }
});
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

const obj1 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material);
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
const directionLight = new THREE.DirectionalLight(0xffffff, 3);
directionLight.position.set(1, 1, 0);
scene.add(directionLight);

// Particles
// Particle positions
const particleCount = 200;
const position = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  position[i * 3 + 0] = (Math.random() - 0.5) * 10;
  position[i * 3 + 1] = objDistance * 0.5 - Math.random() * objDistance * 3;
  position[i * 3 + 2] = (Math.random() - 0.5) * 10;
}
//console.log(position);

// Particle Geomery
const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(position, 3),
);
const particleMaterial = new THREE.PointsMaterial({
  size: 0.03,
  sizeAttenuation: true,
  // depthWrite: false,
  // blending: THREE.AdditiveBlending,
  // vertexColors: true,
  color: parameters.materialColor,
});
const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

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

const sectionObjs = [obj1, obj2, obj3];

// Check user scroll
let scrollY = window.scrollY;
let currentSection = 0;
const animateSection = (index) => {
  const activeSection = domSections[index];
  const activeTitle = activeSection.querySelector("h1, h2");

  if (activeTitle) {
    const letters = activeTitle.querySelectorAll("span");
    gsap.killTweensOf(letters);
    gsap.fromTo(
      letters,
      { opacity: 0, y: 50, rotateX: 90 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: "back.out(1.7)",
      },
    );
  }
};

// 1. Run animation for the first section immediately on load
animateSection(0);

/**
 * Scroll Logic
 */
window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
  const newSection = Math.round(scrollY / sizes.height);

  if (currentSection != newSection) {
    currentSection = newSection;

    // Animate 3D Object
    gsap.to(sectionObjs[currentSection].rotation, {
      duration: 1.5,
      ease: "power2.inOut",
      x: "+=6",
      y: "+=3",
      z: "+=1.5",
    });

    // 2. Call our helper function for text
    animateSection(currentSection);
  }
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
