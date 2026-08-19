const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const rooms = {};

// COMPLETE 150 REAL PLAYERS POOL (Official WPL Base Prices in Lakhs)
const MASTER_PLAYERS = [
  // 1 - 30 (Marquee & Top Stars)
  { name: "Smriti Mandhana", role: "Batter", country: "IND", isOverseas: false, basePrice: 50 },
  { name: "Harmanpreet Kaur", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 50 },
  { name: "Ellyse Perry", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 50 },
  { name: "Meg Lanning", role: "Batter", country: "AUS", isOverseas: true, basePrice: 50 },
  { name: "Deepti Sharma", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 50 },
  { name: "Shafali Verma", role: "Batter", country: "IND", isOverseas: false, basePrice: 40 },
  { name: "Jemimah Rodrigues", role: "Batter", country: "IND", isOverseas: false, basePrice: 40 },
  { name: "Richa Ghosh", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 40 },
  { name: "Renuka Singh Thakur", role: "Bowler", country: "IND", isOverseas: false, basePrice: 40 },
  { name: "Sophie Devine", role: "All-Rounder", country: "NZ", isOverseas: true, basePrice: 50 },
  { name: "Alyssa Healy", role: "Wicket-Keeper", country: "AUS", isOverseas: true, basePrice: 50 },
  { name: "Beth Mooney", role: "Batter", country: "AUS", isOverseas: true, basePrice: 50 },
  { name: "Nat Sciver-Brunt", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 50 },
  { name: "Amelia Kerr", role: "All-Rounder", country: "NZ", isOverseas: true, basePrice: 50 },
  { name: "Ashleigh Gardner", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 50 },
  { name: "Marizanne Kapp", role: "All-Rounder", country: "SA", isOverseas: true, basePrice: 50 },
  { name: "Hayley Matthews", role: "All-Rounder", country: "WI", isOverseas: true, basePrice: 50 },
  { name: "Sophie Ecclestone", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 50 },
  { name: "Shreyanka Patil", role: "Bowler", country: "IND", isOverseas: false, basePrice: 30 },
  { name: "Pooja Vastrakar", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 30 },
  { name: "Yastika Bhatia", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 30 },
  { name: "Alice Capsey", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 40 },
  { name: "Radha Yadav", role: "Bowler", country: "IND", isOverseas: false, basePrice: 30 },
  { name: "Tahlia McGrath", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 40 },
  { name: "Grace Harris", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 30 },
  { name: "Laura Wolvaardt", role: "Batter", country: "SA", isOverseas: true, basePrice: 30 },
  { name: "Georgia Wareham", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 30 },
  { name: "Chamari Athapaththu", role: "All-Rounder", country: "SL", isOverseas: true, basePrice: 40 },
  { name: "Shabnim Ismail", role: "Bowler", country: "SA", isOverseas: true, basePrice: 50 },
  { name: "Annabel Sutherland", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 40 },

  // 31 - 60
  { name: "Heather Knight", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 30 },
  { name: "Danielle Wyatt-Hodge", role: "Batter", country: "ENG", isOverseas: true, basePrice: 30 },
  { name: "Jess Jonassen", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 30 },
  { name: "Kate Cross", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 30 },
  { name: "Alana King", role: "Bowler", country: "AUS", isOverseas: true, basePrice: 30 },
  { name: "Lea Tahuhu", role: "Bowler", country: "NZ", isOverseas: true, basePrice: 30 },
  { name: "Suzie Bates", role: "Batter", country: "NZ", isOverseas: true, basePrice: 30 },
  { name: "Shikha Pandey", role: "Bowler", country: "IND", isOverseas: false, basePrice: 40 },
  { name: "Rajeshwari Gayakwad", role: "Bowler", country: "IND", isOverseas: false, basePrice: 40 },
  { name: "Titas Sadhu", role: "Bowler", country: "IND", isOverseas: false, basePrice: 40 },
  { name: "Arundhati Reddy", role: "Bowler", country: "IND", isOverseas: false, basePrice: 50 },
  { name: "Amanjot Kaur", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 30 },
  { name: "Sneh Rana", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 30 },
  { name: "Harleen Deol", role: "Batter", country: "IND", isOverseas: false, basePrice: 50 },
  { name: "Saika Ishaque", role: "Bowler", country: "IND", isOverseas: false, basePrice: 30 },
  { name: "Asha Sobhana", role: "Bowler", country: "IND", isOverseas: false, basePrice: 30 },
  { name: "Sajeevan Sajana", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 30 },
  { name: "Dayalan Hemalatha", role: "Batter", country: "IND", isOverseas: false, basePrice: 20 },
  { name: "Kashvee Gautam", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 50 },
  { name: "Vrindha Dinesh", role: "Batter", country: "IND", isOverseas: false, basePrice: 30 },
  { name: "Minnu Mani", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 30 },
  { name: "Ekta Bisht", role: "Bowler", country: "IND", isOverseas: false, basePrice: 20 },
  { name: "Poonam Yadav", role: "Bowler", country: "IND", isOverseas: false, basePrice: 20 },
  { name: "Kiran Navgire", role: "Batter", country: "IND", isOverseas: false, basePrice: 40 },
  { name: "Anjali Sarvani", role: "Bowler", country: "IND", isOverseas: false, basePrice: 20 },
  { name: "Shweta Sehrawat", role: "Batter", country: "IND", isOverseas: false, basePrice: 30 },
  { name: "Tanuja Kanwar", role: "Bowler", country: "IND", isOverseas: false, basePrice: 45 },
  { name: "Meghna Singh", role: "Bowler", country: "IND", isOverseas: false, basePrice: 20 },
  { name: "Lauren Bell", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 50 },
  { name: "Amy Jones", role: "Wicket-Keeper", country: "ENG", isOverseas: true, basePrice: 50 },

  // 61 - 90
  { name: "Tahlia Wilson", role: "Wicket-Keeper", country: "AUS", isOverseas: true, basePrice: 20 },
  { name: "Nadine de Klerk", role: "All-Rounder", country: "SA", isOverseas: true, basePrice: 30 },
  { name: "Chloe Tryon", role: "All-Rounder", country: "SA", isOverseas: true, basePrice: 30 },
  { name: "Tazmin Brits", role: "Batter", country: "SA", isOverseas: true, basePrice: 30 },
  { name: "Ayabonga Khaka", role: "Bowler", country: "SA", isOverseas: true, basePrice: 40 },
  { name: "Suné Luus", role: "All-Rounder", country: "SA", isOverseas: true, basePrice: 30 },
  { name: "Nonkululeko Mlaba", role: "Bowler", country: "SA", isOverseas: true, basePrice: 20 },
  { name: "Laura Harris", role: "Batter", country: "AUS", isOverseas: true, basePrice: 20 },
  { name: "Kim Garth", role: "Bowler", country: "AUS", isOverseas: true, basePrice: 50 },
  { name: "Megan Schutt", role: "Bowler", country: "AUS", isOverseas: true, basePrice: 40 },
  { name: "Hannah Darlington", role: "Bowler", country: "AUS", isOverseas: true, basePrice: 20 },
  { name: "Amanda-Jade Wellington", role: "Bowler", country: "AUS", isOverseas: true, basePrice: 30 },
  { name: "Phoebe Litchfield", role: "Batter", country: "AUS", isOverseas: true, basePrice: 50 },
  { name: "Kathryn Bryce", role: "All-Rounder", country: "SCO", isOverseas: true, basePrice: 20 },
  { name: "Sarah Glenn", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 30 },
  { name: "Freya Kemp", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 20 },
  { name: "Issy Wong", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 30 },
  { name: "Maia Bouchier", role: "Batter", country: "ENG", isOverseas: true, basePrice: 30 },
  { name: "Lauren Filer", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 20 },
  { name: "Bess Heath", role: "Wicket-Keeper", country: "ENG", isOverseas: true, basePrice: 20 },
  { name: "Mady Villiers", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 20 },
  { name: "Eden Carson", role: "Bowler", country: "NZ", isOverseas: true, basePrice: 20 },
  { name: "Fran Jonas", role: "Bowler", country: "NZ", isOverseas: true, basePrice: 20 },
  { name: "Jess Kerr", role: "Bowler", country: "NZ", isOverseas: true, basePrice: 20 },
  { name: "Hannah Rowe", role: "All-Rounder", country: "NZ", isOverseas: true, basePrice: 20 },
  { name: "Maddy Green", role: "Batter", country: "NZ", isOverseas: true, basePrice: 20 },
  { name: "Brooke Halliday", role: "Batter", country: "NZ", isOverseas: true, basePrice: 20 },
  { name: "Isabella Gaze", role: "Wicket-Keeper", country: "NZ", isOverseas: true, basePrice: 30 },
  { name: "Molly Penfold", role: "Bowler", country: "NZ", isOverseas: true, basePrice: 10 },
  { name: "Georgia Plimmer", role: "Batter", country: "NZ", isOverseas: true, basePrice: 20 },

  // 91 - 120
  { name: "Stafanie Taylor", role: "All-Rounder", country: "WI", isOverseas: true, basePrice: 30 },
  { name: "Shemaine Campbelle", role: "Wicket-Keeper", country: "WI", isOverseas: true, basePrice: 20 },
  { name: "Chinelle Henry", role: "All-Rounder", country: "WI", isOverseas: true, basePrice: 30 },
  { name: "Shamilia Connell", role: "Bowler", country: "WI", isOverseas: true, basePrice: 30 },
  { name: "Afy Fletcher", role: "Bowler", country: "WI", isOverseas: true, basePrice: 20 },
  { name: "Karishma Ramharack", role: "Bowler", country: "WI", isOverseas: true, basePrice: 20 },
  { name: "Aaliyah Alleyne", role: "All-Rounder", country: "WI", isOverseas: true, basePrice: 20 },
  { name: "Rashada Williams", role: "Wicket-Keeper", country: "WI", isOverseas: true, basePrice: 10 },
  { name: "Qiana Joseph", role: "All-Rounder", country: "WI", isOverseas: true, basePrice: 20 },
  { name: "Harshitha Samarawickrama", role: "Batter", country: "SL", isOverseas: true, basePrice: 20 },
  { name: "Vishmi Gunaratne", role: "Batter", country: "SL", isOverseas: true, basePrice: 20 },
  { name: "Nilakshi de Silva", role: "Batter", country: "SL", isOverseas: true, basePrice: 20 },
  { name: "Kavisha Dilhari", role: "All-Rounder", country: "SL", isOverseas: true, basePrice: 20 },
  { name: "Inoka Ranaweera", role: "Bowler", country: "SL", isOverseas: true, basePrice: 20 },
  { name: "Sugandika Kumari", role: "Bowler", country: "SL", isOverseas: true, basePrice: 20 },
  { name: "Udeshika Prabodhani", role: "Bowler", country: "SL", isOverseas: true, basePrice: 20 },
  { name: "Anushka Sanjeewani", role: "Wicket-Keeper", country: "SL", isOverseas: true, basePrice: 10 },
  { name: "Nigar Sultana", role: "Wicket-Keeper", country: "BAN", isOverseas: true, basePrice: 20 },
  { name: "Nahida Akter", role: "Bowler", country: "BAN", isOverseas: true, basePrice: 20 },
  { name: "Fargana Hoque", role: "Batter", country: "BAN", isOverseas: true, basePrice: 20 },
  { name: "Ritu Moni", role: "All-Rounder", country: "BAN", isOverseas: true, basePrice: 10 },
  { name: "Shorna Akter", role: "All-Rounder", country: "BAN", isOverseas: true, basePrice: 20 },
  { name: "Marufa Akter", role: "Bowler", country: "BAN", isOverseas: true, basePrice: 30 },
  { name: "Rabeya Khan", role: "Bowler", country: "BAN", isOverseas: true, basePrice: 20 },
  { name: "Fahima Khatun", role: "Bowler", country: "BAN", isOverseas: true, basePrice: 10 },
  { name: "Devika Vaidya", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 30 },
  { name: "Sabbhineni Meghana", role: "Batter", country: "IND", isOverseas: false, basePrice: 30 },
  { name: "Priya Punia", role: "Batter", country: "IND", isOverseas: false, basePrice: 30 },
  { name: "Simran Bahadur", role: "Bowler", country: "IND", isOverseas: false, basePrice: 20 },
  { name: "Parshavi Chopra", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10 },

  // 121 - 150
  { name: "Mannat Kashyap", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "G Trisha", role: "Batter", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Shabnam Shakil", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Monica Patel", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Jintimani Kalita", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 30 },
  { name: "Priyanka Bala", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Humairaa Kaazi", role: "Batter", country: "IND", isOverseas: false, basePrice: 30 },
  { name: "Aparna Mondal", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "S Yashasri", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Laxmi Yadav", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Simran Shaikh", role: "Batter", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Gouher Sultana", role: "Bowler", country: "IND", isOverseas: false, basePrice: 20 },
  { name: "Disha Kasat", role: "Batter", country: "IND", isOverseas: false, basePrice: 30 },
  { name: "Indrani Roy", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Tarannum Pathan", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Poonam Khemnar", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Sneha Deepthi", role: "Batter", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Komal Zanzad", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Pratika Rawal", role: "Batter", country: "IND", isOverseas: false, basePrice: 40 },
  { name: "Rashi Kanojiya", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Anusha Bareddy", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Uma Chetry", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 30 },
  { name: "Bharti Fulmali", role: "Batter", country: "IND", isOverseas: false, basePrice: 30 },
  { name: "Shivali Shinde", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Nuzhat Parween", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 30 },
  { name: "Tejal Hasabnis", role: "Batter", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Sayali Satghare", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Priya Mishra", role: "Bowler", country: "IND", isOverseas: false, basePrice: 40 },
  { name: "Soniya Mendhiya", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Hurley Gala", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10 }
];

// Profile Avatars
MASTER_PLAYERS.forEach(p => {
  p.img = `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(p.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
});

function startTimer(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  clearInterval(room.timerInterval);
  room.timer = 10;
  io.to(roomCode).emit('timer-tick', room.timer);

  room.timerInterval = setInterval(() => {
    room.timer--;
    io.to(roomCode).emit('timer-tick', room.timer);

    if (room.timer <= 0) {
      clearInterval(room.timerInterval);
      finalizePlayer(roomCode);
    }
  }, 1000);
}

function finalizePlayer(roomCode) {
  const room = rooms[roomCode];
  if (!room || room.status !== "BIDDING") return;
  clearInterval(room.timerInterval);

  const player = room.players[room.currentIndex];
  if (room.highestBidder) {
    const winner = room.users[room.highestBidder];
    winner.purse -= room.currentBid;
    winner.squad.push({
      name: player.name,
      role: player.role,
      country: player.country,
      isOverseas: player.isOverseas,
      price: room.currentBid
    });
    if (player.isOverseas) winner.overseasCount++;
    io.to(roomCode).emit('player-sold', { player, winner: winner.team, price: room.currentBid });
  } else {
    io.to(roomCode).emit('player-unsold', { player });
  }

  io.to(roomCode).emit('update-users', room.users);
  room.currentIndex++;
  setTimeout(() => nextPlayer(roomCode), 2000);
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
  io.to(roomCode).emit('new-player', {
    player,
    currentBid: room.currentBid,
    index: room.currentIndex + 1,
    total: room.players.length
  });
  startTimer(roomCode);
}

io.on('connection', (socket) => {
  socket.on('create-room', ({ roomCode, teamName, maxTeams }) => {
    if (rooms[roomCode]) {
      socket.emit('error-msg', 'Room code already exists!');
      return;
    }

    const teamLimit = parseInt(maxTeams) || 2;

    rooms[roomCode] = {
      code: roomCode,
      hostId: socket.id,
      maxTeams: teamLimit,
      players: MASTER_PLAYERS, // ALWAYS ALL 150 PLAYERS
      users: {},
      currentIndex: 0,
      currentBid: 0,
      highestBidder: null,
      timer: 10,
      timerInterval: null,
      status: "WAITING"
    };

    rooms[roomCode].users[socket.id] = {
      id: socket.id,
      team: teamName || "Team 1",
      purse: 1500, // 15 Crore WPL Purse (1500 Lakhs)
      squad: [],
      overseasCount: 0
    };

    socket.join(roomCode);
    socket.roomCode = roomCode;
    socket.emit('room-joined', {
      roomCode,
      user: rooms[roomCode].users[socket.id],
      isHost: true,
      maxTeams: teamLimit,
      totalPlayers: MASTER_PLAYERS.length
    });
  });

  socket.on('join-room', ({ roomCode, teamName }) => {
    const room = rooms[roomCode];
    if (!room) {
      socket.emit('error-msg', 'Room not found! Check room code.');
      return;
    }

    if (Object.keys(room.users).length >= room.maxTeams) {
      socket.emit('error-msg', `Room full hai! Max ${room.maxTeams} teams allowed.`);
      return;
    }

    room.users[socket.id] = {
      id: socket.id,
      team: teamName || `Team ${Object.keys(room.users).length + 1}`,
      purse: 1500,
      squad: [],
      overseasCount: 0
    };

    socket.join(roomCode);
    socket.roomCode = roomCode;
    socket.emit('room-joined', {
      roomCode,
      user: room.users[socket.id],
      isHost: false,
      maxTeams: room.maxTeams,
      totalPlayers: MASTER_PLAYERS.length
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
    const player = room.players[room.currentIndex];

    if (!user || !player) return;

    if (user.squad.length >= 16) {
      socket.emit('error-msg', 'Squad full ho chuka hai (Max 16 Players limit)!');
      return;
    }

    if (player.isOverseas && user.overseasCount >= 6) {
      socket.emit('error-msg', 'Overseas limit reached (Max 6 Overseas allowed)!');
      return;
    }

    // WPL Increments Rule: < 100L (+5L), >= 100L (+10L)
    let increment = 5;
    if (room.currentBid >= 100) {
      increment = 10;
    }

    const nextBid = room.highestBidder ? room.currentBid + increment : room.currentBid;

    if (user.purse < nextBid) {
      socket.emit('error-msg', 'Purse Balance kam hai!');
      return;
    }

    if (room.highestBidder === socket.id) {
      socket.emit('error-msg', 'Aap pehle se highest bidder hain!');
      return;
    }

    room.currentBid = nextBid;
    room.highestBidder = socket.id;
    io.to(socket.roomCode).emit('bid-placed', {
      currentBid: room.currentBid,
      highestBidder: user.team
    });

    startTimer(socket.roomCode);
  });

  socket.on('host-action-sold', () => {
    const room = rooms[socket.roomCode];
    if (!room || room.hostId !== socket.id || room.status !== "BIDDING") return;
    finalizePlayer(socket.roomCode);
  });

  socket.on('host-action-unsold', () => {
    const room = rooms[socket.roomCode];
    if (!room || room.hostId !== socket.id || room.status !== "BIDDING") return;

    clearInterval(room.timerInterval);
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
        clearInterval(room.timerInterval);
        delete rooms[socket.roomCode];
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
