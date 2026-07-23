import * as THREE from 'three';
import SceneManager from '../three/SceneManager.js';
import Controls from '../three/Controls.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('scene-container');

    if (!container) {
        console.error('Scene container #scene-container not found. Aborting initialization.');
        return;
    }

    const sceneManager = new SceneManager(container);
    const { scene, camera } = sceneManager;

    const torusKnotGeometry = new THREE.TorusKnotGeometry(1, 0.4, 50, 8);
    const torusKnotMaterial = new THREE.MeshStandardMaterial({
        color: 0x4488ff,
        roughness: 0.3,
        metalness: 0.7,
    });
    const torusKnot = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial);
    torusKnot.castShadow = true;
    torusKnot.receiveShadow = true;
    scene.add(torusKnot);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(5, 8, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    scene.add(directionalLight);

    const controls = new Controls(camera, sceneManager.renderer.domElement);

    sceneManager.animate((elapsed) => {
        torusKnot.rotation.x = elapsed * 0.5;
        torusKnot.rotation.y = elapsed * 0.3;
        controls.update();
    });

    window.addEventListener('beforeunload', () => {
        controls.destroy();
        sceneManager.destroy();
    });
});
