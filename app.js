const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');

// Configurações do servidor
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Sessão para autenticação
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
}));

// Variáveis de dados
let users = []; // Armazenamento temporário para usuários
let rooms = {}; // Armazenamento temporário para salas e dados

// Middleware para verificar se o usuário está autenticado
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        res.redirect('/');
    }
}

// Rota da tela inicial
app.get('/', (req, res) => {
    res.render('index', { title: 'Water Game' });
});

// Rota para a tela de registro
app.get('/register', (req, res) => {
    res.render('register', { title: 'Registrar' });
});

// Processar registro
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const user = { id: uuidv4(), username, password };
    users.push(user);
    req.session.user = user;
    res.redirect('/dashboard');
});

// Rota para a tela de login
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

// Processar login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        req.session.user = user;
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }
});

// Rota do dashboard
app.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('dashboard', { title: 'Dashboard', user: req.session.user });
});

// Criar uma sala
app.post('/create-room', isAuthenticated, (req, res) => {
    const roomCode = uuidv4();
    rooms[roomCode] = { players: [{ user: req.session.user, totalWater: 0 }] };
    req.session.roomCode = roomCode;
    res.redirect(`/game/${roomCode}`);
});

// Entrar em uma sala
app.post('/join-room', isAuthenticated, (req, res) => {
    const { roomCode } = req.body;
    if (rooms[roomCode]) {
        rooms[roomCode].players.push({ user: req.session.user, totalWater: 0 });
        req.session.roomCode = roomCode;
        res.redirect(`/game/${roomCode}`);
    } else {
        res.redirect('/dashboard');
    }
});

// Rota do jogo
app.get('/game/:roomCode', isAuthenticated, (req, res) => {
    const roomCode = req.params.roomCode;
    if (rooms[roomCode]) {
        const room = rooms[roomCode];
        res.render('game', { title: 'Sala de Jogo', room, roomCode, user: req.session.user });
    } else {
        res.redirect('/dashboard');
    }
});

// Adicionar água
app.post('/add-water', isAuthenticated, (req, res) => {
    const { ml } = req.body;
    const room = rooms[req.session.roomCode];
    const player = room.players.find(p => p.user.id === req.session.user.id);
    player.totalWater += parseInt(ml);
    res.redirect(`/game/${req.session.roomCode}`);
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
