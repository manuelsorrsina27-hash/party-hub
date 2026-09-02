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

// Variabili per la modalità locale a turni con più giocatori
let localPlayers = [];
let currentPlayerIndex = 0;
let gamePlayMode = 'questions'; // 'questions' o 'lives'
let targetQuestionCount = 10;
const MAX_LIVES = 3;

// Lista di 100 Domande Trivia
const triviaData = [
    { q: "Qual è la capitale dell'Australia?", options: ["Sydney", "Melbourne", "Canberra", "Brisbane"], correct: 2 },
    { q: "In che anno è affondato il Titanic?", options: ["1912", "1905", "1920", "1898"], correct: 0 },
    { q: "Qual è l'elemento chimico con simbolo 'Fe'?", options: ["Fluoro", "Ferro", "Fosforo", "Francio"], correct: 1 },
    { q: "Quanti pianeti compongono il sistema solare?", options: ["7", "8", "9", "10"], correct: 1 },
    { q: "Chi ha dipinto la 'Notte Stellata'?", options: ["Monet", "Picasso", "Van Gogh", "Da Vinci"], correct: 2 },
    { q: "Qual è il fiume più lungo del mondo?", options: ["Nilo", "Reno", "Mekong", "Rio delle Amazzoni"], correct: 0 },
    { q: "Quale organo del corpo umano produce l'insulina?", options: ["Fegato", "Cervello", "Pancreas", "Reni"], correct: 2 },
    { q: "Quante corde ha una chitarra classica standard?", options: ["4", "5", "6", "8"], correct: 2 },
    { q: "In quale Paese si trova la Grande Barriera Corallina?", options: ["Brasile", "Australia", "Filippine", "Messico"], correct: 1 },
    { q: "Chi ha scritto la 'Divina Commedia'?", options: ["Boccaccio", "Petrarca", "Dante Alighieri", "Machiavelli"], correct: 2 },
    { q: "Qual è il pianeta più caldo del sistema solare?", options: ["Mercurio", "Venere", "Marte", "Giove"], correct: 1 },
    { q: "In quale anno è caduto il Muro di Berlino?", options: ["1987", "1989", "1991", "1985"], correct: 1 },
    { q: "Qual è la lingua più parlata al mondo per numero di madrelingua?", options: ["Inglese", "Spagnolo", "Mandarino", "Hindi"], correct: 2 },
    { q: "Chi ha dipinto la Cappella Sistina?", options: ["Raffaello", "Donatello", "Michelangelo", "Caravaggio"], correct: 2 },
    { q: "Quale gas compone la maggior parte dell'atmosfera terrestre?", options: ["Ossigeno", "Azoto", "Anidride carbonica", "Idrogeno"], correct: 1 },
    { q: "In quale continente si trova il deserto del Kalahari?", options: ["Asia", "Sud America", "Africa", "Oceania"], correct: 2 },
    { q: "Qual è l'unità di misura della resistenza elettrica?", options: ["Volt", "Watt", "Ampere", "Ohm"], correct: 3 },
    { q: "Chi ha scoperto la penicillina?", options: ["Louis Pasteur", "Alexander Fleming", "Marie Curie", "Albert Einstein"], correct: 1 },
    { q: "Qual è la capitale del Canada?", options: ["Toronto", "Vancouver", "Ottawa", "Montreal"], correct: 2 },
    { q: "Quanti tasti ha un pianoforte standard?", options: ["88", "76", "64", "92"], correct: 0 },
    { q: "Qual è il metallo più abbondante nella crosta terrestre?", options: ["Ferro", "Rame", "Alluminio", "Oro"], correct: 2 },
    { q: "In che anno l'uomo è sbarcato sulla Luna?", options: ["1967", "1969", "1971", "1965"], correct: 1 },
    { q: "Chi ha scritto '1984'?", options: ["Aldous Huxley", "George Orwell", "Ray Bradbury", "J.D. Salinger"], correct: 1 },
    { q: "Qual è l'oceano più grande della Terra?", options: ["Atlantico", "Indiano", "Artico", "Pacifico"], correct: 3 },
    { q: "Quale animale è noto per cambiare colore?", options: ["Cameleonte", "Iguana", "Geco", "Salamandra"], correct: 0 },
    { q: "Qual è la montagna più alta del mondo?", options: ["K2", "Kangchenjunga", "Monte Everest", "Makalu"], correct: 2 },
    { q: "In quale città si trova il Colosseo?", options: ["Parigi", "Atene", "Roma", "Il Cairo"], correct: 2 },
    { q: "Quale paese ha vinto più Coppe del Mondo FIFA?", options: ["Germania", "Argentina", "Italia", "Brasile"], correct: 3 },
    { q: "Chi ha formulato la teoria della relatività?", options: ["Isaac Newton", "Galileo Galilei", "Albert Einstein", "Nikola Tesla"], correct: 2 },
    { q: "Qual è il simbolo chimico dell'oro?", options: ["Ag", "Au", "Pb", "Fe"], correct: 1 },
    { q: "In quale stato americano si trova la Silicon Valley?", options: ["New York", "Texas", "California", "Washington"], correct: 2 },
    { q: "Qual è la capitale del Giappone?", options: ["Kyoto", "Osaka", "Tokyo", "Hiroshima"], correct: 2 },
    { q: "Chi ha dipinto 'L'Ultima Cena'?", options: ["Giotto", "Leonardo da Vinci", "Caravaggio", "Tiziano"], correct: 1 },
    { q: "Qual è l'organo più grande del corpo umano?", options: ["Fegato", "Cervello", "Pelle", "Polmoni"], correct: 2 },
    { q: "Quanti giocatori ci sono in una squadra di calcio in campo?", options: ["9", "10", "11", "12"], correct: 2 },
    { q: "Qual è la valuta ufficiale del Regno Unito?", options: ["Euro", "Dollaro", "Sterlina", "Franco"], correct: 2 },
    { q: "In quale anno è iniziata la Prima Guerra Mondiale?", options: ["1912", "1914", "1916", "1918"], correct: 1 },
    { q: "Qual è l'animale terrestre più veloce?", options: ["Leone", "Ghepardo", "Gazzella", "Tigre"], correct: 1 },
    { q: "Chi ha scritto 'I Promessi Sposi'?", options: ["Giacomo Leopardi", "Alessandro Manzoni", "Giovanni Boccaccio", "Ugo Foscolo"], correct: 1 },
    { q: "Qual è la capitale della Spagna?", options: ["Barcellona", "Valencia", "Madrid", "Siviglia"], correct: 2 },
    { q: "Quale pianeta è noto come il Pianeta Rosso?", options: ["Venere", "Saturno", "Marte", "Giove"], correct: 2 },
    { q: "Chi ha inventato la lampadina a incandescenza commerciale?", options: ["Nikola Tesla", "Thomas Edison", "Alexander Graham Bell", "Guglielmo Marconi"], correct: 1 },
    { q: "Qual è il deserto più grande del mondo (incluso l'Antartide)?", options: ["Sahara", "Deserto Antartico", "Gobi", "Kalahari"], correct: 1 },
    { q: "In quale anno è finita la Seconda Guerra Mondiale?", options: ["1943", "1945", "1947", "1950"], correct: 1 },
    { q: "Qual è il paese più esteso del mondo?", options: ["Cina", "Canada", "Stati Uniti", "Russia"], correct: 3 },
    { q: "Quale vitamina è nota come la vitamina del sole?", options: ["Vitamina A", "Vitamina B12", "Vitamina C", "Vitamina D"], correct: 3 },
    { q: "Chi ha scolpito il David?", options: ["Donatello", "Michelangelo", "Bernini", "Canova"], correct: 1 },
    { q: "Qual è la capitale dell'Italia?", options: ["Milano", "Firenze", "Roma", "Napoli"], correct: 2 },
    { q: "Quale gas è essenziale per la fotosintesi clorofilliana oltre all'acqua?", options: ["Ossigeno", "Anidride carbonica", "Azoto", "Elio"], correct: 1 },
    { q: "In quale paese sono nate le Olimpiadi?", options: ["Italia", "Egitto", "Grecia", "Francia"], correct: 2 },
    { q: "Qual è il numero atomico del carbonio?", options: ["5", "6", "7", "8"], correct: 1 },
    { q: "Chi ha scritto 'La Divina Commedia'?", options: ["Dante Alighieri", "Petrarca", "Boccaccio", "Ariosto"], correct: 0 },
    { q: "Quale osso è il più lungo del corpo umano?", options: ["Omero", "Tibia", "Femore", "Radio"], correct: 2 },
    { q: "In quale città ha sede l'Unione Europea?", options: ["Parigi", "Bruxelles", "Strasburgo", "Francoforte"], correct: 1 },
    { q: "Qual è il mare più salato del mondo (senza sbocchi)?", options: ["Mar Morto", "Mar Rosso", "Mar Caspio", "Mar Nero"], correct: 0 },
    { q: "Chi compose la Nona Sinfonia?", options: ["Mozart", "Bach", "Beethoven", "Vivaldi"], correct: 2 },
    { q: "Qual è l'isola più grande del mondo?", options: ["Madagascar", "Groenlandia", "Nuova Guinea", "Borneo"], correct: 1 },
    { q: "Quale pianeta ha più lune confermate?", options: ["Giove", "Saturno", "Urano", "Nettuno"], correct: 1 },
    { q: "In quale anno è stato fondato l'Impero Romano?", options: ["753 a.C.", "27 a.C.", "476 d.C.", "14 d.C."], correct: 1 },
    { q: "Qual è l'elemento chimico più leggero?", options: ["Elio", "Idrogeno", "Litio", "Azoto"], correct: 1 },
    { q: "Chi ha dipinto la 'Ragazza con l'orecchino di perla'?", options: ["Rembrandt", "Johannes Vermeer", "Van Gogh", "Rubens"], correct: 1 },
    { q: "Qual è la capitale dell'Argentina?", options: ["Buenos Aires", "Santiago", "Lima", "Bogotà"], correct: 0 },
    { q: "Quale scienziato propose il modello eliocentrico?", options: ["Tolomeo", "Niccolò Copernico", "Giordano Bruno", "Keplero"], correct: 1 },
    { q: "Qual è la lingua ufficiale del Brasile?", options: ["Spagnolo", "Portoghese", "Inglese", "Italiano"], correct: 1 },
    { q: "In quale anno è caduta la Repubblica Romana e nato l'Impero?", options: ["27 a.C.", "44 a.C.", "31 a.C.", "14 d.C."], correct: 0 },
    { q: "Qual è il secondo pianeta del sistema solare in ordine di distanza dal Sole?", options: ["Mercurio", "Venere", "Marte", "Terra"], correct: 1 },
    { q: "Chi ha scritto 'Amleto'?", options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"], correct: 1 },
    { q: "Qual è la capitale della Germania?", options: ["Monaco", "Francoforte", "Berlino", "Amburgo"], correct: 2 },
    { q: "Quale molecola trasporta l'informazione genetica negli esseri viventi?", options: ["RNA", "Proteina", "DNA", "Lipide"], correct: 2 },
    { q: "In quale oceano si trova l'isola di Madagascar?", options: ["Oceano Atlantico", "Oceano Pacifico", "Oceano Indiano", "Oceano Artico"], correct: 2 },
    { q: "Qual è il più grande mammifero marino?", options: ["Orca", "Balenottera azzurra", "Capodoglio", "Squalo balena"], correct: 1 },
    { q: "Chi ha scoperto la legge di gravitazione universale?", options: ["Galileo Galilei", "Isaac Newton", "Albert Einstein", "Archimede"], correct: 1 },
    { q: "Qual è la capitale della Francia?", options: ["Lione", "Marsiglia", "Parigi", "Nizza"], correct: 2 },
    { q: "Quanti continenti ci sono sulla Terra (convenzione standard)?", options: ["5", "6", "7", "8"], correct: 2 },
    { q: "Quale pittore è associato al cubismo insieme a Picasso?", options: ["Henri Matisse", "Georges Braque", "Salvador Dalì", "Paul Cézanne"], correct: 1 },
    { q: "Qual è il fiume più lungo d'Europa?", options: ["Danubio", "Reno", "Volga", "Senna"], correct: 2 },
    { q: "In quale anno si tennero le prime Olimpiadi dell'era moderna?", options: ["1892", "1896", "1900", "1904"], correct: 1 },
    { q: "Quale imperatore romano rese il cristianesimo religione ufficiale?", options: ["Augusto", "Nerone", "Costantino", "Teodosio I"], correct: 3 },
    { q: "Qual è il simbolo chimico del sodio?", options: ["So", "Sd", "Na", "K"], correct: 2 },
    { q: "Chi ha scritto 'Guerra e Pace'?", options: ["Fëdor Dostoevskij", "Lev Tolstoj", "Anton Čechov", "Maksim Gorkij"], correct: 1 },
    { q: "Qual è la capitale del Portogallo?", options: ["Porto", "Lisbona", "Coimbra", "Faro"], correct: 1 },
    { q: "Quale organo controlla il sistema nervoso centrale?", options: ["Cuore", "Midollo spinale", "Cervello", "Fegato"], correct: 2 },
    { q: "In quale regione geografica si trova la Cappadocia?", options: ["Grecia", "Turchia", "Italia", "Egitto"], correct: 1 },
    { q: "Qual è il gas più abbondante nell'atmosfera di Marte?", options: ["Ossigeno", "Azoto", "Anidride carbonica", "Metano"], correct: 2 },
    { q: "Chi ha diretto il film '2001: Odissea nello spazio'?", options: ["Steven Spielberg", "Stanley Kubrick", "Christopher Nolan", "Ridley Scott"], correct: 1 },
    { q: "Qual è la valuta ufficiale del Giappone?", options: ["Yuan", "Won", "Yen", "Ringgit"], correct: 2 },
    { q: "In che anno è stata fondata la Microsoft?", options: ["1975", "1980", "1985", "1990"], correct: 0 },
    { q: "Qual è la capitale dell'Egitto?", options: ["Alessandria", "Il Cairo", "Luxor", "Giza"], correct: 1 },
    { q: "Quale animale è il simbolo del WWF?", options: ["Leone", "Tigre", "Panda", "Orso polare"], correct: 2 },
    { q: "Chi ha scritto 'Il piccolo principe'?", options: ["Antoine de Saint-Exupéry", "Victor Hugo", "Albert Camus", "Jean-Paul Sartre"], correct: 0 },
    { q: "Qual è la catena montuosa più lunga del mondo sulla terraferma?", options: ["Himalaya", "Alpi", "Ande", "Montagne Rocciose"], correct: 2 },
    { q: "Quale pianeta ruota 'sdraiato' sul suo fianco?", options: ["Giove", "Saturno", "Urano", "Nettuno"], correct: 2 },
    { q: "In quale anno è sbarcato Cristoforo Colombo in America?", options: ["1492", "1488", "1500", "1478"], correct: 0 },
    { q: "Qual è il minerale più duro conosciuto in natura?", options: ["Quarzo", "Corindone", "Diamante", "Topazio"], correct: 2 },
    { q: "Chi ha dipinto la 'Guernica'?", options: ["Salvador Dalì", "Pablo Picasso", "Joan Mirò", "Henri Matisse"], correct: 1 },
    { q: "Qual è la capitale della Norvegia?", options: ["Stoccolma", "Copenaghen", "Oslo", "Helsinki"], correct: 2 },
    { q: "Quale re fu decapitato durante la Rivoluzione francese?", options: ["Luigi XIV", "Luigi XV", "Luigi XVI", "Enrico IV"], correct: 2 },
    { q: "Qual è il lago più profondo del mondo?", options: ["Lago Superiore", "Lago Vittoria", "Lago Baikal", "Lago Titicaca"], correct: 2 },
    { q: "Chi ha inventato il World Wide Web?", options: ["Bill Gates", "Steve Jobs", "Tim Berners-Lee", "Mark Zuckerberg"], correct: 2 }
];

function switchMode(mode) {
    currentMode = mode;
    document.getElementById('btnLocal').classList.toggle('active', mode === 'local');
    document.getElementById('btnOnline').classList.toggle('active', mode === 'online');
    document.getElementById('localSetup').style.display = mode === 'local' ? 'block' : 'none';
    document.getElementById('onlineSetup').style.display = mode === 'online' ? 'block' : 'none';
}

// Funzione per mostrare/nascondere le opzioni in base alla scelta della modalità di gioco locale
function handleGameModeChange() {
    gamePlayMode = document.getElementById('gamePlayModeSelect').value;
    const countGroup = document.getElementById('questionCountGroup');
    if (gamePlayMode === 'questions') {
        countGroup.style.display = 'block';
    } else {
        countGroup.style.display = 'none';
    }
}

// --- LOGICA LOCALE ---
function startLocalGame() {
    const inputVal = document.getElementById('localPlayersInput').value.trim();
    if (!inputVal) {
        localPlayers = [{ name: "Giocatore 1", score: 0, correct: 0, wrong: 0, lives: MAX_LIVES, eliminated: false }];
    } else {
        localPlayers = inputVal.split(',').map(name => ({
            name: name.trim(),
            score: 0,
            correct: 0,
            wrong: 0,
            lives: MAX_LIVES,
            eliminated: false
        })).filter(p => p.name.length > 0);

        if (localPlayers.length === 0) {
            localPlayers = [{ name: "Giocatore 1", score: 0, correct: 0, wrong: 0, lives: MAX_LIVES, eliminated: false }];
        }
    }

    gamePlayMode = document.getElementById('gamePlayModeSelect').value;
    targetQuestionCount = parseInt(document.getElementById('questionCountSelect').value) || 10;

    // Prendi un numero casuale di domande fino a 100 in base alla scelta (o tutte se mod a vite)
    const poolSize = gamePlayMode === 'lives' ? triviaData.length : Math.min(targetQuestionCount, triviaData.length);
    questions = [...triviaData].sort(() => Math.random() - 0.5).slice(0, poolSize);
    
    currentQuestionIndex = 0;
    currentPlayerIndex = 0;
    
    document.getElementById('setupScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    showQuestion();
}

function showQuestion() {
    // Se finiscono le domande in modalità domande, vai ai risultati
    if (gamePlayMode === 'questions' && currentQuestionIndex >= questions.length) {
        showLocalResults();
        return;
    }

    // Se siamo in modalità a vite, controlla quanti giocatori sono rimasti in gioco
    if (gamePlayMode === 'lives') {
        const activePlayers = localPlayers.filter(p => !p.eliminated);
        if (activePlayers.length === 0 || currentQuestionIndex >= questions.length) {
            showLocalResults();
            return;
        }
    }

    // Salta i giocatori eventualmente eliminati nella modalità a vite
    let loops = 0;
    while (localPlayers[currentPlayerIndex].eliminated && loops < localPlayers.length) {
        currentPlayerIndex = (currentPlayerIndex + 1) % localPlayers.length;
        loops++;
    }

    const currentPlayer = localPlayers[currentPlayerIndex];
    if (currentPlayer.eliminated) {
        showLocalResults();
        return;
    }

    // Mostra intestazione turno e informazioni di gioco
    let turnText = `👤 Turno di: ${currentPlayer.name}`;
    if (gamePlayMode === 'lives') {
        let hearts = '❤️'.repeat(Math.max(0, currentPlayer.lives)) + '🖤'.repeat(Math.max(0, MAX_LIVES - currentPlayer.lives));
        turnText += ` | Vite: ${hearts}`;
    }
    document.getElementById('currentTurnPlayer').innerText = turnText;
    document.getElementById('questionCounter').innerText = `Domanda ${currentQuestionIndex + 1}${gamePlayMode === 'questions' ? '/' + questions.length : ''}`;
    
    // Mostra le statistiche in tempo reale SPECIFICHE del giocatore di turno
    document.getElementById('liveCorrect').innerText = currentPlayer.correct;
    document.getElementById('liveWrong').innerText = currentPlayer.wrong;
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
    
    buttons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === correctIndex) {
            btn.style.background = '#16a34a';
            btn.style.color = 'white';
        } else if (idx === selectedIndex && idx !== correctIndex) {
            btn.style.background = '#ef4444';
            btn.style.color = 'white';
        }
    });

    const currentPlayer = localPlayers[currentPlayerIndex];

    if (selectedIndex === correctIndex) {
        currentPlayer.score += 10;
        currentPlayer.correct++;
    } else {
        currentPlayer.wrong++;
        if (gamePlayMode === 'lives') {
            currentPlayer.lives--;
            if (currentPlayer.lives <= 0) {
                currentPlayer.eliminated = true;
            }
        }
    }

    document.getElementById('liveCorrect').innerText = currentPlayer.correct;
    document.getElementById('liveWrong').innerText = currentPlayer.wrong;

    document.getElementById('btnNextQuestion').style.display = 'block';
}

