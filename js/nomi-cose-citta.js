const SERVER_URL = "https://party-game-production-bbc8.up.railway.app";

const DEFAULT_CATEGORIES = ["Nome", "Cosa / Oggetto", "Città / Stato", "Animale", "Frutta / Pianta", "Mestiere", "Marca"];
let categories = [...DEFAULT_CATEGORIES];
const alphabet = "ABCDEFGHILMNOPQRSTUVZ";

let socket = null;
let isOnline = false;
let currentRoom = null;
let isHost = false;

let stopCountdownInterval = null;
let isStopCountdownActive = false;

let currentLetter = "";
let roundScores = {};
let currentRoundSum = 0;
let totalGamePoints = 0;
let currentRound = 1;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, duration, type = 'sine') {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

document.addEventListener('DOMContentLoaded', () => {
    renderCategoriesUI();

    const btnLocal = document.getElementById('btnModeLocal');
    if (btnLocal) btnLocal.addEventListener('click', () => selectMode('local'));

    const btnOnline = document.getElementById('btnModeOnline');
    if (btnOnline) btnOnline.addEventListener('click', () => selectMode('online'));

    const btnTabCreate = document.getElementById('tabCreate');
    if (btnTabCreate) btnTabCreate.addEventListener('click', () => toggleLobbyMode('create'));

    const btnTabJoin = document.getElementById('tabJoin');
    if (btnTabJoin) btnTabJoin.addEventListener('click', () => toggleLobbyMode('join'));

    const btnDoCreate = document.getElementById('btnDoCreate');
    if (btnDoCreate) btnDoCreate.addEventListener('click', createRoom);

    const btnDoJoin = document.getElementById('btnDoJoin');
    if (btnDoJoin) btnDoJoin.addEventListener('click', joinRoom);

    const btnAddCat = document.getElementById('btnAddCat');
    if (btnAddCat) btnAddCat.addEventListener('click', addCategory);

    const btnResetCat = document.getElementById('btnResetCat');
    if (btnResetCat) btnResetCat.addEventListener('click', resetCategories);

    const startBtn = document.getElementById('startBtn');
    if (startBtn) startBtn.addEventListener('click', handleStart);

    const stopBtn = document.getElementById('stopBtn');
    if (stopBtn) {
        stopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleStop();
        });
    }

    const nextRoundBtn = document.getElementById('nextRoundBtn');
    if (nextRoundBtn) nextRoundBtn.addEventListener('click', nextRound);
});

function renderCategoriesUI() {
    const chipContainer = document.getElementById('catChipsContainer');
    if (chipContainer) {
        chipContainer.innerHTML = '';
        const canEdit = !isOnline || isHost || !currentRoom;

        categories.forEach((cat, index) => {
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.innerHTML = `
                <span>${cat}</span>
                ${canEdit ? `<button class="remove-cat-btn" onclick="removeCategory(${index})">✕</button>` : ''}
            `;
            chipContainer.appendChild(chip);
        });
    }

    const form = document.getElementById('gameForm');
    if (form) {
        form.innerHTML = '';
        categories.forEach((cat, index) => {
            const div = document.createElement('div');
            div.className = 'category-item';
            div.innerHTML = `
                <label for="cat-${index}" class="category-label">${cat}</label>
                <input type="text" id="cat-${index}" class="category-input" placeholder="Inizia con..." disabled autocomplete="off">
            `;
            form.appendChild(div);
        });
        form.addEventListener('submit', (e) => e.preventDefault());
    }
}

function addCategory() {
    const input = document.getElementById('newCatInput');
    const val = input ? input.value.trim() : '';
    if (val && !categories.includes(val)) {
        categories.push(val);
        if (input) input.value = '';
        syncCategories();
    }
}

function removeCategory(index) {
    if (categories.length > 1) {
        categories.splice(index, 1);
        syncCategories();
    } else {
        alert("Devi mantenere almeno una categoria!");
    }
}

function resetCategories() {
    categories = [...DEFAULT_CATEGORIES];
    syncCategories();
}

function syncCategories() {
    renderCategoriesUI();
    if (isOnline && isHost && socket) {
        socket.emit('update_categories', { roomCode: currentRoom, categories });
    }
}

