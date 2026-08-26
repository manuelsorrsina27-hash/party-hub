
// ==========================================
// LISTA DI PAROLE CON SUGGERIMENTO SEMANTICO
// ==========================================
const localSecretWords = [
    { word: "Pizza", hint: "È un piatto tipico italiano famoso in tutto il mondo." },
    { word: "Spiaggia", hint: "Si associa all'estate, al mare e alla sabbia." },
    { word: "Chitarra", hint: "Uno strumento musicale a corda." },
    { word: "Ospedale", hint: "Un luogo dove ci si reca per cure mediche e visite." },
    { word: "Scuola", hint: "Un ambiente di formazione frequentato da studenti." },
    { word: "Castello", hint: "Una grande fortificazione storica medievale." },
    { word: "Caffè", hint: "Una bevanda scura molto consumata la mattina o dopo i pasti." },
    { word: "Montagna", hint: "Un rilievo geografico elevato, meta di escursioni." },
    { word: "Aeroporto", hint: "Infrastruttura da cui partono e arrivano gli aerei." },
    { word: "Pianoforte", hint: "Strumento musicale acustico a tastiera." },
    { word: "Pasticceria", hint: "Luogo in cui si producono e vendono dolci." },
    { word: "Stadio", hint: "Grande impianto sportivo all'aperto per partite e concerti." },
    { word: "Astronave", hint: "Veicolo progettato per viaggiare nello spazio profondo." },
    { word: "Smartphone", hint: "Dispositivo elettronico tascabile per comunicare e navigare." },
    { word: "Teatro", hint: "Edificio adibito a spettacoli di prosa, danza o musica." },
    { word: "Giungla", hint: "Una foresta tropicale fitta e rigogliosa." },
    { word: "Orologio", hint: "Oggetto portatile o da parete per segnare lo scorrere del tempo." },
    { word: "Leone", hint: "Un felino selvatico considerato il re della savana." },
    { word: "Delfino", hint: "Un mammifero marino noto per la sua intelligenza." },
    { word: "Sushi", hint: "Piatto tradizionale giapponese a base di riso e pesce." }
];

// Switch tra Modalità Locale e Online nell'interfaccia
function switchMode(mode) {
    const btnLocal = document.getElementById('btnLocal');
    const btnOnline = document.getElementById('btnOnline');
    const localSetup = document.getElementById('localSetup');
    const onlineSetup = document.getElementById('onlineSetup');

    if (mode === 'local') {
        btnLocal.classList.add('active');
        btnOnline.classList.remove('active');
        localSetup.style.display = 'block';
        onlineSetup.style.display = 'none';
    } else {
        btnOnline.classList.add('active');
        btnLocal.classList.remove('active');
        onlineSetup.style.display = 'block';
        localSetup.style.display = 'none';
    }
}

// ==========================================
// 1. MODALITÀ LOCALE (1 SOLO TELEFONO)
// ==========================================
let localGameData = {
    players: [],
    currentIndex: 0,
    selectedWordObj: {},
    impostorIndices: [], 
    showHint: false
};

// Funzione di bilanciamento per scegliere gli impostori equamente
function pickBalancedImpostorIndices(players, numImpostors) {
    let historyKey = "impostor_history_" + players.slice().sort().join("_");
    let stats = JSON.parse(localStorage.getItem(historyKey)) || {};

    players.forEach(p => {
        if (stats[p] === undefined) stats[p] = 0;
    });

    let impostorIndices = [];
    let availableIndices = players.map((_, index) => index);

    for (let i = 0; i < numImpostors; i++) {
        availableIndices.sort((a, b) => stats[players[a]] - stats[players[b]] );
        let minCount = stats[players[availableIndices[0]]];
        let candidates = availableIndices.filter(idx => stats[players[idx]] === minCount);

        let chosenLocalIndex = Math.floor(Math.random() * candidates.length);
        let selectedPlayerIndex = candidates[chosenLocalIndex];

        impostorIndices.push(selectedPlayerIndex);
        availableIndices = availableIndices.filter(idx => idx !== selectedPlayerIndex);
        stats[players[selectedPlayerIndex]]++;
    }

    localStorage.setItem(historyKey, JSON.stringify(stats));
    return impostorIndices;
}

