const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve tutti i file statici dalla cartella principale del progetto
app.use(express.static(path.join(__dirname)));

// Rotta esplicita per la home page (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Cache globale delle stanze per i vari giochi
const nccRooms = {};
const ppRooms = {};
const impostorRooms = {};
const triviaRooms = {};

// Lista delle parole per L'Impostore
let impostorWords = [
    "Pizza", "Spiaggia", "Chitarra", "Ospedale", "Scuola", 
    "Castello", "Caffè", "Montagna", "Aeroporto", "Pianoforte",
    "Pasticceria", "Stadio", "Astronave", "Bibliotecario", "Vulcani",
    "Smartphone", "Teatro", "Giungla", "Orologio", "Spatola",
    "Frigorifero", "Tavolo", "Cuscino", "Specchio", "Zaino",
    "Leone", "Delfino", "Pinguino", "Elefante", "Kanguro",
    "Giraffa", "Tigre", "Aquila", "Squalo", "Koala",
    "Lupo", "Volpe", "Orso", "Cavallo", "Ghepardo",
    "Procione", "Fenicottero", "Civetta", "Riccio", "Cammello",
    "Sushi", "Gelato", "Cioccolato", "Hamburger", "Lasagna",
    "Tiramisù", "Spaghetti", "Popcorn", "Cappuccino", "Frittata",
    "Panino", "Patatine", "Cocomero", "Ananas", "Miele",
    "Limone", "Biscotto", "Yogurt", "Zucchero", "Formaggio",
    "Deserto", "Ospedale", "Biblioteca", "Museo", "Stazione",
    "Supermercato", "Cinema", "Luna Park", "Stadio", "Ghiacciaio",
    "Vulcano", "Sottomarino", "Faro", "Grotta", "Cascata",
    "Piscina", "Bosco", "Castello", "Laboratorio", "Circo",
    "Pompiere", "Astronauta", "Detective", "Pirata", "Mago",
    "Vampiro", "Supereroe", "Pilota", "Chef", "Archeologo",
    "Scienziato", "Ninja", "Regina", "Gladiatore", "Faraone"
];

function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
}

