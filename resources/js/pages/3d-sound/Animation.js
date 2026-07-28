export default class Animation {

    constructor(sceneManager, controls, objects, particles) {

        sceneManager.animate((elapsed) => {

            controls.update();

            const bass = (Math.sin(elapsed * 3) + 1) * 0.5;
            const treble = (Math.sin(elapsed * 11) + 1) * 0.5;

            objects.update(elapsed, bass, treble);
            particles.update(elapsed);
        });
    }
}