function startLocalGame() {
    const input = document.getElementById('localPlayersInput').value;
    const players = input.split(',').map(name => name.trim()).filter(name => name.length > 0);

    if (players.length < 3) {
        alert("Inserisci almeno 3 giocatori per iniziare!");
        return;
    }

    const requestedImpostors = parseInt(document.getElementById('localNumImpostors').value) || 1;
    const showHint = document.getElementById('localShowHint').checked;

    const maxImpostors = Math.max(1, players.length - 1);
    const numImpostors = Math.min(requestedImpostors, maxImpostors);

    let impostorIndices = pickBalancedImpostorIndices(players, numImpostors);
    const randomWordObj = localSecretWords[Math.floor(Math.random() * localSecretWords.length)];

    localGameData.players = players;
    localGameData.currentIndex = 0;
    localGameData.selectedWordObj = randomWordObj;
    localGameData.impostorIndices = impostorIndices;
    localGameData.showHint = showHint;

    document.getElementById('setupScreen').style.display = 'none';
    const gameScreen = document.getElementById('gameScreen');
    gameScreen.style.display = 'block';

    showPassToPlayerStep();
}

function showPassToPlayerStep() {
    const gameScreen = document.getElementById('gameScreen');
    const currentPlayer = localGameData.players[localGameData.currentIndex];

    gameScreen.innerHTML = `
        <h3>Passa il telefono a:</h3>
        <div style="text-align: center; margin: 30px 0;">
            <h2 style="font-size: 2.2rem; color: var(--accent-blue-dark);">${currentPlayer}</h2>
        </div>
        <p style="text-align: center; color: var(--text-muted); margin-bottom: 20px;">Assicurati che gli altri non stiano guardando!</p>
        <button class="primary-btn" onclick="revealRoleStep()">Mostra il mio ruolo</button>
    `;
}

function revealRoleStep() {
    const gameScreen = document.getElementById('gameScreen');
    const currentPlayer = localGameData.players[localGameData.currentIndex];
    const isImpostor = localGameData.impostorIndices.includes(localGameData.currentIndex);

    let roleContent = "";
    if (isImpostor) {
        let hintHtml = "";
        if (localGameData.showHint) {
            const semanticHint = localGameData.selectedWordObj.hint || "Fai attenzione agli indizi degli altri giocatori.";
            hintHtml = `
                <div style="margin-top: 15px; padding: 12px; background: rgba(254, 226, 226, 0.8); border-radius: 8px; border: 1px dashed #ef4444;">
                    <p style="color: #991b1b; font-size: 0.95rem; line-height: 1.4;">💡 <b>Aiuto Semantico:</b> ${semanticHint}</p>
                </div>
            `;
        }

        roleContent = `
            <div style="background: #fee2e2; border: 2px solid #ef4444; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
                <h2 style="color: #dc2626; font-size: 1.8rem; margin-bottom: 10px;">SEI L'IMPOSTORE!</h2>
                <p style="color: #7f1d1d;">Fingi di sapere qual è la parola e non farti scoprire.</p>
                ${hintHtml}
            </div>
        `;
    } else {
        roleContent = `
            <div style="background: #e0f2fe; border: 2px solid #0284c7; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 5px;">La parola segreta è:</p>
                <h2 style="color: var(--accent-blue-dark); font-size: 2rem;">${localGameData.selectedWordObj.word}</h2>
            </div>
        `;
    }

    gameScreen.innerHTML = `
        <h3 style="text-align: center;">Ruolo di ${currentPlayer}</h3>
        ${roleContent}
        <button class="primary-btn" onclick="nextPlayerOrFinish()">Fatto, passa al prossimo</button>
    `;
}

function nextPlayerOrFinish() {
    localGameData.currentIndex++;

    if (localGameData.currentIndex < localGameData.players.length) {
        showPassToPlayerStep();
    } else {
        const gameScreen = document.getElementById('gameScreen');
        gameScreen.innerHTML = `
            <h3 style="text-align: center;">Tutti hanno visto il proprio ruolo!</h3>
            <p style="text-align: center; color: var(--text-muted); margin: 20px 0;">Discutete e fate il vostro giro di indizi dal vivo, poi cliccate qui sotto per rivelare chi era l'impostore.</p>
            <button class="primary-btn" onclick="showLocalRevealScreen()">🕵️‍♂️ Rivela Impostore / Fine</button>
        `;
    }
}

