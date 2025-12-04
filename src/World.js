import * as THREE from 'three';
import { GameConfig } from './Config.js';
import { Utils } from './Utils.js';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.obstacles = [];
        this.ground = null;

        // Environment
        this.scene.background = new THREE.Color(0x87CEEB); // Sky Blue
        this.scene.fog = new THREE.Fog(0x87CEEB, 20, 60);

        this.textures = {
            ground: Utils.createNoiseTexture(),
            wall: Utils.createCanvasTexture('#555555'),
            wood: Utils.createCanvasTexture('#8B4513'),
            leaf: Utils.createCanvasTexture('#228B22')
        };
    }

    generate() {
        this.clear();
        this.createGround();
        this.createObstacles();
    }

    clear() {
        if (this.ground) this.scene.remove(this.ground);
        this.obstacles.forEach(o => this.scene.remove(o));
        this.obstacles = [];
    }

    createGround() {
        const geo = new THREE.PlaneGeometry(GameConfig.mapSize, GameConfig.mapSize);
        this.textures.ground.repeat.set(10, 10);

        // Add a grid helper for that "VR" look
        const grid = new THREE.GridHelper(GameConfig.mapSize, GameConfig.mapSize / 2, 0x000000, 0x000000);
        grid.position.y = 0.01;
        grid.material.opacity = 0.1;
        grid.material.transparent = true;
        this.scene.add(grid);
        this.obstacles.push(grid); // Track to remove on clear

        const mat = new THREE.MeshStandardMaterial({
            color: 0x55aa55, // Greener
            map: this.textures.ground,
            roughness: 0.9
        });

        this.ground = new THREE.Mesh(geo, mat);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);
    }

    createObstacles() {
        // Walls
        const wallGeo = new THREE.BoxGeometry(2, 2, 2);
        const wallMat = new THREE.MeshStandardMaterial({ map: this.textures.wall });

        // Trees
        const trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 1.5, 6);
        const trunkMat = new THREE.MeshStandardMaterial({ map: this.textures.wood });
        const leavesGeo = new THREE.ConeGeometry(1.5, 3, 8);
        const leavesMat = new THREE.MeshStandardMaterial({ map: this.textures.leaf });

        for (let i = 0; i < 30; i++) { // More obstacles
            const x = Utils.randomRange(-GameConfig.mapSize / 2 + 2, GameConfig.mapSize / 2 - 2);
            const z = Utils.randomRange(-GameConfig.mapSize / 2 + 2, GameConfig.mapSize / 2 - 2);

            // Keep center clear
            if (Math.abs(x) < 5 && Math.abs(z) < 5) continue;

            const type = Math.random();

            if (type < 0.3) {
                // Wall
                const mesh = new THREE.Mesh(wallGeo, wallMat);
                mesh.position.set(x, 1, z);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                this.scene.add(mesh);
                this.obstacles.push(mesh);
            } else {
                // Tree
                const group = new THREE.Group();
                group.position.set(x, 0, z);

                const trunk = new THREE.Mesh(trunkGeo, trunkMat);
                trunk.position.y = 0.75;
                trunk.castShadow = true;
                trunk.receiveShadow = true;

                const leaves = new THREE.Mesh(leavesGeo, leavesMat);
                leaves.position.y = 2.25;
                leaves.castShadow = true;
                leaves.receiveShadow = true;

                group.add(trunk);
                group.add(leaves);

                // Random scale/rotation
                const s = Utils.randomRange(0.8, 1.5);
                group.scale.set(s, s, s);
                group.rotation.y = Math.random() * Math.PI * 2;

                this.scene.add(group);
                this.obstacles.push(group);
            }
        }
    }
}
