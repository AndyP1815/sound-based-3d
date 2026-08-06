export default class Animation {

    constructor(sceneManager, controls, objects, particles, audioCapture) {

        sceneManager.animate((elapsed) => {

            controls.update();

            const analysis = audioCapture.getAnalysis(72);

            objects.update(elapsed, analysis);
            particles.update(elapsed, analysis);
        });
    }
}