function showLocalRevealScreen() {
    const gameScreen = document.getElementById('gameScreen');
    let impostorNames = localGameData.impostorIndices.map(idx => localGameData.players[idx]).join(', ');

    gameScreen.innerHTML = `
        <div style="background: #f0f9ff; border: 2px solid var(--accent-blue-dark); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
            <h3 style="color: var(--accent-blue-dark); margin-bottom: 10px;">Riepilogo Partita</h3>
            <p style="font-size: 1.1rem; margin-bottom: 8px;">L'impostore era: <b style="color: #dc2626;">${impostorNames}</b></p>
            <p style="font-size: 1.1rem; color: var(--text-muted);">La parola segreta era: <b style="color: var(--accent-blue-dark);">${localGameData.selectedWordObj.word}</b></p>
        </div>
        <button class="primary-btn" onclick="location.reload()">Torna al Menu Principale</button>
    `;
}


// ==========================================
// 2. MODALITÀ MULTIPLAYER ONLINE (SOCKET.IO)
// ==========================================

let currentRoomCode = null;
let isHost = false;
let onlinePlayersList = [];

function createOnlineRoom() {
    const nickname = document.getElementById('onlineNickname').value.trim();
    if (!nickname) {
        alert("Inserisci un nickname valido!");
        return;
    }
    socket.emit('create_impostor_room', { nickname });
}

function joinOnlineRoom() {
    const nickname = document.getElementById('onlineNickname').value.trim();
    const roomCode = document.getElementById('roomCodeInput').value.trim().toUpperCase();
    if (!nickname || !roomCode) {
        alert("Inserisci nickname e codice stanza!");
        return;
    }
    currentRoomCode = roomCode;
    socket.emit('join_impostor_room', { nickname, roomCode });
}

socket.on('impostor_room_created', (code) => {
    currentRoomCode = code;
    isHost = true;
    showLobbyUI(code);
});

socket.on('impostor_room_joined', (code) => {
    currentRoomCode = code;
    isHost = false;
    showLobbyUI(code);
});

function showLobbyUI(code) {
    document.getElementById('onlineNickname').disabled = true;
    document.getElementById('roomCodeInput').disabled = true;
    document.getElementById('onlineLobbyArea').style.display = 'block';
    document.getElementById('displayRoomCode').innerText = code;
}

socket.on('impostor_update_players', (players) => {
    onlinePlayersList = players;
    const list = document.getElementById('playersList');
    if (list) {
        list.innerHTML = players.map(p => `<li style="padding: 4px 0; border-bottom: 1px solid var(--border-color);">👤 ${p.nickname}</li>`).join('');
    }
    
    if (isHost && players.length >= 3) {
        const btnStart = document.getElementById('btnStartOnline');
        if (btnStart) btnStart.style.display = 'block';
    }
});

function startOnlineGame() {
    socket.emit('start_impostor_game', { roomCode: currentRoomCode });
}

socket.on('impostor_role_assigned', ({ isImpostor, secretWord, players }) => {
    onlinePlayersList = players;
    document.getElementById('setupScreen').style.display = 'none';
    const gameScreen = document.getElementById('gameScreen');
    gameScreen.style.display = 'block';

    let roleHtml = "";
    if (isImpostor) {
        roleHtml = `
            <div style="background: #fee2e2; border: 2px solid #ef4444; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 15px;">
                <h2 style="color: #dc2626; font-size: 1.6rem; margin-bottom: 5px;">SEI L'IMPOSTORE!</h2>
                <p style="color: #7f1d1d; font-size: 0.9rem;">Fingi di sapere qual è la parola e ascolta gli indizi.</p>
            </div>
        `;
    } else {
        roleHtml = `
            <div style="background: #e0f2fe; border: 2px solid #0284c7; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 15px;">
                <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 3px;">La parola segreta è:</p>
                <h2 style="color: var(--accent-blue-dark); font-size: 2rem; margin-bottom: 5px;">${secretWord}</h2>
                <p style="color: var(--text-muted); font-size: 0.8rem;">Discutete in chat e fate il giro di indizi!</p>
            </div>
        `;
    }

    gameScreen.innerHTML = `
        ${roleHtml}
        
        <div style="display: flex; flex-direction: column; background: #f8fafc; border: 2px solid var(--border-color); border-radius: var(--radius-md); padding: 10px; margin-bottom: 15px;">
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 5px; font-weight: bold;">💬 Chat di Gruppo:</p>
            <div id="chatMessages" style="height: 180px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; font-size: 0.9rem; padding-right: 5px;"></div>
            <div style="display: flex; gap: 5px;">
                <input type="text" id="chatInput" placeholder="Scrivi il tuo indizio o messaggio..." onkeypress="checkChatEnter(event)" style="padding: 8px 12px; font-size: 0.9rem;">
                <button class="primary-btn" onclick="sendChatMessage()" style="width: auto; padding: 8px 14px; font-size: 0.9rem;">Invia</button>
            </div>
        </div>

        <button class="primary-btn" onclick="showVotingScreen()" style="background: #dc2626;">Procedi alla Votazione / Accusa</button>
    `;
});

