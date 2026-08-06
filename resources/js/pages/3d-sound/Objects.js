import * as THREE from 'three';

const CONFIG = {
    core: {
        wave: 0.05,
        bass: 0.18
    },
    shell: {
        scaleMid: 0.1
    },
    material: {
        emissiveBass: 3
    },
    light: {
        keyBase: 20,
        keyBass: 40
    },
    spectrum: {
        barCount: 72,
        radius: 1.7,
        height: 0.5,
        smoothing: 0.4
    }
};

export default class Objects {

    constructor(scene, withBar = true) {

        // Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 0.2));

        const key = new THREE.PointLight(0x44aaff, 20, 15);
        key.position.set(3, 2, 3);
        scene.add(key);
        this.key = key;

        const fill = new THREE.PointLight(0xff44aa, 15, 15);
        fill.position.set(-3, -2, 2);
        scene.add(fill);

        const rim = new THREE.DirectionalLight(0xffffff, 2);
        rim.position.set(0, 5, -5);
        scene.add(rim);

        // Core sphere
        this.geometry = new THREE.IcosahedronGeometry(1, 6);

        this.material = new THREE.MeshPhysicalMaterial({
            color: 0x2266ff,
            emissive: 0x0033ff,
            emissiveIntensity: 1,
            roughness: 0.15,
            metalness: 0.15,
            transmission: 0.3,
            thickness: 1.5,
            clearcoat: 1,
            clearcoatRoughness: 0.05
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        scene.add(this.mesh);

        this.positionAttr = this.geometry.attributes.position;
        this.original = this.positionAttr.array.slice();
        this.envelope = 0;

        // Energy shell
        this.shell = new THREE.Mesh(
            new THREE.IcosahedronGeometry(1.08, 4),
            new THREE.MeshBasicMaterial({
                color: 0x66ccff,
                wireframe: true,
                transparent: true,
                opacity: 0.2
            })
        );
        scene.add(this.shell);

        // Spectrum orb

        if (withBar) {
            const ringGeometry = new THREE.BoxGeometry(
                0.03,
                CONFIG.spectrum.height,
                0.03
            );

            const up = new THREE.Vector3(0, 1, 0);
            const dir = new THREE.Vector3();
            const goldenAngle = Math.PI * (3 - Math.sqrt(5));

            this.spectrum = [];

            for (let i = 0; i < CONFIG.spectrum.barCount; i++) {
                const y = 1 - (i / (CONFIG.spectrum.barCount - 1)) * 2;
                const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
                const theta = goldenAngle * i;

                dir.set(
                    Math.cos(theta) * radiusAtY,
                    y,
                    Math.sin(theta) * radiusAtY
                ).normalize();

                const material = new THREE.MeshBasicMaterial({
                    color: new THREE.Color().setHSL(i / CONFIG.spectrum.barCount, 1, 0.6),
                    transparent: true,
                    opacity: 0.85,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                });

                const bar = new THREE.Mesh(ringGeometry, material);
                bar.position.copy(dir).multiplyScalar(CONFIG.spectrum.radius);
                bar.quaternion.setFromUnitVectors(up, dir);
                bar.scale.y = 0.2;
                bar.userData.value = 0;

                this.spectrum.push(bar);
                scene.add(bar);
            }
        }

    }

    update(elapsed, analysis) {

        const {bass, mid, treble, level, bars} = analysis;

        const envelope = level > this.envelope ? level : this.envelope * 0.9;
        this.envelope = envelope;

        const position = this.positionAttr;
        const original = this.original;

        for (let i = 0; i < position.count; i++) {
            const ix = i * 3;
            const ox = original[ix];
            const oy = original[ix + 1];
            const oz = original[ix + 2];

            const len = Math.sqrt(ox * ox + oy * oy + oz * oz);

            const wave = Math.sin(ox * 6 + oy * 6 + oz * 6 + elapsed * 5);

            const displacement = 1 + wave * CONFIG.core.wave * envelope + bass * CONFIG.core.bass;

            position.array[ix] = ox / len * displacement;
            position.array[ix + 1] = oy / len * displacement;
            position.array[ix + 2] = oz / len * displacement;
        }

        position.needsUpdate = true;
        this.geometry.computeVertexNormals();

        this.mesh.rotation.y += 0.002 * envelope;

        this.shell.rotation.y -= 0.0015 * envelope;
        this.shell.rotation.x += 0.001 * envelope;
        this.shell.scale.setScalar(1 + mid * CONFIG.shell.scaleMid);

        this.material.emissiveIntensity = 1 + bass * CONFIG.material.emissiveBass;
        this.material.color.setHSL(0.58 + treble * 0.08, 0.8, 0.55);

        this.key.intensity = CONFIG.light.keyBase + bass * CONFIG.light.keyBass;

        if (this.spectrum) {

            for (let i = 0; i < this.spectrum.length; i++) {
                const bar = this.spectrum[i];
                bar.userData.value += (bars[i] - bar.userData.value) * CONFIG.spectrum.smoothing;
                bar.scale.y = CONFIG.spectrum.height * (0.25 + bar.userData.value * 2.5 + level * 0.4);
            }
        }
    }
}
