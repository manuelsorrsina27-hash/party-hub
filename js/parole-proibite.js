// ==========================================
// CONFIGURAZIONE MAZZO (100 CARTE)
// ==========================================
const defaultDeck = [
    { word: "PIZZA", forbidden: ["ITALIA", "FORNO", "MARGHERITA", "CIBO", "MOZZARELLA"] },
    { word: "SMARTPHONE", forbidden: ["CELLULARE", "TELEFONO", "SCHERMO", "APP", "CHIAMARE"] },
    { word: "CINEMA", forbidden: ["FILM", "ATTORE", "POPCORN", "SALA", "SCHERMO"] },
    { word: "MARE", forbidden: ["ACQUA", "SPIAGGIA", "ESTATE", "NUOTARE", "SABBIA"] },
    { word: "CHITARRA", forbidden: ["STRUMENTO", "MUSICA", "SUONARE", "CORDE", "CANZONE"] },
    { word: "AEROPORTO", forbidden: ["AEREO", "VOLARE", "VALIGIA", "PILOTA", "VIAGGIO"] },
    { word: "DENTISTA", forbidden: ["DENTI", "BOCCA", "DOLORE", "MEDICO", "SPAZZOLINO"] },
    { word: "SOLE", forbidden: ["LUCE", "GIORNO", "CALDO", "STELLA", "CIELO"] },
    { word: "NEVE", forbidden: ["INVERNO", "FREDDO", "BIANCO", "MONTAGNA", "SCI"] },
    { word: "CAFFÈ", forbidden: ["COLAZIONE", "MOKA", "BAR", "ESPRESSO", "BERE"] },
    { word: "BICICLETTA", forbidden: ["RUOTE", "PEDALI", "CATENA", "MANUBRIO", "CICLISMO"] },
    { word: "GIORNALE", forbidden: ["NOTIZIE", "STAMPA", "CARTA", "QUOTIDIANO", "LEGGERE"] },
    { word: "SUPERMERCATO", forbidden: ["SPESA", "CARRELLO", "CASSA", "CIBO", "COMPRARE"] },
    { word: "OROLOGIO", forbidden: ["ORA", "TEMPO", "POLSO", "MINUTI", "LANCETTE"] },
    { word: "OCCHIALI", forbidden: ["VISTA", "LENTI", "OCCHI", "MONTATURA", "DA SOLE"] },
    { word: "LIBRO", forbidden: ["PAGINA", "LEGGERE", "COPERTINA", "AUTORE", "ROMANZO"] },
    { word: "CANE", forbidden: ["ANIMALE", "PET", "CUCCIOLO", "GUINZAGLIO", "ABBAIARE"] },
    { word: "GATTO", forbidden: ["ANIMALE", "PET", "MICIO", "MIAGOLARE", "PELO"] },
    { word: "OMBRELLO", forbidden: ["PIOGGIA", "ACQUA", "BAGNATO", "APRIRE", "TEMPESTA"] },
    { word: "CIOCCOLATO", forbidden: ["DOLCE", "CACAO", "FONDENTE", "TAVOLETTA", "MANGIARE"] },
    { word: "TELEVISIONE", forbidden: ["SCHERMO", "CANALI", "TELECOMANDO", "SERIE", "FILM"] },
    { word: "CALCIO", forbidden: ["PALLONE", "PARTITA", "GOL", "STADIO", "SQUADRA"] },
    { word: "ASTRONAUTA", forbidden: ["SPAZIO", "LUNA", "NAVICELLA", "TUTA", "RAZZO"] },
    { word: "CHIESA", forbidden: ["RELIGIONE", "PREGARE", "CAMPANA", "PRETE", "SANTO"] },
    { word: "POLIZIOTTO", forbidden: ["MULTA", "SIRENA", "DIVISA", "ARRESTARE", "PISTOLA"] },
    { word: "VAMPIRO", forbidden: ["SANGUE", "DRACULA", "PIPISTRELLO", "DENTI", "AGLIO"] },
    { word: "FONTANA", forbidden: ["ACQUA", "MONETE", "MONUMENTO", "BERE", "GETTO"] },
    { word: "SCARPA", forbidden: ["PIEDE", "SUOLA", "LACCI", "CAMMINARE", "TACCO"] },
    { word: "PISCINA", forbidden: ["NUOTARE", "CLORO", "CUFFIA", "TUFFO", "VASCA"] },
    { word: "OSPEDALE", forbidden: ["MEDICO", "INFERMIERE", "MALATO", "LETTO", "CURARE"] },
    { word: "MONTAGNA", forbidden: ["ALTO", "ROCCIA", "SCALARE", "VETTA", "TREKKING"] },
    { word: "RISTORANTE", forbidden: ["MENÙ", "CAMERIERE", "CENA", "TAVOLO", "MANGIARE"] },
    { word: "TRENO", forbidden: ["BINARI", "STAZIONE", "VAGONI", "LOCOMOTIVA", "VIAGGIO"] },
    { word: "VULCANO", forbidden: ["LAVA", "MAGMA", "ERUZIONE", "ETNA", "MONTE"] },
    { word: "PARRUCCHIERE", forbidden: ["CAPELLI", "TAGLIO", "FORBICI", "PHON", "TINTA"] },
    { word: "FOTOGRAFIA", forbidden: ["MACCHINA", "FOTO", "SCATTARE", "OBIETTIVO", "FLASH"] },
    { word: "TEATRO", forbidden: ["PALCO", "ATTORI", "SPETTACOLO", "SIPARIO", "DRAMMA"] },
    { word: "FRIGORIFERO", forbidden: ["FREDDO", "CIBO", "CUCINA", "APRIRE", "CONGELATORE"] },
    { word: "VIGILE DEL FUOCO", forbidden: ["INCENDIO", "FUOCO", "CASERMA", "IDRANTE", "SCALA"] },
    { word: "SPECCHIO", forbidden: ["RIFLESSO", "VETRO", "PARETE", "VEDERSI", "IMMAGINE"] },
    { word: "SILENZIO", forbidden: ["RUMORE", "PARLARE", "NESSUNO", "ASCOLTARE", "ZITTO"] },
    { word: "PROFUMO", forbidden: ["ODORE", "NASO", "BOCCETTA", "SPRUZZARE", "ESSENZA"] },
    { word: "MATRIMONIO", forbidden: ["SPOSA", "SPOSO", "ANELLO", "CHIESA", "FESTA"] },
    { word: "COMPUTER", forbidden: ["TASTIERA", "MOUSE", "PC", "MONITOR", "INTERNET"] },
    { word: "MONETA", forbidden: ["SOLDI", "METALLO", "EURO", "CENTESIMI", "PORTAFOGLIO"] },
    { word: "GELATO", forbidden: ["CONO", "COPPETTA", "GUSTI", "FREDDO", "ESTATE"] },
    { word: "TIGRE", forbidden: ["STRISCE", "GIUNGLA", "FELINO", "ZANNE", "RUGGITO"] },
    { word: "ZAINO", forbidden: ["SPALLE", "SCUOLA", "STRAPPI", "BORSA", "CARICARE"] },
    { word: "DADO", forbidden: ["GIOCO", "NUMERI", "SEI", "LANCIARE", "FACCETTE"] },
    { word: "CHIAVE", forbidden: ["PORTA", "SERRATURA", "APRIRE", "GIRO", "FERRO"] },
    { word: "FORCHETTA", forbidden: ["POSATA", "REBBI", "PASTA", "MANGIARE", "COLTELLO"] },
    { word: "SAPONE", forbidden: ["MANI", "SCHIUMA", "LAVARE", "BAGNO", "PULITO"] },
    { word: "ANELLO", forbidden: ["DITO", "ORO", "ARGENTO", "GIOIELLO", "DIAMANTE"] },
    { word: "VALIGIA", forbidden: ["VIAGGIO", "BAGAGLIO", "PARTIRE", "VESTITI", "ROTELLE"] },
    { word: "SEMAFORO", forbidden: ["ROSSO", "VERDE", "GIALLO", "STRADA", "TRAFFICO"] },
    { word: "ISOLA", forbidden: ["MARE", "TERRA", "ACQUA", "COSTA", "NAUFRAGO"] },
    { word: "CUSCINO", forbidden: ["LETTO", "DORMIRE", "TESTA", "MORBIDO", "PIUMA"] },
    { word: "PIRATA", forbidden: ["NAVE", "BENDATO", "TESORO", "MAPPA", "CIURMA"] },
    { word: "ALBERO", forbidden: ["FOGLIE", "TRONCO", "RAMI", "RADICI", "FORESTA"] },
    { word: "VENTO", forbidden: ["ARIA", "SOFFIARE", "TEMPESTA", "PALETTA", "EOLICO"] },
    { word: "TAZZA", forbidden: ["COLAZIONE", "LATTE", "MANICO", "BERE", "CERAMICA"] },
    { word: "MATITA", forbidden: ["SCRIVERE", "DISEGNARE", "MINA", "GOMMA", "APPUNTALAPIS"] },
    { word: "DINOSAURO", forbidden: ["ESTINTO", "FOSSILE", "T-REX", "PREISTORIA", "UOVO"] },
    { word: "FORMAGGIO", forbidden: ["LATTE", "TOPO", "PARMIGIANO", "BUCHI", "FETTA"] },
    { word: "LUNA", forbidden: ["NOTTE", "CIELO", "SATELLITE", "PIENA", "CRATERI"] },
    { word: "FIUME", forbidden: ["ACQUA", "SORGENTE", "CORRENTE", "PONTE", "MARE"] },
    { word: "SERPENTE", forbidden: ["RETTILE", "VELENO", "STRISCIARE", "MORDERE", "SCAGLIE"] },
    { word: "LAMPADINA", forbidden: ["LUCE", "ILLUMINARE", "VETRO", "CORRENTE", "IDEA"] },
    { word: "BANCOMAT", forbidden: ["CARTA", "SOLDI", "BANCA", "CONTANTI", "PRELEVARE"] },
    { word: "SQUALO", forbidden: ["MARE", "DENTI", "PINNA", "ATTACCO", "OCEANO"] },
    { word: "CARNEVALE", forbidden: ["MASCHERA", "COSTUME", "CORIANDOLI", "FESTA", "CARRI"] },
    { word: "DENTIFRICIO", forbidden: ["SPAZZOLINO", "TUBO", "MENTA", "PULIRE", "DENTI"] },
    { word: "MUSEO", forbidden: ["QUADRI", "ARTE", "MOSTRA", "GUIDA", "SCULTURE"] },
    { word: "QUADRO", forbidden: ["DIPINTO", "CORNICE", "PITTORE", "PARETE", "MUSEO"] },
    { word: "COMPASSO", forbidden: ["CERCHIO", "MATITA", "DISEGNO", "SCUOLA", "PUNTA"] },
    { word: "TELESCOPIO", forbidden: ["STELLE", "SPAZIO", "GUARDARE", "ASTRONOMIA", "INGRANDIRE"] },
    { word: "COCKTAIL", forbidden: ["BERE", "BAR", "ALCOL", "GHIACCIO", "BICCHIERE"] },
    { word: "BOTTIGLIA", forbidden: ["VETRO", "TAPPO", "LIQUIDO", "ACQUA", "VINO"] },
    { word: "MONOPOLI", forbidden: ["TABELLONE", "SOLDI", "DADI", "CASE", "IMPREVISTI"] },
    { word: "SCACCHI", forbidden: ["RE", "REGINA", "SCACCHIERA", "PEDONI", "CAVALLO"] },
    { word: "MAGO", forbidden: ["TRUCCO", "BACCHETTA", "CAPPELLO", "MAGIA", "CONIGLIO"] },
    { word: "CASTELLO", forbidden: ["RE", "FOSSATO", "TORRE", "MEDIOEVO", "FORTEZZA"] },
    { word: "FANTASMA", forbidden: ["BIANCO", "LENZUOLO", "PAURA", "CASTELLO", "SPETTRO"] },
    { word: "ROBOT", forbidden: ["TECNOLOGIA", "METALLO", "AUTOMATICO", "MACCHINA", "INTELLIGENZA"] },
    { word: "SUBACQUEO", forbidden: ["BOMBOLA", "IMMERSIONE", "MASCHERA", "MARE", "PINNE"] },
    { word: "NATALE", forbidden: ["REGALI", "ALBERO", "DICEMBRE", "BABBO", "FESTA"] },
    { word: "CANDELA", forbidden: ["CERA", "FUOCO", "FIAMMA", "SCIOGLIERE", "LUCE"] },
    { word: "ACQUARIO", forbidden: ["PESCI", "VETRO", "ACQUA", "VASCA", "MANGIME"] },
    { word: "PARACADUTE", forbidden: ["VOLARE", "AEREO", "SALTO", "APRIRE", "CIELO"] },
    { word: "CALCOLATRICE", forbidden: ["NUMERI", "CONTI", "MATEMATICA", "SOMMA", "TASTI"] },
    { word: "TORNADO", forbidden: ["VENTO", "VORTICE", "TEMPESTA", "DISTRUZIONE", "CIELO"] },
    { word: "BIBLIOTECA", forbidden: ["LIBRI", "SILENZIO", "PRESTITO", "LEGGERE", "SCAFFALI"] },
    { word: "DIPLOMA", forbidden: ["SCUOLA", "MATURITÀ", "VOTO", "ESAME", "CARTA"] },
    { word: "MICROFONO", forbidden: ["VOCE", "CANTARE", "PARLARE", "AUDIO", "PALCO"] },
    { word: "AMBULANZA", forbidden: ["SIRENA", "OSPEDALE", "EMERGENZA", "MEDICO", "INCIDENTE"] },
    { word: "ASCENSORE", forbidden: ["PIANI", "PALAZZO", "BOTTONI", "SALIRE", "SCENDERE"] },
    { word: "PANE", forbidden: ["FORNO", "FARINA", "LIEVITO", "CIBO", "ROSETTA"] },
    { word: "CHITARRA ELETTRICA", forbidden: ["ROCK", "AMPLIFICATORE", "CORDE", "SUONARE", "MUSICA"] },
    { word: "TENTAZIONI", forbidden: ["DIETA", "DOLCI", "PECCATO", "RESISTERE", "CEDERE"] },
    { word: "OASI", forbidden: ["DESERTO", "ACQUA", "PALME", "SABBIA", "MIRAGGIO"] }
];

