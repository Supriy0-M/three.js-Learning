import "./style.css";
import * as THREE from "three";
import { Constant } from "./js/Constant.js";
import GameScene from "./js/GameScene.js";

const gameScene = new GameScene();

const init = () => {
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
  }
});

const animation = () => {
  const topLayer = gameScene.stack[gameScene.stack.length - 1];
  topLayer.threejs.position[topLayer.direction] += Constant.speed;
  if (
    Constant.camera.position.y <
    Constant.boxHeight * (gameScene.stack.length - 2) + 4
  ) {
    Constant.camera.position.y += Constant.speed;
  }
  Constant.renderer.render(Constant.game, Constant.camera);
};
