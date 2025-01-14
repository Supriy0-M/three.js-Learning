import { Constant } from "./Constant.js";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default class GameScene {
  constructor() {
    this.texture = null;
    this.stack = [];
  }
  AddLayer(x, z, width, depth, direction) {
    const y = Constant.boxHeight * this.stack.length;

    const layer = this.generateBox(x, y, z, width, depth);
    layer.direction = direction;
    this.stack.push(layer);
  }
  generateBox(x, y, z, width, depth) {
    const geometry = new THREE.BoxGeometry(width, Constant.boxHeight, depth);
    const color = new THREE.Color(
      `hsl(${30 + this.stack.length * 4},100%,50%)`
    );
    const material = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);

    Constant.game.add(mesh);

    return {
      threejs: mesh,
      width,
      depth,
    };
  }
  RandomNumberGenerator(_min, _max) {
    return Math.random() * (_max - _min) + _min;
  }
}
