import './styles/styleIndex.css'
import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'

/**
 * HTML DOM elements
 */
const canvas = document.querySelector('.webgl')
const instructions = document.getElementById('instructions')
const blocker = document.getElementById('blocker')
let prevTime = performance.now();

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x181818)

/**
 * Objects
 */
let loader = new THREE.ObjectLoader()

// Molino
let textureWindmill_01 = new THREE.TextureLoader().load("textures/windmill_001_base_COL.jpg")

loader.load("models/windmillModel.json", (group) => {
  let mesh = group.children[0]
  mesh.scale.set(9, 9, 9)
  mesh.material = new THREE.MeshPhongMaterial({ map: textureWindmill_01 })
  // x, y, z position respectively
  group.position.set(-90, 15, 0)
  scene.add(group)
})

// Book
loader.load("models/bookModel.json", (group) => {
  group.scale.set(5, 5, 5)
  group.position.set(-70, -40, 20)
  scene.add(group)
})

// var texture = new THREE.TextureLoader().load("textures/tierra.jpg");
// var texture1 = new THREE.TextureLoader().load("textures/nm.png");

// var geo = new THREE.SphereGeometry(2, 24, 16);
// var materials = new THREE.MeshBasicMaterial({ map: texture });
// var materials = new THREE.MeshPhongMaterial({ color: 0xaaaaaa, specular: 0x333333, shininess: 15, map: texture, normalMap: texture1 });

// var sphere = new THREE.Mesh(geo, materials);
// sphere.position.x = 30;
// sphere.position.y = -30;
// scene.add(sphere);

// loader.load("perro.json", function( group ) {
//   mesh = group.children[0];
//   mesh.material = new THREE.MeshPhongMaterial({color: 0xaaaaaa, specular: 0x333333, shininess: 15, map: texture, normalMap: texture1})
//   mesh.position.x = 5;
//   scene.add( mesh );
// });

// Lago
var texturaLago = new THREE.TextureLoader().load("textures/lago.jpg");
var texturaNormalLago = new THREE.TextureLoader().load("textures/normalLago.png");
loader.load("models/lakeModel.json", (group) => {
  group.scale.set(1.1, 1.5, 1.5)
  group.children[0].material = new THREE.MeshPhongMaterial({ color: 0xaaaaaa, specular: 0x333333, shininess: 15, map: texturaLago, normalMap: texturaNormalLago })
  // group.children[0].material = new THREE.MeshPhongMaterial({ color: 0xaaaaaa, specular: 0x333333, shininess: 15, map: texturaLago })
  group.position.set(100, -40, -110)
  scene.add(group)
})

// Muelle
loader.load("models/muelleModel.json", (group) => {
  group.scale.set(1.6, 1.6, 1.6)
  group.position.set(130, -45, -160)
  // rotation is in radiants
  group.rotation.y = 7 * Math.PI / 6
  scene.add(group)
})

// Demon
loader.load("models/demonModel.json", (group) => {
  group.scale.set(1.5, 1.5, 1.5)
  group.position.set(120, -16.5, -55)
  group.children[0].rotation.y = 5 * Math.PI / 4
  scene.add(group)
})

/**
 * Observer (camera and controls)
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

// Base camera
const camera =
  new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.001, 1000)
scene.add(camera)

// Controls
let moveForward = false
let moveBackward = false
let moveLeft = false
let moveRight = false
let canJump = false
const velocity = new THREE.Vector3()
const direction = new THREE.Vector3()

const controls = new PointerLockControls(camera, canvas)
instructions.addEventListener('click', () => {
  controls.lock()
});

controls.addEventListener('lock', () => {
  instructions.style.display = 'none'
  blocker.style.display = 'none'
});

controls.addEventListener('unlock', () => {
  blocker.style.display = 'block'
  instructions.style.display = ''
});

scene.add(controls.getObject());

const onKeyDown = (event) => {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      moveForward = true
      break

    case 'ArrowLeft':
    case 'KeyA':
      moveLeft = true
      break

    case 'ArrowDown':
    case 'KeyS':
      moveBackward = true
      break

    case 'ArrowRight':
    case 'KeyD':
      moveRight = true
      break

    case 'Space':
      if (canJump === true) velocity.y += 350
      canJump = false
      break;
  }
}

const onKeyUp = (event) => {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      moveForward = false
      break

    case 'ArrowLeft':
    case 'KeyA':
      moveLeft = false
      break

    case 'ArrowDown':
    case 'KeyS':
      moveBackward = false
      break

    case 'ArrowRight':
    case 'KeyD':
      moveRight = false
      break

  }
}

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

/**
 * Light
 */
const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(-20, 20, 20)
scene.add(light)

/**
 * Rendering and Animating the scene
 */
const renderer = new THREE.WebGLRenderer({ canvas: canvas })
renderer.setSize(sizes.width, sizes.height)

/**
 * Responsive sizes
 */
window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const animate = () => {
  // Call this method again on the next frame
  window.requestAnimationFrame(animate)

  // Time
  const time = performance.now()
  const delta = (time - prevTime) / 1000

  // Movement
  velocity.x -= velocity.x * 5.0 * delta
  velocity.z -= velocity.z * 5.0 * delta
  velocity.y -= 9.8 * 150.0 * delta; // 150.0 = mass

  direction.z = Number(moveForward) - Number(moveBackward)
  direction.x = Number(moveRight) - Number(moveLeft)
  direction.normalize() // this ensures consistent movements in all directions

  if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta
  if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta

  controls.moveRight(- velocity.x * delta)
  controls.moveForward(- velocity.z * delta)

  controls.getObject().position.y += (velocity.y * delta) // new behavior
  // y = -23 is the floor, so the camera can't go down this point
  if (controls.getObject().position.y < -23) {
    velocity.y = 0
    controls.getObject().position.y = -23
    canJump = true
  }

  prevTime = time

  // Render
  renderer.render(scene, camera)
}

animate()