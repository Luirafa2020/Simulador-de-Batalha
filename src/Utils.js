import * as THREE from 'three';

export const Utils = {
    randomRange: (min, max) => Math.random() * (max - min) + min,

    distance: (v1, v2) => v1.distanceTo(v2),

    createCanvasTexture: (color, noise = true) => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 64, 64);

        if (noise) {
            for (let i = 0; i < 200; i++) {
                ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.15})`;
                ctx.fillRect(Math.random() * 64, Math.random() * 64, 2, 2);

                ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.1})`;
                ctx.fillRect(Math.random() * 64, Math.random() * 64, 2, 2);
            }
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.NearestFilter;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
    },

    createNoiseTexture: () => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#44aa44'; // Grass base
        ctx.fillRect(0, 0, 128, 128);

        for (let i = 0; i < 1000; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? '#339933' : '#55bb55';
            ctx.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.NearestFilter;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
    }
};