// ==========================================
// STATO DEL GIOCO LOCALE
// ==========================================
let players = []; // Es. [{name: "Giocatore 1", score: 0}, ...]
let currentPlayerIndex = 0;
let currentDeck = [];
let currentIndex = 0;
let roundScore = 0;
let timer = null;
let timeLeft = 60;

function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
}

// Avvio inserendo i nomi dei partecipanti locali separati da virgola o da un form
function startLocalPPGame(namesArray) {
    if (!namesArray || namesArray.length === 0) return;
    players = namesArray.map(name => ({ name: name.trim(), score: 0 }));
    currentPlayerIndex = 0;
    currentDeck = shuffle([...defaultDeck]);
    currentIndex = 0;

    document.getElementById('localSetupArea').style.display = 'none';
    showPassDeviceScreen();
}

// Schermata di passaggio dispositivo prima di iniziare il turno del giocatore
function showPassDeviceScreen() {
    const currentPlayer = players[currentPlayerIndex];
    document.getElementById('gameArea').style.display = 'none';
    
    // Mostra un box intermedio o un overlay
    let transitionDiv = document.getElementById('passDeviceOverlay');
    if (!transitionDiv) {
        transitionDiv = document.createElement('div');
        transitionDiv.id = 'passDeviceOverlay';
        document.body.appendChild(transitionDiv);
    }
    
    transitionDiv.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(11,15,25,0.95); display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:1000; padding:20px; text-align:center;";
    transitionDiv.innerHTML = `
        <h2 style="color: #fff; font-size: 2.2rem; margin-bottom: 10px;">Passa il dispositivo a:</h2>
        <h1 style="color: #10b981; font-size: 3rem; margin-bottom: 30px;">${currentPlayer.name}</h1>
        <p style="color: #9ca3af; margin-bottom: 30px; font-size: 1.1rem;">Assicurati che gli altri non vedano lo schermo!</p>
        <button onclick="beginPlayerTurn()" style="background: #10b981; color: #fff; border: none; padding: 15px 30px; font-size: 1.2rem; border-radius: 12px; cursor: pointer; font-weight: bold;">Sono pronto!</button>
    `;
}