function showVotingScreen() {
    const gameScreen = document.getElementById('gameScreen');
    let html = `
        <h3 style="text-align: center; margin-bottom: 15px;">Chi è l'Impostore? Vota!</h3>
        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
    `;

    onlinePlayersList.forEach(p => {
        if (p.id !== socket.id) {
            html += `<button class="secondary-btn" onclick="submitVote('${p.id}')">Vota ${p.nickname}</button>`;
        }
    });

    html += `</div>`;
    gameScreen.innerHTML = html;
}

function submitVote(targetId) {
    socket.emit('submit_impostor_vote', { roomCode: currentRoomCode, targetId });
    const gameScreen = document.getElementById('gameScreen');
    gameScreen.innerHTML = `
        <h3 style="text-align: center; margin-top: 30px;">Voto registrato!</h3>
        <p style="text-align: center; color: var(--text-muted); margin-top: 10px;">In attesa degli altri giocatori...</p>
    `;
}

socket.on('impostor_game_over', ({ impostorName, foundImpostor, secretWord }) => {
    const gameScreen = document.getElementById('gameScreen');
    let resultBox = foundImpostor ? 
        `<div style="background: #dcfce7; border: 2px solid #22c55e; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
            <h2 style="color: #15803d; margin-bottom: 5px;">Bravi! Avete trovato l'impostore!</h2>
         </div>` :
        `<div style="background: #fee2e2; border: 2px solid #ef4444; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
            <h2 style="color: #dc2626; margin-bottom: 5px;">L'impostore l'ha fatta franca!</h2>
         </div>`;

    gameScreen.innerHTML = `
        ${resultBox}
        <p style="text-align: center; font-size: 1.1rem; margin-bottom: 5px;">L'impostore era: <b>${impostorName}</b></p>
        <p style="text-align: center; color: var(--text-muted); margin-bottom: 20px;">La parola segreta era: <b>${secretWord}</b></p>
        <button class="primary-btn" onclick="location.reload()">Torna al Menu</button>
    `;
});

// ==========================================
// FUNZIONI DI GESTIONE CHAT UNIFICATE
// ==========================================
function sendChatMessage() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    const message = input.value.trim();
    
    if (message !== "" && currentRoomCode) {
        socket.emit('send_impostor_chat', { roomCode: currentRoomCode, message });
        input.value = "";
    }
}

function checkChatEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendChatMessage();
    }
}

// Gestione globale del tasto Invio sulla chat
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.id === 'chatInput') {
            event.preventDefault();
            sendChatMessage();
        }
    }
});

// UNICO ASCOLTATORE DEFINITIVO PER LA RICEZIONE DEI MESSAGGI
socket.on('impostor_receive_chat', ({ sender, message }) => {
    const chatContainer = document.getElementById('chatMessages');
    if (!chatContainer) return;

    const nickInput = document.getElementById('onlineNickname');
    const myName = nickInput ? nickInput.value.trim() : "";
    const isMe = myName !== "" && sender === myName;

    const msgElement = document.createElement('div');
    msgElement.style.padding = "6px 10px";
    msgElement.style.borderRadius = "8px";
    msgElement.style.maxWidth = "85%";
    msgElement.style.wordBreak = "break-word";

    if (isMe) {
        msgElement.style.background = "#e0f2fe";
        msgElement.style.alignSelf = "flex-end";
        msgElement.innerHTML = `<span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Io</span> ${message}`;
    } else {
        msgElement.style.background = "#ffffff";
        msgElement.style.border = "1px solid var(--border-color)";
        msgElement.style.alignSelf = "flex-start";
        msgElement.innerHTML = `<span style="font-size: 0.75rem; color: var(--accent-blue-dark); font-weight: bold; display: block;">${sender}</span> ${message}`;
    }

    chatContainer.appendChild(msgElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
});

socket.on('impostor_error', (msg) => {
    alert(msg);
});