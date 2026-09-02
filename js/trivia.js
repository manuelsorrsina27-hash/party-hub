let socket;
try {
    socket = io();
} catch (e) {
    console.log("Socket.io non disponibile, modalità online disattivata.");
}

let currentMode = 'local';
let roomCode = '';
let isHost = false;
let currentQuestionIndex = 0;
let timerInterval = null;
let questions = [];

// Variabili per la modalità locale con giocatori multipli
let localPlayers = [];
let currentPlayerIndex = 0;
let correctCount = 0;
let wrongCount = 0;

// Lista Domande Trivia
const triviaData = [
    { q: "Qual è la capitale dell'Australia?", options: ["Sydney", "Melbourne", "Canberra", "Brisbane"], correct: 2 },
    { q: "In che anno è affondato il Titanic?", options: ["1912", "1905", "1920", "1898"], correct: 0 },
    { q: "Qual è l'elemento chimico con simbolo 'Fe'?", options: ["Fluoro", "Ferro", "Fosforo", "Francio"], correct: 1 },
    { q: "Quanti pianeti compongono il sistema solare?", options: ["7", "8", "9", "10"], correct: 1 },
    { q: "Chi ha dipinto la 'Notte Stellata'?", options: ["Monet", "Picasso", "Van Gogh", "Da Vinci"], correct: 2 },
    { q: "Qual è il fiume più lungo del mondo?", options: ["Nilo", "Reno", "Soffice", "Inca"], correct: 0 },
    { q: "Quale organo del corpo umano produce l'insulina?", options: ["Fegato", "Cervello", "Pancreas", "Reni"], correct: 2 },
    { q: "Quante corde ha una chitarra classica standard?", options: ["4", "5", "6", "8"], correct: 2 },
    { q: "In quale Paese si trova la Grande Barriera Corallina?", options: ["Brasile", "Australia", "Filippine", "Messico"], correct: 1 },
    { q: "Chi ha scritto 'Divina Commedia'?", options: ["Boccaccio", "Petrarca", "Dante Alighieri", "Machiavelli"], correct: 2 }
];

function switchMode(mode) {
    currentMode = mode;
    document.getElementById('btnLocal').classList.toggle('active', mode === 'local');
    document.getElementById('btnOnline').classList.toggle('active', mode === 'online');
    document.getElementById('localSetup').style.display = mode === 'local' ? 'block' : 'none';
    document.getElementById('onlineSetup').style.display = mode === 'online' ? 'block' : 'none';
}

// --- LOGICA LOCALE ---
function startLocalGame() {
    const inputVal = document.getElementById('localPlayersInput').value.trim();
    if (!inputVal) {
        localPlayers = [{ name: "Giocatore 1", score: 0, correct: 0, wrong: 0 }];
    } else {
        localPlayers = inputVal.split(',').map(n => n.name = n.trim()).filter(n => n.length > 0).map(name => ({
            name, score: 0, correct: 0, wrong: 0
        }));
        if (localPlayers.length === 0) {
            localPlayers = [{ name: "Giocatore 1", score: 0, correct: 0, wrong: 0 }];
        }
    }

    questions = [...triviaData].sort(() => Math.random() - 0.5).slice(0, 5); // 5 o 10 domande
    currentQuestionIndex = 0;
    currentPlayerIndex = 0;
    correctCount = 0;
    wrongCount = 0;
    
    document.getElementById('setupScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    showQuestion();
}

function showQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showLocalResults();
        return;
    }

    const currentPlayer = localPlayers[currentPlayerIndex];
    document.getElementById('currentTurnPlayer').innerText = `👤 Turno di: ${currentPlayer.name}`;
    document.getElementById('questionCounter').innerText = `Domanda ${currentQuestionIndex + 1}/${questions.length}`;
    document.getElementById('liveCorrect').innerText = correctCount;
    document.getElementById('liveWrong').innerText = wrongCount;
    document.getElementById('btnNextQuestion').style.display = 'none';

    const qData = questions[currentQuestionIndex];
    document.getElementById('questionText').innerText = qData.q;
    
    const container = document.getElementById('optionsContainer');
    container.innerHTML = '';

    qData.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'secondary-btn';
        btn.innerText = opt;
        btn.onclick = () => handleLocalAnswer(idx, qData.correct);
        container.appendChild(btn);
    });

    startTimer(10, () => handleLocalAnswer(-1, qData.correct));
}

function handleLocalAnswer(selectedIndex, correctIndex) {
    clearInterval(timerInterval);
    const buttons = document.querySelectorAll('#optionsContainer button');
    
    // Disabilita tutti i pulsanti e mostra la risposta corretta
    buttons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === correctIndex) {
            btn.style.background = '#16a34a'; // Verde per la corretta
            btn.style.color = 'white';
        } else if (idx === selectedIndex && idx !== correctIndex) {
            btn.style.background = '#ef4444'; // Rosso per l'errata selezionata
            btn.style.color = 'white';
        }
    });

    const currentPlayer = localPlayers[currentPlayerIndex];

    if (selectedIndex === correctIndex) {
        currentPlayer.score += 10;
        currentPlayer.correct++;
        correctCount++;
    } else {
        currentPlayer.wrong++;
        wrongCount++;
    }

    document.getElementById('liveCorrect').innerText = correctCount;
    document.getElementById('liveWrong').innerText = wrongCount;

    // Mostra il pulsante Avanti
    document.getElementById('btnNextQuestion').style.display = 'block';
}

