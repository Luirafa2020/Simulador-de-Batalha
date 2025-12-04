import { GameConfig } from './Config.js';

export class UIManager {
    constructor(game) {
        this.game = game;
        this.container = document.getElementById('ui-layer');

        this.setupScoreboard();
        this.setupControlPanel();
    }

    setupScoreboard() {
        this.scoreboard = document.createElement('div');
        this.scoreboard.id = 'scoreboard';
        this.scoreboard.innerHTML = `
            <div class="team-score" style="color: #ff4444">VERMELHO: 0</div>
            <div class="team-score" style="color: #4444ff">AZUL: 0</div>
        `;
        this.container.appendChild(this.scoreboard);
    }

    setupControlPanel() {
        const panel = document.createElement('div');
        panel.id = 'control-panel';
        panel.innerHTML = `
            <h3>CONFIGURAÇÕES DE BATALHA</h3>
            <div class="control-group">
                <label>Time Vermelho: <span id="val-red">${GameConfig.botCountRed}</span></label>
                <input type="range" id="inp-red" min="1" max="50" value="${GameConfig.botCountRed}">
            </div>
            <div class="control-group">
                <label>Time Azul: <span id="val-blue">${GameConfig.botCountBlue}</span></label>
                <input type="range" id="inp-blue" min="1" max="50" value="${GameConfig.botCountBlue}">
            </div>
            <div class="control-group">
                <label>Velocidade: <span id="val-time">${GameConfig.timeScale}</span>x</label>
                <input type="range" id="inp-time" min="0.1" max="3.0" step="0.1" value="${GameConfig.timeScale}">
            </div>
            <button id="btn-restart">REINICIAR A BATALHA</button>
        `;
        this.container.appendChild(panel);

        // Bindings
        const inpRed = panel.querySelector('#inp-red');
        const inpBlue = panel.querySelector('#inp-blue');
        const inpTime = panel.querySelector('#inp-time');

        inpRed.oninput = (e) => {
            GameConfig.botCountRed = parseInt(e.target.value);
            panel.querySelector('#val-red').innerText = GameConfig.botCountRed;
        };
        inpBlue.oninput = (e) => {
            GameConfig.botCountBlue = parseInt(e.target.value);
            panel.querySelector('#val-blue').innerText = GameConfig.botCountBlue;
        };
        inpTime.oninput = (e) => {
            GameConfig.timeScale = parseFloat(e.target.value);
            panel.querySelector('#val-time').innerText = GameConfig.timeScale;
        };

        panel.querySelector('#btn-restart').onclick = () => {
            this.game.restart();
        };
    }

    updateScore(red, blue) {
        this.scoreboard.innerHTML = `
            <div class="team-score" style="color: #ff4444">VERMELHO: ${red}</div>
            <div class="team-score" style="color: #4444ff">AZUL: ${blue}</div>
        `;
    }

    createHealthBar() {
        const bar = document.createElement('div');
        bar.className = 'health-bar-container';
        bar.innerHTML = '<div class="health-fill"></div>';
        this.container.appendChild(bar);
        return bar;
    }

    updateHealthBar(bar, position, health, maxHealth, camera) {
        const vector = position.clone();
        vector.y += 2.0; // Above head
        vector.project(camera);

        const x = (vector.x * .5 + .5) * window.innerWidth;
        const y = (-(vector.y * .5) + .5) * window.innerHeight;

        if (vector.z > 1 || Math.abs(vector.x) > 1 || Math.abs(vector.y) > 1) {
            bar.style.display = 'none';
        } else {
            bar.style.display = 'block';
            bar.style.left = `${x}px`;
            bar.style.top = `${y}px`;

            const fill = bar.querySelector('.health-fill');
            const pct = (health / maxHealth) * 100;
            fill.style.width = `${pct}%`;
            fill.style.backgroundColor = pct < 30 ? '#f00' : '#0f0';
        }
    }

    clearHealthBars() {
        const bars = document.querySelectorAll('.health-bar-container');
        bars.forEach(b => b.remove());
    }
}
