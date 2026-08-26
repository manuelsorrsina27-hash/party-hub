const socket = io();

let currentMode = 'local';
let roomCode = '';
let isHost = false;
let currentQuestionIndex = 0;
let score = 0;
let timerInterval = null;
let questions = [];

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
    questions = [...triviaData].sort(() => Math.random() - 0.5);
    currentQuestionIndex = 0;
    score = 0;
    
    document.getElementById('setupScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    showQuestion();
}

function showQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showLocalResults();
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
        btn.onclick = () => handleLocalAnswer(idx === qData.correct);
        container.appendChild(btn);
    });

    startTimer(10, () => handleLocalAnswer(false));
}

function handleLocalAnswer(isCorrect) {
    clearInterval(timerInterval);
    if (isCorrect) score += 10;
    currentQuestionIndex++;
    showQuestion();
}

function showLocalResults() {
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('resultsScreen').style.display = 'block';
    document.getElementById('scoreboard').innerHTML = `<h4>Punteggio Finale: <strong>${score} Punti</strong></h4>`;
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
    const nick = document.getElementById('onlineNickname').value.trim();
    if (!nick) return alert("Inserisci un nickname!");
    socket.emit('create_trivia_room', { nickname: nick });
}

function joinOnlineRoom() {
    const nick = document.getElementById('onlineNickname').value.trim();
    const code = document.getElementById('roomCodeInput').value.trim().toUpperCase();
    if (!nick || !code) return alert("Inserisci Nickname e Codice Stanza!");
    socket.emit('join_trivia_room', { nickname: nick, roomCode: code });
}

function startOnlineGame() {
    socket.emit('start_trivia_game', { roomCode });
}

socket.on('trivia_room_created', (code) => {
    roomCode = code;
    isHost = true;
    setupLobbyUI();
});

socket.on('trivia_room_joined', (code) => {
    roomCode = code;
    setupLobbyUI();
});

function setupLobbyUI() {
    document.getElementById('onlineLobbyArea').style.display = 'block';
    document.getElementById('displayRoomCode').innerText = roomCode;
    if (isHost) document.getElementById('btnStartOnline').style.display = 'block';
}

socket.on('trivia_update_players', (players) => {
    const list = document.getElementById('playersList');
    list.innerHTML = players.map(p => `<li>👤 ${p.nickname}</li>`).join('');
});

socket.on('trivia_game_started', (qDataList) => {
    questions = qDataList;
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById('setupScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    showOnlineQuestion();
});

function showOnlineQuestion() {
    if (currentQuestionIndex >= questions.length) {
        clearInterval(timerInterval);
        socket.emit('submit_trivia_score', { roomCode, score });
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
            if (idx === qData.correct) score += 10;
            
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