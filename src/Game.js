import * as THREE from 'three';
import { GameConfig } from './Config.js';
import { RendererManager } from './Renderer.js';
import { World } from './World.js';
import { Unit } from './Unit.js';
import { UIManager } from './UI.js';
import { Utils } from './Utils.js';
import { AudioManager } from './Audio.js';

export class Game {
    constructor() {
        this.renderer = new RendererManager('game-container');
        this.world = new World(this.renderer.scene);
        this.ui = new UIManager(this);
        this.audio = new AudioManager();

        this.scene = this.renderer.scene;
        this.camera = this.renderer.camera;

        this.redTeam = [];
        this.blueTeam = [];
        this.particles = [];

        this.setupInput();

        this.lastTime = 0;
        this.initGame();

        requestAnimationFrame(this.animate.bind(this));
    }

    setupInput() {
        this.keys = {};
        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
        window.addEventListener('wheel', (e) => {
            this.renderer.zoom = Math.max(0.5, Math.min(3, this.renderer.zoom - e.deltaY * 0.001));
            this.camera.zoom = this.renderer.zoom;
            this.camera.updateProjectionMatrix();
        });
    }

    initGame() {
        // Cleanup
        this.redTeam.forEach(u => { this.scene.remove(u.mesh); });
        this.blueTeam.forEach(u => { this.scene.remove(u.mesh); });
        this.ui.clearHealthBars();

        this.redTeam = [];
        this.blueTeam = [];

        this.world.generate();
        this.spawnTeams();
        this.ui.updateScore(this.redTeam.length, this.blueTeam.length);

        this.audio.playSpawn();
    }

    spawnTeams() {
        for (let i = 0; i < GameConfig.botCountRed; i++) {
            this.redTeam.push(new Unit(this, 'red', Utils.randomRange(-20, -5), Utils.randomRange(-15, 15)));
        }
        for (let i = 0; i < GameConfig.botCountBlue; i++) {
            this.blueTeam.push(new Unit(this, 'blue', Utils.randomRange(5, 20), Utils.randomRange(-15, 15)));
        }
    }

    spawnParticles(pos, color) {
        const geo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const mat = new THREE.MeshBasicMaterial({ color: color });

        for (let i = 0; i < 8; i++) {
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.copy(pos);
            mesh.position.x += Utils.randomRange(-0.5, 0.5);
            mesh.position.y += Utils.randomRange(0, 1);
            mesh.position.z += Utils.randomRange(-0.5, 0.5);

            const vel = new THREE.Vector3(
                Utils.randomRange(-2, 2),
                Utils.randomRange(2, 5),
                Utils.randomRange(-2, 2)
            );

            this.scene.add(mesh);
            this.particles.push({ mesh, vel, life: 1.0 });
        }
    }

    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;

            p.vel.y -= 9.8 * dt;
            p.mesh.position.add(p.vel.clone().multiplyScalar(dt));
            p.mesh.rotation.x += dt * 5;

            if (p.life <= 0 || p.mesh.position.y < 0) {
                this.scene.remove(p.mesh);
                this.particles.splice(i, 1);
            }
        }
    }

    updateCamera(dt) {
        const speed = 10 * dt;
        if (this.keys['KeyW'] || this.keys['ArrowUp']) this.camera.position.z -= speed;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) this.camera.position.z += speed;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) this.camera.position.x -= speed;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) this.camera.position.x += speed;
    }

    checkWinCondition() {
        const redAlive = this.redTeam.filter(u => !u.isDead).length;
        const blueAlive = this.blueTeam.filter(u => !u.isDead).length;
        this.ui.updateScore(redAlive, blueAlive);
    }

    restart() {
        this.initGame();
    }

    animate(time) {
        requestAnimationFrame(this.animate.bind(this));

        const t = time * 0.001;
        const rawDt = Math.min(t - this.lastTime, 0.1);
        this.lastTime = t;

        const dt = rawDt * GameConfig.timeScale;

        this.redTeam.forEach(u => u.update(dt, t));
        this.blueTeam.forEach(u => u.update(dt, t));

        this.updateParticles(dt);
        this.updateCamera(rawDt); // Camera moves at real time

        this.renderer.render();
    }
}
