import { Constant } from "./Constant.js";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import CANNON from "cannon";

export default class GameScene {
  constructor() {
    this.texture = null;
    this.stack = [];

    this.overhangs = [];
  }
  AddLayer(x, z, width, depth, direction,false) {
    const y = Constant.boxHeight * this.stack.length;

    const layer = this.generateBox(x, y, z, width, depth);
    layer.direction = direction;
    this.stack.push(layer);
  }
  generateBox(x, y, z, width, depth, falls) {
    const geometry = new THREE.BoxGeometry(width, Constant.boxHeight, depth);
    const color = new THREE.Color(
      `hsl(${30 + this.stack.length * 4},100%,50%)`
    );
    const material = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);

    Constant.game.add(mesh);

    //cannon part
    const shape = new CANNON.Box(
      new CANNON.Vec3(width / 2, Constant.boxHeight / 2, depth / 2)
    );
    let mass = falls ? 5 : 0;
    const body = new CANNON.body({ mass, shape });
    body.position.set(x, y, z);
    Constant.world.addBody(body);

    return {
      threejs: mesh,
      cannonjs: body,
      width,
      depth,
    };
  }

  AddOverHang(x, z, width, depth) {
    const y = Constant.boxHeight * (this.stack.length - 1);
    const overhang = this.generateBox(x, y, z, width, depth);
    this.overhangs.push(overhang);
  }
  RandomNumberGenerator(_min, _max) {
    return Math.random() * (_max - _min) + _min;
  }
  updatePhysics(timePassed) {
    Constant.world.step(timePassed / 1000); // Step the physics world

    // Copy coordinates from Cannon.js to Three.js
    this.overhangs.forEach((element) => {
      element.threejs.position.copy(element.cannonjs.position);
      element.threejs.quaternion.copy(element.cannonjs.quaternion);
    });
  }
}