function beginPlayerTurn() {
    const transitionDiv = document.getElementById('passDeviceOverlay');
    if (transitionDiv) transitionDiv.style.display = 'none';

    document.getElementById('gameArea').style.display = 'block';
    document.getElementById('actionControls').style.display = 'flex';
    
    roundScore = 0;
    document.getElementById('scoreDisplay').innerText = roundScore;
    
    updateCardUI();
    startTimer();
}

function updateCardUI() {
    if (currentIndex >= currentDeck.length) {
        currentDeck = shuffle([...defaultDeck]);
        currentIndex = 0;
    }
    
    const card = currentDeck[currentIndex];
    const container = document.getElementById('cardDisplayArea');
    
    if (!card) return;

    container.innerHTML = `
        <div style="background: rgba(11, 15, 25, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px;">
            <p style="color: #9ca3af; font-size: 0.9rem; margin-bottom: 5px;">Turno di: <strong style="color:#fff;">${players[currentPlayerIndex].name}</strong></p>
            <h2 style="font-size: 2rem; color: #10b981; margin-bottom: 15px; letter-spacing: 1px;">${card.word}</h2>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${card.forbidden.map(w => `<span style="background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); padding: 8px; border-radius: 8px; font-weight: 600;">${w}</span>`).join('')}
            </div>
        </div>
    `;
}

