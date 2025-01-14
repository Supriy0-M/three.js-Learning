class Constant {
  constructor() {
    this.game;
    this.camera;
    this.ambientLight;
    this.pointLight;
    this.directionalLight;
    this.renderer = null;
    this.originalBoxSize = 3;
    this.boxHeight = 1;
    this.isGameStarted = false;
    this.speed = 0.15;
  }
}
let constant = new Constant();
export { constant as Constant };
