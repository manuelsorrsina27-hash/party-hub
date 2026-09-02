let teams = [];
let currentTeamIndex = 0;
let totalMatchSeconds = 120;
let secondsPerCard = 20;

let deckConfig = { easy: 2, medium: 2, hard: 2 };
let currentDeck = [];
let currentCardIndex = 0;
let skipsRemaining = 2;

let cardTimerInterval = null;
let currentCardSecondsLeft = 0;

// Database di parole divise per difficoltà
const wordsDB = {
    easy: [
        "Cane", "Gatto", "Mela", "Palla", "Chitarra", "Ombrello", "Spazzolino", "Bicicletta", "Sole", "Telefono",
        "Orologio", "Scarpa", "Libro", "Forchetta", "Tavolo", "Letto", "Matita", "Pesce", "Porta", "Sedia"
    ],
    medium: [
        "Titanic", "Spiderman", "Torre Eiffel", "Lavatrice", "Schiaccianoci", "Uovo di pasqua", "Bucatino", "Astronauta", "Squalo", "Harry Potter",
        "Bowling", "Fotografo", "Vampiro", "Pallavolo", "Infermiere", "Cactus", "Kung Fu", "Sombrero", "DJ", "Babbo Natale"
    ],
    hard: [
        "Fisica quantistica", "Dichiarazione dei redditi", "Metamorfosi", "Ipocondria", "Déjà vu",
        "Sostenibilità", "Procrastinazione", "Eclissi solare", "Climaterio", "Burocrazia",
        "Effetto serra", "Esistenzialismo", "Anacronismo", "Anticoncezionale", "Cibernetica"
    ]
};

function startMimeGame() {
    const input = document.getElementById('localPlayersInput').value.trim();
    if (!input) {
        teams = [
            { name: "Squadra A", score: 0 },
            { name: "Squadra B", score: 0 }
        ];
    } else {
        teams = input.split(',').map(name => ({
            name: name.trim(),
            score: 0
        })).filter(t => t.name.length > 0);

        if (teams.length < 2) {
            alert("Inserisci almeno 2 squadre!");
            return;
        }
    }

    const durationSelect = document.getElementById('matchDurationSelect');
    totalMatchSeconds = parseInt(durationSelect.value) || 120;
    secondsPerCard = Math.floor(totalMatchSeconds / 6);

    currentTeamIndex = 0;
    document.getElementById('setupScreen').style.display = 'none';
    showDeckBuilder();
}

function showDeckBuilder() {
    const currentTeam = teams[currentTeamIndex];
    document.getElementById('deckBuilderTitle').innerText = `Componi Mazzo per: ${currentTeam.name}`;
    document.getElementById('deckBuilderScreen').style.display = 'block';
}

function setDeckPreset(e, m, h) {
    document.getElementById('countEasy').value = e;
    document.getElementById('countMedium').value = m;
    document.getElementById('countHard').value = h;
    validateDeckCount();
}

function validateDeckCount() {
    let e = parseInt(document.getElementById('countEasy').value) || 0;
    let m = parseInt(document.getElementById('countMedium').value) || 0;
    let h = parseInt(document.getElementById('countHard').value) || 0;
    let total = e + m + h;

    document.getElementById('totalDeckCount').innerText = total;
    if (total !== 6) {
        document.getElementById('totalDeckCount').style.color = '#ef4444';
    } else {
        document.getElementById('totalDeckCount').style.color = 'var(--accent-blue-dark)';
    }
}

