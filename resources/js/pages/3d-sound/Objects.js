import * as THREE from 'three';

export default class Objects {

    constructor(scene) {

        // Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 0.2));

        const key = new THREE.PointLight(0x44aaff, 20, 15);
        key.position.set(3, 2, 3);
        scene.add(key);

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
    }

    update(elapsed, bass, treble) {

        const position = this.positionAttr;
        const original = this.original;

        for (let i = 0; i < position.count; i++) {
            const ix = i * 3;
            const ox = original[ix];
            const oy = original[ix + 1];
            const oz = original[ix + 2];

            const len = Math.sqrt(ox * ox + oy * oy + oz * oz);

            const wave = Math.sin(ox * 6 + oy * 6 + oz * 6 + elapsed * 5);

            const displacement = 1 + wave * 0.05 + bass * 0.15;

            position.array[ix] = ox / len * displacement;
            position.array[ix + 1] = oy / len * displacement;
            position.array[ix + 2] = oz / len * displacement;
        }

        position.needsUpdate = true;
        this.geometry.computeVertexNormals();

        this.mesh.rotation.y += 0.002;

        this.shell.rotation.y -= 0.0015;
        this.shell.rotation.x += 0.001;
        this.shell.scale.setScalar(1 + bass * 0.08);

        this.material.emissiveIntensity = 1 + bass * 2.5;
        this.material.color.setHSL(0.58 + treble * 0.08, 0.8, 0.55);
    }
}