function selectMode(mode) {
    document.getElementById('modeSelector').style.display = 'none';
    document.getElementById('catManagerBox').style.display = 'block';
    
    if (mode === 'local') {
        isOnline = false;
        isHost = true;
        document.getElementById('modeBadge').innerText = 'Locale';
        document.getElementById('addCatRow').style.display = 'flex';
        document.getElementById('gameArea').style.display = 'block';
        renderCategoriesUI();
    } else {
        isOnline = true;
        document.getElementById('modeBadge').innerText = 'Online';
        document.getElementById('onlineLobby').style.display = 'block';
        initSocket();
    }
}

function toggleLobbyMode(action) {
    const codeBox = document.getElementById('roomCodeContainer');
    const createBtn = document.getElementById('btnDoCreate');
    const joinBtn = document.getElementById('btnDoJoin');

    if (action === 'join') {
        if (codeBox) codeBox.style.display = 'block';
        if (createBtn) createBtn.style.display = 'none';
        if (joinBtn) joinBtn.style.display = 'inline-block';
    } else {
        if (codeBox) codeBox.style.display = 'none';
        if (createBtn) createBtn.style.display = 'inline-block';
        if (joinBtn) joinBtn.style.display = 'none';
    }
}

function initSocket() {
    if (socket) return;
    socket = io(SERVER_URL);

    socket.on('room_created', ({ roomCode, players, roomCategories }) => {
        currentRoom = roomCode;
        isHost = true;
        if (roomCategories) categories = roomCategories;
        
        showRoomBanner(roomCode);
        document.getElementById('addCatRow').style.display = 'flex';
        document.getElementById('gameArea').style.display = 'block';
        document.getElementById('startBtn').style.display = 'block';
        updatePlayerList(players);
        renderCategoriesUI();
    });

    socket.on('joined_successfully', ({ roomCode, players, roomCategories }) => {
        currentRoom = roomCode;
        isHost = false;
        if (roomCategories) categories = roomCategories;
        
        showRoomBanner(roomCode);
        document.getElementById('addCatRow').style.display = 'none';
        document.getElementById('gameArea').style.display = 'block';
        document.getElementById('startBtn').style.display = 'none';
        updatePlayerList(players);
        renderCategoriesUI();
    });

    socket.on('categories_updated', ({ categories: updatedCat }) => {
        categories = updatedCat;
        renderCategoriesUI();
    });

    socket.on('update_players', ({ players }) => { updatePlayerList(players); });
    
    socket.on('game_started', ({ letter }) => {
        hideSetupUI();
        const waitMsg = document.getElementById('waitNextMsg');
        if (waitMsg) waitMsg.remove();
        runGameRound(letter);
    });

    socket.on('stop_countdown_started', () => {
        startStopCountdown();
    });

    socket.on('all_answers_submitted', ({ players }) => { displayAnswersAndCalculate(players); });
    socket.on('leaderboard_update', ({ players }) => { renderLeaderboard(players); });
    socket.on('error_msg', (msg) => alert(msg));
}

function showRoomBanner(code) {
    const roomDisplay = document.getElementById('roomStatus');
    if (roomDisplay) {
        roomDisplay.innerHTML = `
            <div style="background: #f0f9ff; border: 2px dashed var(--accent-play); padding: 12px; border-radius: var(--radius-md); margin: 12px 0; text-align: center;">
                <span style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Codice Stanza</span><br>
                <strong style="font-size: 2.2rem; color: var(--accent-play); letter-spacing: 4px; font-family: monospace;">${code}</strong>
            </div>
        `;
    }
}

function createRoom() {
    const nickInput = document.getElementById('nicknameInput');
    const nick = nickInput ? nickInput.value.trim() : '';
    if (!nick) {
        alert("⚠️ Inserisci il tuo Nickname prima di creare la stanza!");
        if (nickInput) nickInput.focus();
        return;
    }
    socket.emit('create_room', { nickname: nick, categories });
}

function joinRoom() {
    const nickInput = document.getElementById('nicknameInput');
    const codeInput = document.getElementById('roomCodeInput');
    const nick = nickInput ? nickInput.value.trim() : '';
    const code = codeInput ? codeInput.value.trim().toUpperCase() : '';

    if (!nick) {
        alert("⚠️ Inserisci il tuo Nickname!");
        if (nickInput) nickInput.focus();
        return;
    }
    if (!code) {
        alert("⚠️ Inserisci il codice della stanza!");
        if (codeInput) codeInput.focus();
        return;
    }
    socket.emit('join_room', { roomCode: code, nickname: nick });
}