function startRoundWithDeck() {
    let e = parseInt(document.getElementById('countEasy').value) || 0;
    let m = parseInt(document.getElementById('countMedium').value) || 0;
    let h = parseInt(document.getElementById('countHard').value) || 0;

    if (e + m + h !== 6) {
        alert("Il mazzo deve essere composto esattamente da 6 carte!");
        return;
    }

    deckConfig = { easy: e, medium: m, hard: h };
    
    currentDeck = [];
    
    function addRandomWords(diffKey, count) {
        let pool = [...wordsDB[diffKey]].sort(() => Math.random() - 0.5);
        for (let i = 0; i < count; i++) {
            currentDeck.push({
                word: pool[i % pool.length],
                difficulty: diffKey
            });
        }
    }

    addRandomWords('easy', deckConfig.easy);
    addRandomWords('medium', deckConfig.medium);
    addRandomWords('hard', deckConfig.hard);

    // Mescola l'ordine delle 6 carte nel mazzo
    currentDeck.sort(() => Math.random() - 0.5);

    currentCardIndex = 0;
    skipsRemaining = 2;

    document.getElementById('deckBuilderScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    
    loadCard();
}

function loadCard() {
    if (currentCardIndex >= 6) {
        endRound();
        return;
    }

    const currentTeam = teams[currentTeamIndex];
    document.getElementById('currentTeamBadge').innerText = `🎯 Turno di: ${currentTeam.name}`;
    document.getElementById('cardIndexDisplay').innerText = currentCardIndex + 1;
    document.getElementById('skipsLeftBadge').innerText = `🔄 Cambi carta rimasti: ${skipsRemaining}/2`;
    document.getElementById('btnSkipCard').disabled = (skipsRemaining <= 0);

    const card = currentDeck[currentCardIndex];
    document.getElementById('secretWordDisplay').innerText = card.word;

    const badge = document.getElementById('cardDifficultyBadge');
    if (card.difficulty === 'easy') {
        badge.innerText = "🟢 Facile";
        badge.style.background = "#dcfce7";
        badge.style.color = "#16a34a";
    } else if (card.difficulty === 'medium') {
        badge.innerText = "🟡 Media";
        badge.style.background = "#fef9c3";
        badge.style.color = "#ca8a04";
    } else {
        badge.innerText = "🔴 Difficile";
        badge.style.background = "#fee2e2";
        badge.style.color = "#dc2626";
    }

    // Avvia il timer della singola carta
    currentCardSecondsLeft = secondsPerCard;
    document.getElementById('cardTimer').innerText = currentCardSecondsLeft;
    
    clearInterval(cardTimerInterval);
    cardTimerInterval = setInterval(() => {
        currentCardSecondsLeft--;
        document.getElementById('cardTimer').innerText = currentCardSecondsLeft;
        
        if (currentCardSecondsLeft <= 0) {
            clearInterval(cardTimerInterval);
            // Tempo scaduto per questa carta: 0 punti e passaggio automatico alla successiva
            currentCardIndex++;
            loadCard();
        }
    }, 1000);
}

function markCardGuessed() {
    clearInterval(cardTimerInterval);
    teams[currentTeamIndex].score += 1;
    currentCardIndex++;
    loadCard();
}

function skipCurrentCard() {
    if (skipsRemaining <= 0) return;
    skipsRemaining--;

    const diff = currentDeck[currentCardIndex].difficulty;
    let pool = wordsDB[diff].filter(w => w !== currentDeck[currentCardIndex].word);
    let newWord = pool[Math.floor(Math.random() * pool.length)];

    currentDeck[currentCardIndex].word = newWord;
    
    loadCard();
}

function endRound() {
    clearInterval(cardTimerInterval);
    currentTeamIndex++;

    if (currentTeamIndex < teams.length) {
        showDeckBuilder();
    } else {
        showFinalResults();
    }
}

function showFinalResults() {
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('resultsScreen').style.display = 'block';

    let html = '<ul style="list-style: none; padding: 0; text-align: left;">';
    [...teams].sort((a, b) => b.score - a.score).forEach((t, i) => {
        html += `<li style="padding: 12px; border-bottom: 1px solid #ddd; font-size: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <span><strong>${i + 1}. ${t.name}</strong></span>
            <span style="color: var(--accent-blue-dark); font-weight: bold;">${t.score} Punti</span>
        </li>`;
    });
    html += '</ul>';

    document.getElementById('scoreboard').innerHTML = html;
}