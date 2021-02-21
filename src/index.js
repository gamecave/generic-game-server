const app = require('express')();
const http = require('http').Server(app);
var cors = require('cors')
const io = require('socket.io')(http, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["*"]
  }
});

const games = {
  hi: "tanks"
}

app.use(cors());

app.get('/create/:id', (req,res) => {
  console.warn(games);
  games.TSCS = 'maze';
  
  res.send({sessionId: 'TSCS'});
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.on('host', data => {
    console.log('host', data);
  });
});


http.listen(3000, () => {
  console.log('listening on *:3000');
});