function updatePlayerList(players) {
    const container = document.getElementById('playerList');
    if (container) {
        container.innerHTML = "👥 <strong>Giocatori in stanza:</strong> " + players.map(p => `<span style="color:var(--accent-play); font-weight:bold;">${p.name}</span>`).join(', ');
    }
}

function hideSetupUI() {
    const catBox = document.getElementById('catManagerBox');
    if (catBox) catBox.style.display = 'none';

    const startBtn = document.getElementById('startBtn');
    if (startBtn) startBtn.style.display = 'none';
}

function handleStart() {
    hideSetupUI();
    const letter = alphabet[Math.floor(Math.random() * alphabet.length)];

    if (isOnline) {
        socket.emit('start_game', { roomCode: currentRoom, letter });
    } else {
        runGameRound(letter);
    }
}

function runGameRound(letter) {
    clearInterval(stopCountdownInterval);
    isStopCountdownActive = false;

    const stopNotice = document.getElementById('stopNotice');
    if (stopNotice) stopNotice.style.display = 'none';

    currentLetter = letter;
    roundScores = {};
    currentRoundSum = 0;
    
    document.getElementById('letterDisplay').innerText = currentLetter;
    document.getElementById('scoreSection').style.display = 'none';
    document.getElementById('nextRoundBtn').style.display = 'none';
    
    categories.forEach((_, index) => {
        const input = document.getElementById(`cat-${index}`);
        if (input) {
            input.value = "";
            input.disabled = false;
            input.placeholder = `Inizia con ${currentLetter}...`;
        }
    });

    const firstInput = document.getElementById('cat-0');
    if (firstInput) firstInput.focus();

    const startBtn = document.getElementById('startBtn');
    if (startBtn) startBtn.disabled = true;

    const stopBtn = document.getElementById('stopBtn');
    if (stopBtn) {
        stopBtn.disabled = false;
        stopBtn.removeAttribute('disabled');
    }

    playTone(523.25, 0.2);
}

function handleStop() {
    if (isStopCountdownActive) return;

    if (isOnline && socket) {
        socket.emit('trigger_stop_countdown', { roomCode: currentRoom });
    } else {
        startStopCountdown();
    }
}

function startStopCountdown() {
    if (isStopCountdownActive) return;
    isStopCountdownActive = true;

    const stopBtn = document.getElementById('stopBtn');
    if (stopBtn) stopBtn.disabled = true;

    let stopTimeLeft = 10;
    const stopNotice = document.getElementById('stopNotice');
    const stopDisplay = document.getElementById('stopCountdownDisplay');
    
    if (stopNotice) stopNotice.style.display = 'block';
    if (stopDisplay) stopDisplay.innerText = stopTimeLeft;

    playTone(880, 0.2, 'square');

    stopCountdownInterval = setInterval(() => {
        stopTimeLeft--;
        if (stopDisplay) stopDisplay.innerText = stopTimeLeft;
        
        playTone(750, 0.1);

        if (stopTimeLeft <= 0) {
            clearInterval(stopCountdownInterval);
            if (stopNotice) stopNotice.style.display = 'none';
            stopGame();
        }
    }, 1000);
}

function stopGame() {
    clearInterval(stopCountdownInterval);
    isStopCountdownActive = false;

    playTone(659.25, 0.3);

    const startBtn = document.getElementById('startBtn');
    if (startBtn) startBtn.disabled = false;

    const stopBtn = document.getElementById('stopBtn');
    if (stopBtn) stopBtn.disabled = true;

    const currentAnswers = {};
    categories.forEach((cat, index) => {
        const input = document.getElementById(`cat-${index}`);
        if (input) {
            input.disabled = true;
            currentAnswers[cat] = input.value.trim();
        }
    });

    if (isOnline && socket) {
        socket.emit('submit_answers', { roomCode: currentRoom, answers: currentAnswers });
    } else {
        buildScoreTable();
    }
}

