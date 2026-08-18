const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const rooms = {};

const DEFAULT_PLAYERS = [
  { name: "Smriti Mandhana", role: "Batter", basePrice: 50 },
  { name: "Harmanpreet Kaur", role: "All-Rounder", basePrice: 50 },
  { name: "Ellyse Perry", role: "All-Rounder", basePrice: 50 },
  { name: "Meg Lanning", role: "Batter", basePrice: 40 },
  { name: "Deepti Sharma", role: "All-Rounder", basePrice: 40 },
  { name: "Shafali Verma", role: "Batter", basePrice: 30 }
];

function startAuctionTimer(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  clearInterval(room.interval);
  room.timer = 10;
  io.to(roomCode).emit('timer-tick', room.timer);

  room.interval = setInterval(() => {
    room.timer--;
    io.to(roomCode).emit('timer-tick', room.timer);

    if (room.timer <= 0) {
      clearInterval(room.interval);
      sellPlayer(roomCode);
    }
  }, 1000);
}

function sellPlayer(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  const player = room.players[room.currentIndex];

  if (room.highestBidder) {
    const winner = room.users[room.highestBidder];
    winner.purse -= room.currentBid;
    winner.squad.push({ name: player.name, price: room.currentBid });
    io.to(roomCode).emit('player-sold', { player, winner: winner.team, price: room.currentBid });
  } else {
    io.to(roomCode).emit('player-unsold', { player });
  }

  room.currentIndex++;
  if (room.currentIndex < room.players.length) {
    setTimeout(() => nextPlayer(roomCode), 2500);
  } else {
    room.status = "FINISHED";
    io.to(roomCode).emit('auction-ended', room.users);
  }
}

function nextPlayer(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  const player = room.players[room.currentIndex];
  room.currentBid = player.basePrice;
  room.highestBidder = null;
  io.to(roomCode).emit('new-player', { player, currentBid: room.currentBid });
  startAuctionTimer(roomCode);
}

io.on('connection', (socket) => {
  socket.on('create-room', ({ roomCode, customPlayers, teamName }) => {
    if (rooms[roomCode]) {
      socket.emit('error-msg', 'Room code pehle se maujood hai!');
      return;
    }

    const playerPool = (customPlayers && customPlayers.length > 0) ? customPlayers : DEFAULT_PLAYERS;

    rooms[roomCode] = {
      code: roomCode,
      players: playerPool,
      users: {},
      currentIndex: 0,
      currentBid: 0,
      highestBidder: null,
      timer: 10,
      interval: null,
      status: "WAITING"
    };

    rooms[roomCode].users[socket.id] = {
      id: socket.id,
      team: teamName || "Team Alpha",
      purse: 500,
      squad: []
    };

    socket.join(roomCode);
    socket.roomCode = roomCode;
    socket.emit('room-joined', { roomCode, user: rooms[roomCode].users[socket.id], isHost: true });
  });

  socket.on('join-room', ({ roomCode, teamName }) => {
    const room = rooms[roomCode];

    if (!room) {
      socket.emit('error-msg', 'Room nahi mila! Code check karein.');
      return;
    }
    if (Object.keys(room.users).length >= 2) {
      socket.emit('error-msg', 'Room full hai (Sirf 2 players allowed)');
      return;
    }

    room.users[socket.id] = {
      id: socket.id,
      team: teamName || "Team Bravo",
      purse: 500,
      squad: []
    };

    socket.join(roomCode);
    socket.roomCode = roomCode;
    socket.emit('room-joined', { roomCode, user: room.users[socket.id], isHost: false });
    io.to(roomCode).emit('update-users', room.users);

    room.status = "BIDDING";
    io.to(roomCode).emit('game-started');
    setTimeout(() => nextPlayer(roomCode), 2000);
  });

  socket.on('place-bid', () => {
    const room = rooms[socket.roomCode];
    if (!room || room.status !== "BIDDING") return;

    const user = room.users[socket.id];
    const nextBid = room.highestBidder ? room.currentBid + 10 : room.currentBid;

    if (user && user.purse >= nextBid && room.highestBidder !== socket.id) {
      room.currentBid = nextBid;
      room.highestBidder = socket.id;
      room.timer = 10;
      io.to(socket.roomCode).emit('bid-placed', {
        currentBid: room.currentBid,
        highestBidder: user.team
      });
    }
  });

  socket.on('disconnect', () => {
    const room = rooms[socket.roomCode];
    if (room) {
      delete room.users[socket.id];
      io.to(socket.roomCode).emit('update-users', room.users);
      if (Object.keys(room.users).length === 0) {
        clearInterval(room.interval);
        delete rooms[socket.roomCode];
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
