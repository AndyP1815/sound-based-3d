import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default class Controls {
    constructor(camera, domElement) {
        this.controls = new OrbitControls(camera, domElement);

        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        this.controls.minDistance = 2;
        this.controls.maxDistance = 15;

        this.controls.target.set(0, 0, 0);
    }

    update() {
        this.controls.update();
    }

    destroy() {
        this.controls.dispose();
    }
}
