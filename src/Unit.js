import * as THREE from 'three';
import { GameConfig } from './Config.js';
import { Utils } from './Utils.js';

export class Unit {
    constructor(game, team, x, z) {
        this.game = game;
        this.team = team;
        this.health = GameConfig.maxHealth;
        this.state = 'IDLE';
        this.target = null;
        this.lastAttackTime = 0;
        this.isDead = false;

        // Animation state
        this.walkTime = 0;
        this.attackAnimTime = 0;
        this.isAttacking = false;
        this.deathTime = 0;

        this.mesh = this.createCharacterMesh(team);
        this.mesh.position.set(x, 0, z);

        this.game.scene.add(this.mesh);

        // UI
        this.healthBar = this.game.ui.createHealthBar();

        // Flash material for damage
        this.originalMaterials = [];
        this.mesh.traverse(c => {
            if (c.isMesh) this.originalMaterials.push({ mesh: c, mat: c.material });
        });
        this.flashMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    }

    createCharacterMesh(team) {
        const group = new THREE.Group();
        const color = team === 'red' ? GameConfig.colors.red : GameConfig.colors.blue;
        const skinColor = 0xffccaa;
        const darkColor = 0x333333;
        const metalColor = 0x888888;
        const woodColor = 0x8B4513;

        const matBody = new THREE.MeshStandardMaterial({ color: color });
        const matSkin = new THREE.MeshStandardMaterial({ color: skinColor });
        const matDark = new THREE.MeshStandardMaterial({ color: darkColor });
        const matMetal = new THREE.MeshStandardMaterial({ color: metalColor, roughness: 0.4, metalness: 0.8 });
        const matWood = new THREE.MeshStandardMaterial({ color: woodColor });

        // Torso
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.3), matBody);
        torso.position.y = 0.7;
        torso.castShadow = true;
        group.add(torso);

        // Head
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), matSkin);
        head.position.y = 1.15;
        head.castShadow = true;
        group.add(head);
        this.head = head;

        // Helmet
        const hat = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 0.35), matMetal);
        hat.position.y = 0.15; // Relative to head center
        this.head.add(hat);

        // Plume/Crest
        const plumeColor = team === 'red' ? 0xffaaaa : 0xaaaaff;
        const plume = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.4), new THREE.MeshStandardMaterial({ color: plumeColor }));
        plume.position.set(0, 0.2, 0);
        hat.add(plume);

        // Eyes (Visor)
        const visor = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.05, 0.05), matDark);
        visor.position.set(0, 0, 0.16);
        this.head.add(visor);

        // Shoulders
        const shoulderL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.25), matMetal);
        shoulderL.position.set(-0.4, 0.9, 0);
        group.add(shoulderL);

        const shoulderR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.25), matMetal);
        shoulderR.position.set(0.4, 0.9, 0);
        group.add(shoulderR);

        // Arms
        this.armL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.5, 0.15), matBody);
        this.armL.position.set(-0.35, 0.7, 0);
        this.armL.geometry.translate(0, -0.2, 0);
        this.armL.position.y += 0.2;
        group.add(this.armL);

        this.armR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.5, 0.15), matBody);
        this.armR.position.set(0.35, 0.7, 0);
        this.armR.geometry.translate(0, -0.2, 0);
        this.armR.position.y += 0.2;
        group.add(this.armR);

        // Weapon (Right Hand) - Sword
        const swordGroup = new THREE.Group();
        swordGroup.position.set(0, -0.4, 0.1);
        swordGroup.rotation.x = Math.PI / 2; // Point forward
        this.armR.add(swordGroup);

        const hilt = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.2), matWood);
        swordGroup.add(hilt);

        const guard = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.05), matMetal);
        guard.position.z = 0.1;
        swordGroup.add(guard);

        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.6), matMetal);
        blade.position.z = 0.4;
        swordGroup.add(blade);

        // Shield (Left Hand)
        const shieldGroup = new THREE.Group();
        shieldGroup.position.set(0.1, -0.2, 0);
        this.armL.add(shieldGroup);

        const shield = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.05), matMetal);
        // Paint shield with team color
        shield.material = new THREE.MeshStandardMaterial({ color: color, roughness: 0.5, metalness: 0.5 });
        shieldGroup.add(shield);

        // Shield detail
        const shieldBoss = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.06), matMetal);
        shieldGroup.add(shieldBoss);


        // Legs
        this.legL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.5, 0.18), matDark);
        this.legL.position.set(-0.15, 0.25, 0);
        this.legL.geometry.translate(0, -0.25, 0);
        this.legL.position.y += 0.25;
        group.add(this.legL);

        this.legR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.5, 0.18), matDark);
        this.legR.position.set(0.15, 0.25, 0);
        this.legR.geometry.translate(0, -0.25, 0);
        this.legR.position.y += 0.25;
        group.add(this.legR);

        // Boots
        const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.25), matDark);
        bootL.position.set(0, -0.4, 0.05);
        this.legL.add(bootL);

        const bootR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.25), matDark);
        bootR.position.set(0, -0.4, 0.05);
        this.legR.add(bootR);

        return group;
    }

    update(dt, time) {
        if (this.isDead) {
            this.updateDeathAnimation(dt);
            return;
        }

        this.updateStateMachine(dt, time);
        this.updateAnimation(dt);
        this.updateUI();
    }

    updateAnimation(dt) {
        // Attack Override
        if (this.isAttacking) {
            this.attackAnimTime += dt * 15;
            // Swing arm (Sword chop)
            this.armR.rotation.x = -Math.PI / 2 + Math.sin(this.attackAnimTime) * 2.0;

            // Raise shield slightly
            this.armL.rotation.x = -0.5;
            this.armL.rotation.y = 0.5;

            if (this.attackAnimTime > Math.PI) {
                this.isAttacking = false;
                this.armR.rotation.x = 0;
                this.armL.rotation.x = 0;
                this.armL.rotation.y = 0;
            }
            return;
        }

        // Walk Animation
        if (this.state === 'MOVE') {
            this.walkTime += dt * 10;
            const angle = Math.sin(this.walkTime) * 0.8;

            // Shield arm moves less
            this.armL.rotation.x = angle * 0.3;
            this.armR.rotation.x = -angle;

            this.legL.rotation.x = -angle;
            this.legR.rotation.x = angle;

            // Bobbing
            this.mesh.position.y = Math.abs(Math.sin(this.walkTime * 2)) * 0.05;

            // Head bob
            this.head.rotation.z = Math.sin(this.walkTime) * 0.05;
        } else {
            // Idle Reset (Lerp back to 0)
            const lerp = (curr, target) => curr + (target - curr) * dt * 10;
            this.armL.rotation.x = lerp(this.armL.rotation.x, 0);
            this.armL.rotation.y = lerp(this.armL.rotation.y, 0);
            this.armR.rotation.x = lerp(this.armR.rotation.x, 0);
            this.legL.rotation.x = lerp(this.legL.rotation.x, 0);
            this.legR.rotation.x = lerp(this.legR.rotation.x, 0);
            this.mesh.position.y = lerp(this.mesh.position.y, 0);
            this.head.rotation.z = lerp(this.head.rotation.z, 0);
        }
    }

    updateDeathAnimation(dt) {
        this.deathTime += dt;
        if (this.deathTime < 0.5) {
            // Fall over
            this.mesh.rotation.x = -Math.PI / 2 * (this.deathTime / 0.5);
            this.mesh.position.y = Math.max(0.2, 0.7 - this.deathTime);
        } else {
            // Sink
            this.mesh.position.y -= dt;
            if (this.mesh.position.y < -1) {
                this.mesh.visible = false;
            }
        }
    }

    updateStateMachine(dt, time) {
        if (!this.target || this.target.isDead) {
            this.target = this.findNearestEnemy();
            this.state = 'IDLE';
        }

        if (!this.target) return;

        const dist = this.mesh.position.distanceTo(this.target.mesh.position);

        if (dist <= GameConfig.attackRange) {
            this.state = 'ATTACK';
            this.attack(time);
        } else {
            this.state = 'MOVE';
            this.moveTowards(this.target.mesh.position, dt);
        }
    }

    findNearestEnemy() {
        let nearest = null;
        let minDist = Infinity;
        const enemies = this.team === 'red' ? this.game.blueTeam : this.game.redTeam;

        for (const enemy of enemies) {
            if (enemy.isDead) continue;
            const d = this.mesh.position.distanceTo(enemy.mesh.position);
            if (d < minDist) {
                minDist = d;
                nearest = enemy;
            }
        }
        return nearest;
    }

    moveTowards(targetPos, dt) {
        const direction = new THREE.Vector3().subVectors(targetPos, this.mesh.position).normalize();

        // Separation Force
        const separation = this.getSeparationForce();
        direction.add(separation);
        direction.normalize();

        this.mesh.position.add(direction.multiplyScalar(GameConfig.unitSpeed * dt));
        this.mesh.lookAt(targetPos);
    }

    getSeparationForce() {
        const force = new THREE.Vector3();
        const minDistance = 1.5; // Minimum distance between units
        const neighbors = [...this.game.redTeam, ...this.game.blueTeam];
        let count = 0;

        for (const other of neighbors) {
            if (other === this || other.isDead) continue;

            const dist = this.mesh.position.distanceTo(other.mesh.position);
            if (dist < minDistance) {
                const push = new THREE.Vector3().subVectors(this.mesh.position, other.mesh.position);
                push.normalize();
                push.divideScalar(dist); // Stronger when closer
                force.add(push);
                count++;
            }
        }

        if (count > 0) {
            force.divideScalar(count);
            force.multiplyScalar(2.5); // Separation strength
        }

        return force;
    }

    attack(time) {
        if (time - this.lastAttackTime > GameConfig.attackCooldown) {
            this.isAttacking = true;
            this.attackAnimTime = 0;
            this.game.audio.playAttack();

            // Delay damage to match animation swing
            setTimeout(() => {
                if (this.target && !this.target.isDead && !this.isDead) {
                    const dist = this.mesh.position.distanceTo(this.target.mesh.position);
                    if (dist <= GameConfig.attackRange + 0.5) {
                        this.target.takeDamage(GameConfig.damage);
                        this.game.audio.playHit();
                    }
                }
            }, 200);

            this.lastAttackTime = time;
        }
    }

    takeDamage(amount) {
        this.health -= amount;

        // Flash effect
        this.mesh.traverse(c => {
            if (c.isMesh) c.material = this.flashMaterial;
        });
        setTimeout(() => {
            this.originalMaterials.forEach(item => item.mesh.material = item.mat);
        }, 100);

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.isDead = true;
        this.health = 0;
        this.healthBar.remove();
        this.game.spawnParticles(this.mesh.position, this.team === 'red' ? 0xff0000 : 0x0000ff);
        this.game.audio.playDeath();
        this.game.checkWinCondition();
    }

    updateUI() {
        if (this.isDead) return;
        this.game.ui.updateHealthBar(this.healthBar, this.mesh.position, this.health, GameConfig.maxHealth, this.game.renderer.camera);
    }
}
