// Lista di regole e sintomi segreti[cite: 4]
const rulesList = [
    "Rispondi sempre mettendo la personalità/il carattere del giocatore alla tua sinistra.",
    "Devi toccarti il naso o il mento subito prima di iniziare a rispondere a qualsiasi domanda.",
    "Rispondi a ogni domanda usando solo parole che iniziano con la consonante del tuo nome.",
    "Rispondi inventando una bugia clamorosa con tono del tutto naturale e serio.",
    "Ogni volta che rispondi devi fare un complimento sincero allo Psicologo all'interno della frase.",
    "Rispondi a ogni domanda facendone prima un'altra allo Psicologo.",
    "Rispondi come se fossi un personaggio famoso (attore, cantante, influencer) senza mai dire il suo nome.",
    "Devi rispondere utilizzando sempre un tono di voce eccessivamente drammatico o teatrale.",
    "Rispondi sempre includendo un colore all'interno della tua risposta.",
    "Rispondi facendo finta di non ricordare il nome della persona che ha parlato prima di te."
];

function startPsychologistGame() {
    const input = document.getElementById('localPlayersInput').value;
    const players = input.split(',').map(p => p.trim()).filter(p => p !== '');

    if (players.length < 3) {
        alert("Inserisci almeno 3 giocatori per iniziare!");
        return;
    }

    // Estrazione casuale dello Psicologo[cite: 4]
    const psychoIndex = Math.floor(Math.random() * players.length);
    const chosenPsycho = players[psychoIndex];

    // Estrazione casuale della regola[cite: 4]
    const chosenRule = rulesList[Math.floor(Math.random() * rulesList.length)];

    // Aggiornamento DOM per la prima schermata (Solo lo psicologo)[cite: 4]
    document.getElementById('psychologistName').innerText = chosenPsycho;
    document.getElementById('secretRuleText').innerText = `"${chosenRule}"`;

    // Mostra la schermata di rivelazione dello psicologo e nascondi le altre
    document.getElementById('setupScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('psychologistRevealScreen').style.display = 'block';
}

function showSecretRuleScreen() {
    // Nascondi la schermata dello psicologo e mostra la regola segreta ai pazienti
    document.getElementById('psychologistRevealScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
}