function nextQuestionLocal() {
    currentQuestionIndex++;
    currentPlayerIndex = (currentPlayerIndex + 1) % localPlayers.length;
    showQuestion();
}

function showLocalResults() {
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('resultsScreen').style.display = 'block';
    
    let html = '<ul style="list-style: none; padding: 0; text-align: left;">';
    
    // Ordina i giocatori: prima per eliminazione (chi è arrivato più avanti o ha più punti), poi per punteggio
    localPlayers.sort((a, b) => {
        if (gamePlayMode === 'lives') {
            if (a.eliminated !== b.eliminated) return a.eliminated ? 1 : -1;
        }
        return b.score - a.score;
    }).forEach((p, i) => {
        let statusBadge = '';
        if (gamePlayMode === 'lives' && p.eliminated) {
            statusBadge = ' <span style="font-size: 0.75rem; background: #fee2e2; color: #dc2626; padding: 2px 6px; border-radius: 4px;">Eliminato (3 errori)</span>';
        }
        html += `<li style="padding: 12px; border-bottom: 1px solid #ddd; font-size: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span><strong>${i + 1}. ${p.name}</strong>${statusBadge}</span>
                <span style="color: var(--accent-blue-dark); font-weight: bold;">${p.score} Punti</span>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
                ✅ Corrette: <strong style="color: #16a34a;">${p.correct}</strong> | ❌ Errate: <strong style="color: #ef4444;">${p.wrong}</strong>
            </div>
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