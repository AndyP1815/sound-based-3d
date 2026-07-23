import * as THREE from 'three';

export default class SceneManager {
    constructor(container) {
        this.container = container;
        this.animationId = null;
        this.startTime = performance.now();

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111111);

        this.camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000,
        );
        this.camera.position.set(0, 2, 5);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);

        this._onResize = this._handleResize.bind(this);
        window.addEventListener('resize', this._onResize);
    }

    _handleResize() {
        const { clientWidth, clientHeight } = this.container;
        this.camera.aspect = clientWidth / clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(clientWidth, clientHeight);
    }

    animate(callback) {
        const loop = () => {
            const elapsed = (performance.now() - this.startTime) / 1000;
            callback(elapsed);
            this.renderer.render(this.scene, this.camera);
            this.animationId = requestAnimationFrame(loop);
        };
        this.animationId = requestAnimationFrame(loop);
    }

    destroy() {
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
        }
        window.removeEventListener('resize', this._onResize);
        this.renderer.dispose();
        this.container.removeChild(this.renderer.domElement);
    }
}