function triggerAction(action) {
    if (action === 'correct') {
        roundScore += 1;
    } else if (action === 'taboo') {
        roundScore -= 1; 
    }else if (action === 'skip') {
        // Non fa nulla al punteggio
    }   
   
    
    currentIndex++;
    document.getElementById('scoreDisplay').innerText = roundScore;
    updateCardUI();
}

function startTimer() {
    timeLeft = 60;
    document.getElementById('timerDisplay').innerText = `${timeLeft}s`;
    clearInterval(timer);
    
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timerDisplay').innerText = `${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            endPlayerTurn();
        }
    }, 1000);
}

function endPlayerTurn() {
    clearInterval(timer);
    // Salva il punteggio al giocatore corrente
    players[currentPlayerIndex].score += roundScore;
    
    // Passa al giocatore successivo
    currentPlayerIndex++;
    
    if (currentPlayerIndex < players.length) {
        showPassDeviceScreen();
    } else {
        showFinalLeaderboard();
    }
}

function showFinalLeaderboard() {
    document.getElementById('gameArea').style.display = 'none';
    document.getElementById('actionControls').style.display = 'none';
    
    // Ordina i giocatori per punteggio decrescente
    const sorted = [...players].sort((a, b) => b.score - a.score);
    
    let container = document.getElementById('finalLeaderboardArea');
    if (!container) {
        container = document.createElement('div');
        container.id = 'finalLeaderboardArea';
        document.body.appendChild(container);
    }
    
    container.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(11,15,25,0.95); display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:1000; padding:20px; text-align:center;";
    container.innerHTML = `
        <h1 style="color: #10b981; font-size: 2.5rem; margin-bottom: 20px;">Fine Partita! 🏆</h1>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; width: 100%; max-width: 400px; margin-bottom: 20px;">
            ${sorted.map((p, idx) => `
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); color: #fff; font-size: 1.2rem;">
                    <span>#${idx + 1} ${p.name}</span>
                    <strong style="color: #10b981;">${p.score} punti</strong>
                </div>
            `).join('')}
        </div>
        <button onclick="location.reload()" style="background: #10b981; color: #fff; border: none; padding: 12px 25px; font-size: 1rem; border-radius: 8px; cursor: pointer; font-weight: bold;">Rigiocare</button>
    `;
}

function handleStartButtonClick() {
    const inputVal = document.getElementById('localPlayersInput').value;
    if (!inputVal.trim()) {
        alert("Inserisci almeno un nome!");
        return;
    }
    const namesArray = inputVal.split(',').map(n => n.trim()).filter(n => n.length > 0);
    if (namesArray.length === 0) {
        alert("Inserisci nomi validi!");
        return;
    }
    startLocalPPGame(namesArray);
}

function updateCardUI() {
    if (currentIndex >= currentDeck.length) {
        currentDeck = shuffle([...defaultDeck]);
        currentIndex = 0;
    }
    
    const card = currentDeck[currentIndex];
    const container = document.getElementById('cardDisplayArea');
    
    if (!card) return;

    container.innerHTML = `
        <div class="tabu-card">
            <p class="tabu-turn-info">Turno di: <strong>${players[currentPlayerIndex].name}</strong></p>
            <h2 class="tabu-word">${card.word}</h2>
            <div class="tabu-forbidden-list">
                ${card.forbidden.map(w => `<div class="tabu-forbidden-item">${w}</div>`).join('')}
            </div>
        </div>
    `;
}