function nextQuestionLocal() {
    currentQuestionIndex++;
    // Passa al giocatore successivo per ruotare i turni sullo stesso telefono, oppure prosegui
    currentPlayerIndex = (currentPlayerIndex + 1) % localPlayers.length;
    showQuestion();
}

function showLocalResults() {
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('resultsScreen').style.display = 'block';
    
    let html = '<ul style="list-style: none; padding: 0;">';
    localPlayers.sort((a, b) => b.score - a.score).forEach((p, i) => {
        html += `<li style="padding: 10px; border-bottom: 1px solid #ddd; font-size: 1.1rem;">
            ${i + 1}. <strong>${p.name}</strong> — Punti: <strong>${p.score}</strong> 
            <span style="font-size: 0.85rem; color: var(--text-muted); display: block;">(✅ ${p.correct} giuste | ❌ ${p.wrong} errate)</span>
        </li>`;
    });
    html += '</ul>';
    
    document.getElementById('scoreboard').innerHTML = html;
}

function startTimer(seconds, onExpire) {
    clearInterval(timerInterval);
    let left = seconds;
    document.getElementById('timer').innerText = left;
    
    timerInterval = setInterval(() => {
        left--;
        document.getElementById('timer').innerText = left;
        if (left <= 0) {
            clearInterval(timerInterval);
            onExpire();
        }
    }, 1000);
}

// --- LOGICA ONLINE ---
function createOnlineRoom() {
    if (!socket) return alert("Connessione al server non disponibile.");
    const nick = document.getElementById('onlineNickname').value.trim();
    if (!nick) return alert("Inserisci un nickname!");
    socket.emit('create_trivia_room', { nickname: nick });
}

function joinOnlineRoom() {
    if (!socket) return alert("Connessione al server non disponibile.");
    const nick = document.getElementById('onlineNickname').value.trim();
    const code = document.getElementById('roomCodeInput').value.trim().toUpperCase();
    if (!nick || !code) return alert("Inserisci Nickname e Codice Stanza!");
    socket.emit('join_trivia_room', { nickname: nick, roomCode: code });
}

function startOnlineGame() {
    if (!socket) return;
    socket.emit('start_trivia_game', { roomCode });
}

if (socket) {
    socket.on('trivia_room_created', (code) => {
        roomCode = code;
        isHost = true;
        setupLobbyUI();
    });

    socket.on('trivia_room_joined', (code) => {
        roomCode = code;
        setupLobbyUI();
    });

    socket.on('trivia_update_players', (players) => {
        const list = document.getElementById('playersList');
        if (list) {
            list.innerHTML = players.map(p => `<li>👤 ${p.nickname}</li>`).join('');
        }
    });

    socket.on('trivia_game_started', (qDataList) => {
        questions = qDataList;
        currentQuestionIndex = 0;
        document.getElementById('setupScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'block';
        showOnlineQuestion();
    });

    socket.on('trivia_game_over', (finalScores) => {
        clearInterval(timerInterval);
        document.getElementById('gameScreen').style.display = 'none';
        document.getElementById('resultsScreen').style.display = 'block';
        
        let html = '<ul style="list-style: none; padding: 0;">';
        finalScores.sort((a, b) => b.score - a.score).forEach((p, i) => {
            html += `<li style="padding: 8px; border-bottom: 1px solid #ddd;">${i + 1}. <strong>${p.nickname}</strong>: ${p.score} Punti</li>`;
        });
        html += '</ul>';
        
        document.getElementById('scoreboard').innerHTML = html;
    });

    socket.on('trivia_error', (msg) => alert(msg));
}

function setupLobbyUI() {
    document.getElementById('onlineLobbyArea').style.display = 'block';
    document.getElementById('displayRoomCode').innerText = roomCode;
    if (isHost) document.getElementById('btnStartOnline').style.display = 'block';
}

function showOnlineQuestion() {
    if (currentQuestionIndex >= questions.length) {
        clearInterval(timerInterval);
        if (socket) socket.emit('submit_trivia_score', { roomCode, score: window.onlineScore || 0 });
        return;
    }

    const qData = questions[currentQuestionIndex];
    document.getElementById('questionCounter').innerText = `Domanda ${currentQuestionIndex + 1}/${questions.length}`;
    document.getElementById('questionText').innerText = qData.q;
    
    const container = document.getElementById('optionsContainer');
    container.innerHTML = '';

    qData.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'secondary-btn';
        btn.innerText = opt;
        btn.onclick = () => {
            clearInterval(timerInterval);
            disableOptions();
            if (idx === qData.correct) {
                window.onlineScore = (window.onlineScore || 0) + 10;
            }
            currentQuestionIndex++;
            setTimeout(showOnlineQuestion, 500);
        };
        container.appendChild(btn);
    });

    startTimer(10, () => {
        disableOptions();
        currentQuestionIndex++;
        setTimeout(showOnlineQuestion, 500);
    });
}

function disableOptions() {
    const btns = document.querySelectorAll('#optionsContainer button');
    btns.forEach(b => b.disabled = true);
}