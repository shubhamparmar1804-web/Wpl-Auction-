const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const rooms = {};

// 80 Players Master Pool with Photos & Roles
const MASTER_PLAYERS = [
  { name: "Smriti Mandhana", role: "Batter", basePrice: 50, img: "https://api.dicebear.com/7.x/bottts/svg?seed=Smriti" },
  { name: "Harmanpreet Kaur", role: "All-Rounder", basePrice: 50, img: "https://api.dicebear.com/7.x/bottts/svg?seed=Harman" },
  { name: "Ellyse Perry", role: "All-Rounder", basePrice: 50, img: "https://api.dicebear.com/7.x/bottts/svg?seed=Perry" },
  { name: "Meg Lanning", role: "Batter", basePrice: 40, img: "https://api.dicebear.com/7.x/bottts/svg?seed=Meg" },
  { name: "Deepti Sharma", role: "All-Rounder", basePrice: 40, img: "https://api.dicebear.com/7.x/bottts/svg?seed=Deepti" },
  { name: "Shafali Verma", role: "Batter", basePrice: 30, img: "https://api.dicebear.com/7.x/bottts/svg?seed=Shafali" },
  { name: "Jemimah Rodrigues", role: "Batter", basePrice: 30, img: "https://api.dicebear.com/7.x/bottts/svg?seed=Jemimah" },
  { name: "Richa Ghosh", role: "Wicket-Keeper", basePrice: 30, img: "https://api.dicebear.com/7.x/bottts/svg?seed=Richa" },
  { name: "Renuka Singh", role: "Bowler", basePrice: 30, img: "https://api.dicebear.com/7.x/bottts/svg?seed=Renuka" },
  { name: "Sophie Devine", role: "All-Rounder", basePrice: 40, img: "https://api.dicebear.com/7.x/bottts/svg?seed=Sophie" },
  { name: "Alyssa Healy", role: "Wicket-Keeper", basePrice: 40, img: "https://api.dicebear.com/7.x/bottts/svg?seed=Healy" },
  { name: "Beth Mooney", role: "Batter", basePrice: 40, img: "https://api.dicebear.com/7.x/bottts/svg?seed=Beth" },
  { name: "Nat Sciver-Brunt", role: "All-Rounder", basePrice: 50, img: "https://api.dicebear.com/7.x/bottts/svg?seed=Nat" },
  { name: "Amelia Kerr", role: "All-Rounder", basePrice: 30, img: "https://api.dicebear.com/7.x/bottts/svg?seed=Amelia" },
  { name: "Pooja Vastrakar", role: "All-Rounder", basePrice: 30, img: "https://api.dicebear.com/7.x/bottts/svg?seed=Pooja" },
  { name: "Yastika Bhatia", role: "Wicket-Keeper", basePrice: 20, img: "https://api.dicebear.com/7.x/bottts/svg?seed=Yastika" }
];

// 80 players tak automate generate kar lega agar list lambi ho
while (MASTER_PLAYERS.length < 85) {
  const i = MASTER_PLAYERS.length + 1;
  const roles = ["Batter", "Bowler", "All-Rounder", "Wicket-Keeper"];
  MASTER_PLAYERS.push({
    name: `Player Star ${i}`,
    role: roles[i % 4],
    basePrice: 20 + ((i % 4) * 10),
    img: `https://api.dicebear.com/7.x/bottts/svg?seed=Star${i}`
  });
}

function nextPlayer(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  if (room.currentIndex >= room.players.length) {
    room.status = "FINISHED";
    io.to(roomCode).emit('auction-ended', { users: room.users });
    return;
  }

  const player = room.players[room.currentIndex];
  room.currentBid = player.basePrice;
  room.highestBidder = null;
  io.to(roomCode).emit('new-player', { player, currentBid: room.currentBid, index: room.currentIndex + 1, total: room.players.length });
}

