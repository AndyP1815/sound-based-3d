import * as THREE from 'three';
import SceneManager from '../../three/SceneManager.js';
import Controls from '../../three/Controls.js';
import Objects from './Objects.js';
import Particles from './Particles.js';
import Animation from './Animation.js';
import AudioCapture from './AudioCapture.js'

document.addEventListener('DOMContentLoaded', async () => {

    const container = document.getElementById('scene-container');

    if (!container) {
        console.error('Missing #scene-container');
        return;
    }

    const audioCapture = new AudioCapture();

    try {
        await audioCapture.start();
    } catch (error) {
        console.error('Audio capture failed:', error);
    }


    const sceneManager = new SceneManager(container);
    const {scene, camera, renderer} = sceneManager;

    scene.background = new THREE.Color(0x050510);

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const objects = new Objects(scene,false);
    const particles = new Particles(scene);

    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);

    const controls = new Controls(camera, renderer.domElement);
    controls.controls.autoRotate = false;
    new Animation(sceneManager, controls, objects, particles, audioCapture);

    window.addEventListener('beforeunload', () => {
        audioCapture.stop();
        controls.destroy();
        sceneManager.destroy();
    });
});
