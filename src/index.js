const app = require('express')();
const http = require('http').Server(app);
const randomize = require('randomatic');
const cors = require('cors')
const io = require('socket.io')(http, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["*"]
  }
});

const games = {
  
}

app.disable('etag');
app.use(cors());

app.get('/create/:game_id', (req,res) => {
  const session_id = randomize('A', 5);

  const {game_id} = req.params;
  games[session_id] = {
    game_id: game_id
  };
  console.warn(`creating ${session_id}`)
  res.json({session_id});
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.on('host', ({session_id, starting_input}) => {
    console.warn(`Host connected to: ${session_id}`)
    if (!games[session_id]) games[session_id] = {};
    
    games[session_id].input_type = starting_input;
    socket.join(`host-${session_id}`)
  });

  socket.on('change-input', ({session_id, input_type}) => {
    games[session_id].input_type = input_type;
    socket.to(`players-${session_id}`).emit('change-input', input_type);
  })

  socket.on('send-input', ({session_id, input_data}) => {
    socket.to(`host-${session_id}`).emit('send-input', input_data, socket.id);
  })

  socket.on('join', ({session_id}) => {
    console.warn(`Player joined ${session_id}`)
    if (!games[session_id]) {
      socket.emit('error', true);
    } else {
      socket.join(`players-${session_id}`)
      socket.to(`host-${session_id}`).emit('create-player', socket.id)
      socket.emit('change-input', games[session_id].input_type);
    }
  });
});


http.listen(3000, () => {
  console.log('listening on *:3000');
});
