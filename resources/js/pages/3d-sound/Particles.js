import * as THREE from 'three';

export default class Particles {

    constructor(scene) {

        const particleCount = 800;
        const particlePositions = [];

        for (let i = 0; i < particleCount; i++) {
            const radius = 1.5 + Math.random() * 1.5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            particlePositions.push(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.sin(phi) * Math.sin(theta),
                radius * Math.cos(phi)
            );
        }

        this.originalPositions = particlePositions.slice();

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(particlePositions, 3)
        );

        this.material = new THREE.PointsMaterial({
            color: 0x88ddff,
            size: 0.05,
            map: this.createCircleTexture(),
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.mesh = new THREE.Points(this.geometry, this.material);
        scene.add(this.mesh);
    }

    createCircleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.4, 'rgba(180,220,255,1)');
        gradient.addColorStop(0.7, 'rgba(100,180,255,0.8)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(canvas);
    }

    update(elapsed) {

        this.mesh.rotation.y += 0.0008;

        const positions = this.geometry.attributes.position.array;
        const original = this.originalPositions;

        for (let i = 0; i < positions.length; i += 3) {
            const ox = original[i];
            const oy = original[i + 1];
            const oz = original[i + 2];

            const length = Math.sqrt(ox * ox + oy * oy + oz * oz);
            const nx = ox / length;
            const ny = oy / length;
            const nz = oz / length;

            const phase = i * 0.02;
            const pulse = Math.sin(elapsed * 3 + phase) * 0.15;

            positions[i] = ox + nx * pulse;
            positions[i + 1] = oy + ny * pulse;
            positions[i + 2] = oz + nz * pulse;
        }

        this.geometry.attributes.position.needsUpdate = true;
    }
}
