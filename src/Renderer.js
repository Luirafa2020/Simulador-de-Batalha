import * as THREE from 'three';
import { GameConfig } from './Config.js';

export class RendererManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.width = GameConfig.renderWidth;
        this.height = GameConfig.renderHeight;

        this.initRenderer();
        this.initScene();
        this.initCamera();
        this.initLights();

        window.addEventListener('resize', () => this.onResize());
    }

    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: false });
        this.renderer.setSize(this.width, this.height, false);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.BasicShadowMap;

        // CSS Scaling for Pixel Art look
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.style.imageRendering = 'pixelated';

        this.container.appendChild(this.renderer.domElement);
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111111);
        this.scene.fog = new THREE.Fog(0x111111, 20, 60);
    }

    initCamera() {
        const aspect = this.width / this.height;
        const d = 20;
        this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);

        // Isometric view
        this.camera.position.set(20, 20, 20);
        this.camera.lookAt(0, 0, 0);
        this.zoom = 1.0;
    }

    initLights() {
        const ambientLight = new THREE.AmbientLight(0x666666);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(10, 20, 5);
        dirLight.castShadow = true;

        // Optimize shadow map
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        const d = 30;
        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;

        this.scene.add(dirLight);
    }

    onResize() {
        // Keep internal resolution, just handle aspect ratio if needed? 
        // Actually for pixel art fixed res, we usually just scale the canvas.
        // But if we want to support window resizing affecting the view area:
        // For now, let's keep fixed resolution stretched.
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
