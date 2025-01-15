import "./style.css";
import * as THREE from "three";
import { Constant } from "./js/Constant.js";
import GameScene from "./js/GameScene.js";
import CANNON from "cannon";

const gameScene = new GameScene();

let autopilot;
let gameEnded;
let robotPrecision; // Determines how precise the game is on autopilot
let lastTime;

const init = () => {
  Constant.world = new CANNON.World();
  Constant.world.gravity.set(0, -10, 0);
  Constant.world.broadphase = new CANNON.NaiveBroadphase();
  Constant.world.solver.iterations = 40;

  const canvas = document.querySelector("canvas.webgl");
  Constant.game = new THREE.Scene();

  gameScene.AddLayer(0, 0, Constant.originalBoxSize, Constant.originalBoxSize);
  gameScene.AddLayer(
    -10,
    0,
    Constant.originalBoxSize,
    Constant.originalBoxSize,
    "x"
  );
  // Scene
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  // Base camera
  const width = 10;
  const height = width * (window.innerHeight / window.innerWidth);
  Constant.camera = new THREE.OrthographicCamera(
    width / -2, //left
    width / 2, // right
    height / 2, //top
    height / -2, //bottom
    1,
    100
  );
  Constant.camera.position.set(4, 4, 4);
  Constant.camera.lookAt(0, 0, 0);
  Constant.game.add(Constant.camera);

  //ambient Light
  Constant.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  Constant.game.add(Constant.ambientLight);

  //directional light
  Constant.directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
  Constant.directionalLight.position.set(10, 20, 0);
  Constant.directionalLight.castShadow = true;
  Constant.game.add(Constant.directionalLight);
  /**
   * Renderer
   */
  Constant.renderer = new THREE.WebGLRenderer({
    canvas: canvas,
  });
  Constant.renderer.setSize(sizes.width, sizes.height);
  Constant.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
};

init();

/**
 * Animate
 */
// const clock = new THREE.Clock();

window.addEventListener("click", () => {
  if (!Constant.isGameStarted) {
    Constant.renderer.setAnimationLoop(animation);
    Constant.isGameStarted = true;
  } else {
    const topLayer = gameScene.stack[gameScene.stack.length - 1];
    const previousLayer = gameScene.stack[gameScene.stack.length - 2];
    const direction = topLayer.direction;

    const delta =
      topLayer.threejs.position[direction] -
      previousLayer.threejs.position[direction];

    console.log("nextDirection", delta);

    const overhangSize = Math.abs(delta);
    const size = direction == "x" ? topLayer.width : topLayer.depth;

    const overlap = size - overhangSize;

    if (overlap > 0) {
      //cut layer
      const newWidth = direction == "x" ? overlap : topLayer.width;
      const newDepth = direction == "z" ? overlap : topLayer.depth;

      topLayer.width = newWidth;
      topLayer.depth = newDepth;

      //updated three.js model
      topLayer.threejs.scale[direction] = overlap / size;
      topLayer.threejs.position[direction] -= delta / 2;

      //overhang
      const overhangShift = (overlap / 2 + overhangSize / 2) * Math.sign(delta);
      const overhangX =
        direction == "x"
          ? topLayer.threejs.position.x + overhangShift
          : topLayer.threejs.position.x;

      const overhangZ =
        direction == "z"
          ? topLayer.threejs.position.z + overhangShift
          : topLayer.threejs.position.z;

      const overhangWidth = direction == "x" ? overhangSize : newWidth;
      const overhangDepth = direction == "z" ? overhangSize : newDepth;

      gameScene.AddOverHang(overhangX, overhangZ, overhangWidth, overhangDepth);

      //next layer
      nextX = direction == "x" ? topLayer.threejs.position.x : -10;
      nextZ = direction == "z" ? topLayer.threejs.position.z : -10;
      const newDirection = "x" ? "z" : "x";

      gameScene.AddLayer(nextX, nextZ, newWidth, newDepth, newDirection);
    }
  }
});

const animation = () => {
  if (lastTime) {
    const timePassed = time - lastTime;
    const speed = 0.008;

    const topLayer = stack[stack.length - 1];
    const previousLayer = stack[stack.length - 2];

    // The top level box should move if the game has not ended AND
    // it's either NOT in autopilot or it is in autopilot and the box did not yet reach the robot position
    const boxShouldMove =
      !gameEnded &&
      (!autopilot ||
        (autopilot &&
          topLayer.threejs.position[topLayer.direction] <
            previousLayer.threejs.position[topLayer.direction] +
              robotPrecision));

    if (boxShouldMove) {
      // Keep the position visible on UI and the position in the model in sync
      topLayer.threejs.position[topLayer.direction] += speed * timePassed;
      topLayer.cannonjs.position[topLayer.direction] += speed * timePassed;

      // If the box went beyond the stack then show up the fail screen
      if (topLayer.threejs.position[topLayer.direction] > 10) {
        missedTheSpot();
      }
    } else {
      // If it shouldn't move then is it because the autopilot reached the correct position?
      // Because if so then next level is coming
      if (autopilot) {
        splitBlockAndAddNextOneIfOverlaps();
        setRobotPrecision();
      }
    }

    // 4 is the initial camera height
    if (camera.position.y < boxHeight * (stack.length - 2) + 4) {
      camera.position.y += speed * timePassed;
    }

    updatePhysics(timePassed);
    renderer.render(scene, camera);
  }
  lastTime = time;
};
window.addEventListener("resize", () => {
  // Adjust camera
  console.log("resize", window.innerWidth, window.innerHeight);
  const aspect = window.innerWidth / window.innerHeight;
  const width = 10;
  const height = width / aspect;

  camera.top = height / 2;
  camera.bottom = height / -2;

  // Reset renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
});