function displayAnswersAndCalculate(players) {
    const container = document.getElementById('answersComparison');
    if (!container) return;

    let html = `
        <div class="answers-table-container">
            <table class="answers-table">
                <thead>
                    <tr>
                        <th>Categoria</th>
                        ${players.map(p => `<th>${p.name}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
    `;

    categories.forEach((cat) => {
        html += `<tr>`;
        html += `<td><strong>${cat}</strong></td>`;
        players.forEach(p => {
            const ans = (p.answers && p.answers[cat]) ? p.answers[cat] : '—';
            html += `<td>${ans}</td>`;
        });
        html += `</tr>`;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;
    buildScoreTable();
}

function buildScoreTable() {
    const container = document.getElementById('scoreRows');
    if (!container) return;
    
    container.innerHTML = "<h4 style='color: var(--accent-blue-dark); margin-bottom: 12px;'>Assegna i tuoi Punti:</h4>";
    roundScores = {};
    currentRoundSum = 0;
    
    categories.forEach((cat, index) => {
        const input = document.getElementById(`cat-${index}`);
        const val = input ? input.value.trim() : '';
        roundScores[index] = 0;

        const row = document.createElement('div');
        row.className = 'score-row';
        
        row.innerHTML = `
            <div><strong>${cat}:</strong> ${val ? `<span style="color: #16a34a; font-weight: 600;">${val}</span>` : '<em>Vuoto</em>'}</div>
            <div class="score-buttons">
                <button type="button" class="score-btn active" onclick="setScore(${index}, 0, this)">0</button>
                <button type="button" class="score-btn" onclick="setScore(${index}, 5, this)">5</button>
                <button type="button" class="score-btn" onclick="setScore(${index}, 10, this)">10</button>
            </div>
        `;
        container.appendChild(row);
    });

    updateTotalLocal();
    document.getElementById('scoreSection').style.display = 'block';
    
    // Mostriamo il pulsante per procedere a tutti i giocatori
    document.getElementById('nextRoundBtn').style.display = 'block';
}

function setScore(catIndex, points, btn) {
    roundScores[catIndex] = points;
    
    const parent = btn.parentElement;
    Array.from(parent.children).forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    updateTotalLocal();
}

function updateTotalLocal() {
    currentRoundSum = Object.values(roundScores).reduce((a, b) => a + b, 0);
    const totalDisplay = document.getElementById('totalPoints');
    if (totalDisplay) {
        totalDisplay.innerText = totalGamePoints + currentRoundSum;
    }
}

function renderLeaderboard(players) {
    const container = document.getElementById('leaderboardRows');
    if (!container) return;
    container.innerHTML = "<h4 style='color: var(--accent-blue-dark); margin-top: 20px; margin-bottom: 10px;'>🏆 Classifica Generale</h4>";
    
    const sorted = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
    sorted.forEach((p, idx) => {
        const div = document.createElement('div');
        div.className = 'leaderboard-item';
        div.innerHTML = `
            <span>#${idx + 1} <strong class="leaderboard-name">${p.name}</strong></span>
            <strong class="leaderboard-pts">${p.score || 0} pt</strong>
        `;
        container.appendChild(div);
    });
}

function nextRound() {
    totalGamePoints += currentRoundSum;
    
    if (isOnline && socket) {
        socket.emit('submit_score', { roomCode: currentRoom, roundScore: currentRoundSum });
    }
    
    roundScores = {};
    currentRoundSum = 0;
    currentRound++;
    
    document.getElementById('modeBadge').innerText = `Manche ${currentRound}`;
    document.getElementById('letterDisplay').innerText = '?';
    document.getElementById('scoreSection').style.display = 'none';
    document.getElementById('answersComparison').innerHTML = ''; 
    
    if (!isOnline || isHost) {
        handleStart();
    } else {
        const startBtn = document.getElementById('startBtn');
        if (startBtn) startBtn.style.display = 'none';
        
        const roomDisplay = document.getElementById('roomStatus');
        if (roomDisplay && !document.getElementById('waitNextMsg')) {
            const waitMsg = document.createElement('div');
            waitMsg.id = 'waitNextMsg';
            waitMsg.style.cssText = "text-align: center; color: var(--accent-play); font-weight: bold; margin-top: 15px;";
            waitMsg.innerText = "⏳ In attesa che l'host avvii la prossima manche...";
            roomDisplay.appendChild(waitMsg);
        }
    }
}