io.on('connection', (socket) => {
  socket.on('create-room', ({ roomCode, teamName, maxTeams }) => {
    if (rooms[roomCode]) {
      socket.emit('error-msg', 'Room code pehle se maujood hai!');
      return;
    }

    const teamLimit = parseInt(maxTeams) || 2;
    const requiredPlayersCount = teamLimit * 16;
    const selectedPool = MASTER_PLAYERS.slice(0, requiredPlayersCount);

    rooms[roomCode] = {
      code: roomCode,
      hostId: socket.id,
      maxTeams: teamLimit,
      players: selectedPool,
      users: {},
      currentIndex: 0,
      currentBid: 0,
      highestBidder: null,
      status: "WAITING"
    };

    rooms[roomCode].users[socket.id] = {
      id: socket.id,
      team: teamName || "Team 1",
      purse: 1200,
      squad: []
    };

    socket.join(roomCode);
    socket.roomCode = roomCode;
    socket.emit('room-joined', { 
      roomCode, 
      user: rooms[roomCode].users[socket.id], 
      isHost: true, 
      maxTeams: teamLimit, 
      totalPlayers: requiredPlayersCount 
    });
  });

  socket.on('join-room', ({ roomCode, teamName }) => {
    const room = rooms[roomCode];
    if (!room) {
      socket.emit('error-msg', 'Room nahi mila! Code check karein.');
      return;
    }

    if (Object.keys(room.users).length >= room.maxTeams) {
      socket.emit('error-msg', `Room full hai! Max ${room.maxTeams} Teams allowed.`);
      return;
    }

    room.users[socket.id] = {
      id: socket.id,
      team: teamName || `Team ${Object.keys(room.users).length + 1}`,
      purse: 1200,
      squad: []
    };

    socket.join(roomCode);
    socket.roomCode = roomCode;
    socket.emit('room-joined', { 
      roomCode, 
      user: room.users[socket.id], 
      isHost: false, 
      maxTeams: room.maxTeams, 
      totalPlayers: room.players.length 
    });

    io.to(roomCode).emit('update-users', room.users);

    if (Object.keys(room.users).length === room.maxTeams) {
      room.status = "BIDDING";
      io.to(roomCode).emit('game-started');
      setTimeout(() => nextPlayer(roomCode), 1500);
    }
  });

  socket.on('place-bid', () => {
    const room = rooms[socket.roomCode];
    if (!room || room.status !== "BIDDING") return;

    const user = room.users[socket.id];
    if (user.squad.length >= 16) {
      socket.emit('error-msg', 'Aapka 16 players ka squad full ho chuka hai!');
      return;
    }

    const nextBid = room.highestBidder ? room.currentBid + 10 : room.currentBid;

    if (user && user.purse >= nextBid && room.highestBidder !== socket.id) {
      room.currentBid = nextBid;
      room.highestBidder = socket.id;
      io.to(socket.roomCode).emit('bid-placed', {
        currentBid: room.currentBid,
        highestBidder: user.team
      });
    }
  });

  socket.on('host-action-sold', () => {
    const room = rooms[socket.roomCode];
    if (!room || room.hostId !== socket.id || room.status !== "BIDDING") return;

    const player = room.players[room.currentIndex];
    if (room.highestBidder) {
      const winner = room.users[room.highestBidder];
      winner.purse -= room.currentBid;
      winner.squad.push({ name: player.name, price: room.currentBid, role: player.role });
      io.to(socket.roomCode).emit('player-sold', { player, winner: winner.team, price: room.currentBid });
    } else {
      io.to(socket.roomCode).emit('player-unsold', { player });
    }

    io.to(socket.roomCode).emit('update-users', room.users);
    room.currentIndex++;
    setTimeout(() => nextPlayer(socket.roomCode), 1500);
  });

  socket.on('host-action-unsold', () => {
    const room = rooms[socket.roomCode];
    if (!room || room.hostId !== socket.id || room.status !== "BIDDING") return;

    const player = room.players[room.currentIndex];
    io.to(socket.roomCode).emit('player-unsold', { player });

    room.currentIndex++;
    setTimeout(() => nextPlayer(socket.roomCode), 1500);
  });

  socket.on('disconnect', () => {
    const room = rooms[socket.roomCode];
    if (room) {
      delete room.users[socket.id];
      io.to(socket.roomCode).emit('update-users', room.users);
      if (Object.keys(room.users).length === 0) {
        delete rooms[socket.roomCode];
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
   