io.on('connection', (socket) => {
    console.log(`Utente connesso: ${socket.id}`);

    socket.on('search_impostor_word', ({ term }) => {
        const query = term ? term.toLowerCase().trim() : '';
        const results = impostorWords.filter(w => w.toLowerCase().includes(query));
        socket.emit('impostor_search_results', { query, results });
    });

    socket.on('edit_impostor_word', ({ oldWord, newWord }) => {
        const index = impostorWords.findIndex(w => w.toLowerCase() === oldWord.toLowerCase().trim());
        if (index !== -1 && newWord && newWord.trim().length > 0) {
            impostorWords[index] = newWord.trim();
            socket.emit('impostor_word_updated', { success: true, oldWord, newWord: newWord.trim() });
        } else {
            socket.emit('impostor_word_updated', { success: false, message: 'Parola non trovata o valore non valido' });
        }
    });

    socket.on('add_impostor_word', ({ word }) => {
        const formatted = word ? word.trim() : '';
        if (formatted && !impostorWords.some(w => w.toLowerCase() === formatted.toLowerCase())) {
            impostorWords.push(formatted);
            socket.emit('impostor_word_added', { success: true, word: formatted });
        } else {
            socket.emit('impostor_word_added', { success: false, message: 'Parola già presente o vuota' });
        }
    });

    // 1. NOMI COSE CITTÀ
    socket.on('create_room', ({ nickname, categories }) => {
        const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        nccRooms[roomCode] = {
            host: socket.id,
            players: [{ id: socket.id, name: nickname, score: 0 }],
            categories: categories || ["Nome", "Cosa / Oggetto", "Città / Stato", "Animale"],
            status: 'lobby',
            answers: {}
        };
        socket.join(roomCode);
        socket.emit('room_created', { 
            roomCode, 
            players: nccRooms[roomCode].players, 
            roomCategories: nccRooms[roomCode].categories 
        });
        io.to(roomCode).emit('update_players', { players: nccRooms[roomCode].players });
    });

    socket.on('join_room', ({ nickname, roomCode }) => {
        if (nccRooms[roomCode]) {
            nccRooms[roomCode].players.push({ id: socket.id, name: nickname, score: 0 });
            socket.join(roomCode);
            socket.emit('joined_successfully', { 
                roomCode, 
                players: nccRooms[roomCode].players, 
                roomCategories: nccRooms[roomCode].categories 
            });
            io.to(roomCode).emit('update_players', { players: nccRooms[roomCode].players });
        } else {
            socket.emit('error_msg', 'Stanza non trovata!');
        }
    });

    socket.on('update_categories', ({ roomCode, categories }) => {
        if (nccRooms[roomCode] && nccRooms[roomCode].host === socket.id) {
            nccRooms[roomCode].categories = categories;
            io.to(roomCode).emit('categories_updated', { categories });
        }
    });

    socket.on('start_game', ({ roomCode, letter }) => {
        if (nccRooms[roomCode]) {
            nccRooms[roomCode].status = 'playing';
            nccRooms[roomCode].answers = {};
            io.to(roomCode).emit('game_started', { letter });
        }
    });

    socket.on('trigger_stop_countdown', ({ roomCode }) => {
        if (nccRooms[roomCode]) {
            io.to(roomCode).emit('stop_countdown_started');
        }
    });

    socket.on('submit_answers', ({ roomCode, answers }) => {
        if (nccRooms[roomCode]) {
            const player = nccRooms[roomCode].players.find(p => p.id === socket.id);
            if (player) player.answers = answers;
            
            nccRooms[roomCode].answers[socket.id] = answers;
            if (Object.keys(nccRooms[roomCode].answers).length >= nccRooms[roomCode].players.length) {
                io.to(roomCode).emit('all_answers_submitted', { players: nccRooms[roomCode].players });
            }
        }
    });

    socket.on('submit_score', ({ roomCode, roundScore }) => {
        if (nccRooms[roomCode]) {
            const player = nccRooms[roomCode].players.find(p => p.id === socket.id);
            if (player) player.score = (player.score || 0) + roundScore;
            io.to(roomCode).emit('leaderboard_update', { players: nccRooms[roomCode].players });
        }
    });

    // 3. L'IMPOSTORE
    socket.on('create_impostor_room', ({ nickname }) => {
        const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        impostorRooms[roomCode] = {
            host: socket.id,
            players: [{ id: socket.id, nickname }],
            status: 'lobby',
            secretWord: '',
            impostorId: null,
            votes: {}
        };
        socket.join(roomCode);
        socket.emit('impostor_room_created', roomCode);
        io.to(roomCode).emit('impostor_update_players', impostorRooms[roomCode].players);
    });

    socket.on('join_impostor_room', ({ nickname, roomCode }) => {
        if (impostorRooms[roomCode] && impostorRooms[roomCode].status === 'lobby') {
            impostorRooms[roomCode].players.push({ id: socket.id, nickname });
            socket.join(roomCode);
            socket.emit('impostor_room_joined', roomCode);
            io.to(roomCode).emit('impostor_update_players', impostorRooms[roomCode].players);
        } else {
            socket.emit('impostor_error', 'Stanza non trovata o partita già iniziata');
        }
    });

    socket.on('start_impostor_game', ({ roomCode }) => {
        const room = impostorRooms[roomCode];
        if (room && room.players.length >= 3) {
            room.status = 'playing';
            room.secretWord = impostorWords[Math.floor(Math.random() * impostorWords.length)];
            
            const randomImpostor = room.players[Math.floor(Math.random() * room.players.length)];
            room.impostorId = randomImpostor.id;

            room.players.forEach(player => {
                io.to(player.id).emit('impostor_role_assigned', {
                    isImpostor: player.id === room.impostorId,
                    secretWord: room.secretWord,
                    players: room.players.map(p => ({ id: p.id, nickname: p.nickname }))
                });
            });
            
            io.to(roomCode).emit('impostor_game_started');
        } else {
            socket.emit('impostor_error', 'Servono almeno 3 giocatori per iniziare!');
        }
    });

    socket.on('submit_impostor_vote', ({ roomCode, targetId }) => {
        const room = impostorRooms[roomCode];
        if (room) {
            room.votes[socket.id] = targetId;
            
            if (Object.keys(room.votes).length >= room.players.length) {
                let voteCounts = {};
                Object.values(room.votes).forEach(votedId => {
                    voteCounts[votedId] = (voteCounts[votedId] || 0) + 1;
                });

                let mostVotedId = Object.keys(voteCounts).reduce((a, b) => voteCounts[a] > voteCounts[b] ? a : b);
                const foundImpostor = mostVotedId === room.impostorId;
                const impostorPlayer = room.players.find(p => p.id === room.impostorId);

                io.to(roomCode).emit('impostor_game_over', {
                    mostVotedId,
                    impostorId: room.impostorId,
                    impostorName: impostorPlayer ? impostorPlayer.nickname : 'Sconosciuto',
                    foundImpostor,
                    secretWord: room.secretWord
                });
            }
        }
    });

    socket.on('send_impostor_chat', ({ roomCode, message }) => {
        const room = impostorRooms[roomCode];
        if (room) {
            const player = room.players.find(p => p.id === socket.id);
            if (player) {
                io.to(roomCode).emit('impostor_receive_chat', {
                    sender: player.nickname,
                    message: message
                });
            }
        }
    });

    // 4. TRIVIA FLASH
    socket.on('create_trivia_room', ({ nickname }) => {
        const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        triviaRooms[roomCode] = {
            host: socket.id,
            players: [{ id: socket.id, nickname, score: 0 }],
            status: 'lobby',
            scoresSubmitted: 0
        };
        socket.join(roomCode);
        socket.emit('trivia_room_created', roomCode);
        io.to(roomCode).emit('trivia_update_players', triviaRooms[roomCode].players);
    });

    socket.on('join_trivia_room', ({ nickname, roomCode }) => {
        if (triviaRooms[roomCode] && triviaRooms[roomCode].status === 'lobby') {
            triviaRooms[roomCode].players.push({ id: socket.id, nickname, score: 0 });
            socket.join(roomCode);
            socket.emit('trivia_room_joined', roomCode);
            io.to(roomCode).emit('trivia_update_players', triviaRooms[roomCode].players);
        } else {
            socket.emit('trivia_error', 'Stanza non trovata o partita già iniziata');
        }
    });

    socket.on('start_trivia_game', ({ roomCode }) => {
        const room = triviaRooms[roomCode];
        if (room) {
            room.status = 'playing';
            const gameQuestions = shuffle([
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
            ]).slice(0, 10);

            io.to(roomCode).emit('trivia_game_started', gameQuestions);
        }
    });

    socket.on('submit_trivia_score', ({ roomCode, score }) => {
        const room = triviaRooms[roomCode];
        if (room) {
            const player = room.players.find(p => p.id === socket.id);
            if (player) player.score = score;
            
            room.scoresSubmitted++;
            if (room.scoresSubmitted >= room.players.length) {
                io.to(roomCode).emit('trivia_game_over', room.players);
            }
        }
    });

    socket.on('disconnect', () => {
        console.log(`Utente disconnesso: ${socket.id}`);
        for (const code in nccRooms) {
            nccRooms[code].players = nccRooms[code].players.filter(p => p.id !== socket.id);
            if (nccRooms[code].players.length === 0) delete nccRooms[code];
            else io.to(code).emit('update_players', { players: nccRooms[code].players });
        }
        for (const code in impostorRooms) {
            impostorRooms[code].players = impostorRooms[code].players.filter(p => p.id !== socket.id);
            if (impostorRooms[code].players.length === 0) delete impostorRooms[code];
            else io.to(code).emit('impostor_update_players', impostorRooms[code].players);
        }
        for (const code in triviaRooms) {
            triviaRooms[code].players = triviaRooms[code].players.filter(p => p.id !== socket.id);
            if (triviaRooms[code].players.length === 0) delete triviaRooms[code];
            else io.to(code).emit('trivia_update_players', triviaRooms[code].players);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server avviato su http://localhost:${PORT}`));