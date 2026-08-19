const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.static('public'));

const rooms = {};

// 251 REAL PLAYERS POOL (Including Sophie Molineux)
const MASTER_PLAYERS = [
  { name: "Smriti Mandhana", role: "Batter", country: "IND", isOverseas: false, basePrice: 50, rating: 94 },
  { name: "Harmanpreet Kaur", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 50, rating: 92 },
  { name: "Ellyse Perry", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 50, rating: 96 },
  { name: "Meg Lanning", role: "Batter", country: "AUS", isOverseas: true, basePrice: 50, rating: 93 },
  { name: "Deepti Sharma", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 50, rating: 91 },
  { name: "Sophie Molineux", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 40, rating: 90 },
  { name: "Shafali Verma", role: "Batter", country: "IND", isOverseas: false, basePrice: 40, rating: 88 },
  { name: "Jemimah Rodrigues", role: "Batter", country: "IND", isOverseas: false, basePrice: 40, rating: 89 },
  { name: "Richa Ghosh", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 40, rating: 88 },
  { name: "Renuka Singh Thakur", role: "Bowler", country: "IND", isOverseas: false, basePrice: 40, rating: 89 },
  { name: "Sophie Devine", role: "All-Rounder", country: "NZ", isOverseas: true, basePrice: 50, rating: 93 },
  { name: "Alyssa Healy", role: "Wicket-Keeper", country: "AUS", isOverseas: true, basePrice: 50, rating: 92 },
  { name: "Beth Mooney", role: "Batter", country: "AUS", isOverseas: true, basePrice: 50, rating: 94 },
  { name: "Nat Sciver-Brunt", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 50, rating: 95 },
  { name: "Amelia Kerr", role: "All-Rounder", country: "NZ", isOverseas: true, basePrice: 50, rating: 92 },
  { name: "Ashleigh Gardner", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 50, rating: 94 },
  { name: "Marizanne Kapp", role: "All-Rounder", country: "SA", isOverseas: true, basePrice: 50, rating: 93 },
  { name: "Hayley Matthews", role: "All-Rounder", country: "WI", isOverseas: true, basePrice: 50, rating: 93 },
  { name: "Sophie Ecclestone", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 50, rating: 96 },
  { name: "Shreyanka Patil", role: "Bowler", country: "IND", isOverseas: false, basePrice: 30, rating: 86 },
  { name: "Pooja Vastrakar", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 30, rating: 85 },
  { name: "Yastika Bhatia", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 30, rating: 84 },
  { name: "Alice Capsey", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 40, rating: 87 },
  { name: "Radha Yadav", role: "Bowler", country: "IND", isOverseas: false, basePrice: 30, rating: 85 },
  { name: "Tahlia McGrath", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 40, rating: 89 },
  { name: "Grace Harris", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 30, rating: 88 },
  { name: "Laura Wolvaardt", role: "Batter", country: "SA", isOverseas: true, basePrice: 30, rating: 91 },
  { name: "Georgia Wareham", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 30, rating: 87 },
  { name: "Chamari Athapaththu", role: "All-Rounder", country: "SL", isOverseas: true, basePrice: 40, rating: 92 },
  { name: "Shabnim Ismail", role: "Bowler", country: "SA", isOverseas: true, basePrice: 50, rating: 92 },
  { name: "Annabel Sutherland", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 40, rating: 90 }
];

// Fallback generate remaining up to 251
const EXTRA_PLAYERS = [
  "Heather Knight", "Danielle Wyatt-Hodge", "Jess Jonassen", "Kate Cross", "Alana King",
  "Lea Tahuhu", "Suzie Bates", "Shikha Pandey", "Rajeshwari Gayakwad", "Titas Sadhu",
  "Arundhati Reddy", "Amanjot Kaur", "Sneh Rana", "Harleen Deol", "Saika Ishaque",
  "Asha Sobhana", "Sajeevan Sajana", "Dayalan Hemalatha", "Kashvee Gautam", "Vrindha Dinesh",
  "Minnu Mani", "Ekta Bisht", "Poonam Yadav", "Kiran Navgire", "Anjali Sarvani",
  "Shweta Sehrawat", "Tanuja Kanwar", "Meghna Singh", "Lauren Bell", "Amy Jones",
  "Tahlia Wilson", "Nadine de Klerk", "Chloe Tryon", "Tazmin Brits", "Ayabonga Khaka",
  "Suné Luus", "Nonkululeko Mlaba", "Laura Harris", "Kim Garth", "Megan Schutt",
  "Hannah Darlington", "Amanda-Jade Wellington", "Phoebe Litchfield", "Kathryn Bryce", "Sarah Glenn",
  "Freya Kemp", "Issy Wong", "Maia Bouchier", "Lauren Filer", "Bess Heath",
  "Mady Villiers", "Eden Carson", "Fran Jonas", "Jess Kerr", "Hannah Rowe",
  "Maddy Green", "Brooke Halliday", "Isabella Gaze", "Molly Penfold", "Georgia Plimmer",
  "Stafanie Taylor", "Shemaine Campbelle", "Chinelle Henry", "Shamilia Connell", "Afy Fletcher",
  "Karishma Ramharack", "Aaliyah Alleyne", "Rashada Williams", "Qiana Joseph", "Harshitha Samarawickrama",
  "Vishmi Gunaratne", "Nilakshi de Silva", "Kavisha Dilhari", "Inoka Ranaweera", "Sugandika Kumari",
  "Udeshika Prabodhani", "Anushka Sanjeewani", "Nigar Sultana", "Nahida Akter", "Fargana Hoque",
  "Ritu Moni", "Shorna Akter", "Marufa Akter", "Rabeya Khan", "Fahima Khatun",
  "Devika Vaidya", "Sabbhineni Meghana", "Priya Punia", "Simran Bahadur", "Parshavi Chopra",
  "Mannat Kashyap", "G Trisha", "Shabnam Shakil", "Monica Patel", "Jintimani Kalita",
  "Priyanka Bala", "Humairaa Kaazi", "Aparna Mondal", "S Yashasri", "Laxmi Yadav",
  "Simran Shaikh", "Gouher Sultana", "Disha Kasat", "Indrani Roy", "Tarannum Pathan",
  "Poonam Khemnar", "Sneha Deepthi", "Komal Zanzad", "Pratika Rawal", "Rashi Kanojiya",
  "Anusha Bareddy", "Uma Chetry", "Bharti Fulmali", "Shivali Shinde", "Nuzhat Parween",
  "Tejal Hasabnis", "Sayali Satghare", "Priya Mishra", "Soniya Mendhiya", "Hurley Gala",
  "Grace Scrivens", "Alice Davidson-Richards", "Tash Farrant", "Katie Levick", "Georgia Elwiss",
  "Linsey Smith", "Paige Scholfield", "Ryana MacDonald-Gay", "Charis Pavely", "Seren Smale",
  "Davina Perrin", "Courtney Webb", "Nicola Carey", "Sammy-Jo Johnson", "Maitlan Brown",
  "Tess Flintoff", "Heather Graham", "Stella Campbell", "Charli Knott", "Georgia Voll",
  "Katie Mack", "Bridget Patterson", "Anesu Mushangwe", "Sarah Bryce", "Priyanaz Chatterji",
  "Abtaha Maqsood", "Sterre Kalis", "Iris Zwilling", "Babette de Leede", "Gaby Lewis",
  "Orla Prendergast", "Arlene Kelly", "Laura Delany", "Amy Hunter", "Cara Murray",
  "Fatima Sana", "Nida Dar", "Aliya Riaz", "Muneeba Ali", "Diana Baig",
  "Nashra Sandhu", "Sidra Ameen", "Sadia Iqbal", "Tuba Hassan", "Omaima Sohail",
  "Ghulam Fatima", "Gargi Banerji", "Rashi Kashyap", "Mamatha Maben", "Shweta Jadhav",
  "Kajal Verma", "Nandini Kashyap", "Chitra Singh", "Pooja Nimavat", "Dhara Gujjar",
  "Hrishita Basu", "Soumya Tiwari", "Archana Devi", "Falak Naz", "Sonam Yadav",
  "Najla CMC", "Kirti James", "Divya Gnanananda", "Prathyusha Challuru", "Sahana Pawar",
  "Rupali Patel", "Priyanka Garkhede", "Aaditi Surve", "Shanu Sen", "Tanu Shree",
  "Monalisha Rout", "Rima Laxmi Ekka", "Kajal Jena", "Sushree Dibyadarshini", "Rasanara Parwin",
  "Neetu David", "Nuzhat Siddiqui", "Shubha Satheesh", "Gautami Naik", "Veda Krishnamurthy",
  "Ekta Kaundal", "Chitra Jamwal", "Jyoti Chouhan", "Sunita Anand", "Shilpa Sahu",
  "Shivani Singh", "Soni Yadav", "Simran Dil Bahadur", "Ananya Upendran", "Niki Prasad",
  "Ragini Yadav", "Kashish Verma", "Kavita Patil", "Vaishnavi Sharma", "Neha Chavda",
  "Yashasvi Katta", "Ananya Goel", "Tanushree Sarkar", "Prativa Rana", "Mamta Kanojia"
];

const rolesList = ["Batter", "Bowler", "All-Rounder", "Wicket-Keeper"];
EXTRA_PLAYERS.forEach((name, idx) => {
  if (MASTER_PLAYERS.length < 251) {
    MASTER_PLAYERS.push({
      name,
      role: rolesList[idx % 4],
      country: idx % 3 === 0 ? "AUS" : "IND",
      isOverseas: idx % 3 === 0,
      basePrice: 10 + ((idx % 3) * 10),
      rating: 75 + (idx % 12)
    });
  }
});

MASTER_PLAYERS.forEach(p => {
  p.img = `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(p.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
});

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startTimer(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  clearInterval(room.timerInterval);
  room.timer = room.isAccelerated ? 5 : 10;
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

  const player = room.currentPool[room.currentIndex];
  if (room.highestBidder) {
    const winner = room.users[room.highestBidder];
    winner.purse -= room.currentBid;
    winner.squad.push({
      name: player.name,
      role: player.role,
      country: player.country,
      isOverseas: player.isOverseas,
      price: room.currentBid,
      rating: player.rating || 80,
      img: player.img
    });
    if (player.isOverseas) winner.overseasCount++;
    io.to(roomCode).emit('player-sold', { player, winner: winner.teamName, price: room.currentBid });
  } else {
    room.unsoldPool.push(player);
    io.to(roomCode).emit('player-unsold', { player });
  }

  io.to(roomCode).emit('update-users', room.users);
  room.currentIndex++;
  setTimeout(() => nextPlayer(roomCode), 1500);
}

function nextPlayer(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  const users = Object.values(room.users);
  if (users.length > 0 && users.every(u => u.squad.length >= 16)) {
    endAuction(roomCode);
    return;
  }

  if (!room.isAccelerated && room.currentIndex === 100) {
    pauseForAcceleratedWishlist(roomCode);
    return;
  }

  if (room.currentIndex >= room.currentPool.length) {
    if (!room.isAccelerated && (room.unsoldPool.length > 0 || room.currentPool.length < 251)) {
      pauseForAcceleratedWishlist(roomCode);
      return;
    } else {
      endAuction(roomCode);
      return;
    }
  }

  const player = room.currentPool[room.currentIndex];
  room.currentBid = player.basePrice;
  room.highestBidder = null;

  io.to(roomCode).emit('new-player', {
    player,
    currentBid: room.currentBid,
    index: room.currentIndex + 1,
    total: room.currentPool.length,
    round: room.round,
    isAccelerated: room.isAccelerated
  });

  startTimer(roomCode);
}

function pauseForAcceleratedWishlist(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;
  clearInterval(room.timerInterval);
  room.status = "WISHLIST_SUBMISSION";

  const remainingPlayers = [...room.unsoldPool, ...room.currentPool.slice(room.currentIndex)];
  room.availableForWishlist = remainingPlayers;
  room.submittedWishlists = {};
  io.to(roomCode).emit('open-wishlist-modal', { remainingPlayers });
}

function endAuction(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;
  clearInterval(room.timerInterval);
  room.status = "FINISHED";
  io.to(roomCode).emit('auction-ended', { users: room.users });
}

function simulateMatch(teamA, teamB) {
  let scoreA = (teamA.playing11 || []).reduce((sum, p) => sum + (p.rating || 80) * (p.isCaptain ? 2.0 : (p.isVC ? 1.5 : 1.0)), 0);
  let scoreB = (teamB.playing11 || []).reduce((sum, p) => sum + (p.rating || 80) * (p.isCaptain ? 2.0 : (p.isVC ? 1.5 : 1.0)), 0);

  const runsA = Math.floor(130 + (scoreA / 12) + (Math.random() * 40));
  const wicketsA = Math.min(10, Math.floor(3 + Math.random() * 6));
  const runsB = Math.floor(130 + (scoreB / 12) + (Math.random() * 40));
  const wicketsB = Math.min(10, Math.floor(3 + Math.random() * 6));

  return {
    teamA: { name: teamA.teamName, logo: teamA.logo, runs: runsA, wickets: wicketsA },
    teamB: { name: teamB.teamName, logo: teamB.logo, runs: runsB, wickets: wicketsB },
    winner: runsA >= runsB ? teamA.teamName : teamB.teamName
  };
}

io.on('connection', (socket) => {
  socket.on('create-room', ({ roomCode, teamKey, teamName, logo, maxTeams }) => {
    if (!roomCode) {
      socket.emit('error-msg', 'Invalid room code!');
      return;
    }

    if (rooms[roomCode]) {
      socket.emit('error-msg', 'Room Code pehle se bana hua hai! Doosra code use karein.');
      return;
    }

    const teamLimit = parseInt(maxTeams) || 2;
    rooms[roomCode] = {
      code: roomCode,
      hostId: socket.id,
      maxTeams: teamLimit,
      currentPool: shuffleArray(MASTER_PLAYERS),
      unsoldPool: [],
      round: 1,
      isAccelerated: false,
      users: {},
      currentIndex: 0,
      currentBid: 0,
      highestBidder: null,
      timer: 10,
      timerInterval: null,
      status: "WAITING",
      lockedP11Count: 0
    };

    rooms[roomCode].users[socket.id] = {
      id: socket.id,
      teamKey,
      teamName,
      logo,
      purse: 1500,
      squad: [],
      playing11: [],
      overseasCount: 0
    };

    socket.join(roomCode);
    socket.roomCode = roomCode;

    socket.emit('room-joined', {
      roomCode,
      user: rooms[roomCode].users[socket.id],
      isHost: true,
      maxTeams: teamLimit
    });
  });

  socket.on('join-room', ({ roomCode, teamKey, teamName, logo }) => {
    const room = rooms[roomCode];
    if (!room) {
      socket.emit('error-msg', 'Room nahi mila! Room Code sahi dalein.');
      return;
    }

    if (Object.keys(room.users).length >= room.maxTeams) {
      socket.emit('error-msg', `Room full hai! Max ${room.maxTeams} Teams allowed.`);
      return;
    }

    room.users[socket.id] = {
      id: socket.id,
      teamKey,
      teamName,
      logo,
      purse: 1500,
      squad: [],
      playing11: [],
      overseasCount: 0
    };

    socket.join(roomCode);
    socket.roomCode = roomCode;

    socket.emit('room-joined', {
      roomCode,
      user: room.users[socket.id],
      isHost: false,
      maxTeams: room.maxTeams
    });

    io.to(roomCode).emit('update-users', room.users);

    if (Object.keys(room.users).length === room.maxTeams && room.status === "WAITING") {
      room.status = "BIDDING";
      io.to(roomCode).emit('game-started');
      setTimeout(() => nextPlayer(roomCode), 1500);
    }
  });

  socket.on('submit-wishlist', ({ selectedPlayerNames }) => {
    const room = rooms[socket.roomCode];
    if (!room || room.status !== "WISHLIST_SUBMISSION") return;

    room.submittedWishlists[socket.id] = selectedPlayerNames || [];
    const totalTeams = Object.keys(room.users).length;
    const submittedCount = Object.keys(room.submittedWishlists).length;

    io.to(socket.roomCode).emit('wishlist-progress', { submittedCount, totalTeams });

    if (submittedCount >= totalTeams) {
      const requestedNames = new Set();
      Object.values(room.submittedWishlists).forEach(list => list.forEach(name => requestedNames.add(name)));

      let acceleratedPool = room.availableForWishlist.filter(p => requestedNames.has(p.name));
      if (acceleratedPool.length === 0) acceleratedPool = room.availableForWishlist.slice(0, 30);

      room.currentPool = shuffleArray(acceleratedPool);
      room.currentIndex = 0;
      room.isAccelerated = true;
      room.round = 2;
      room.status = "BIDDING";

      io.to(socket.roomCode).emit('accelerated-round-start', { total: room.currentPool.length });
      setTimeout(() => nextPlayer(socket.roomCode), 2000);
    }
  });

  socket.on('place-bid', () => {
    const room = rooms[socket.roomCode];
    if (!room || room.status !== "BIDDING") return;

    const user = room.users[socket.id];
    const player = room.currentPool[room.currentIndex];
    if (!user || !player) return;

    if (user.squad.length >= 16) {
      socket.emit('error-msg', 'Aapka squad limit (16 Players) pura ho chuka hai!');
      return;
    }

    if (player.isOverseas && user.overseasCount >= 6) {
      socket.emit('error-msg', 'Max 6 Overseas allowed!');
      return;
    }

    let increment = (room.currentBid >= 100) ? 10 : 5;
    const nextBid = room.highestBidder ? room.currentBid + increment : room.currentBid;

    if (user.purse < nextBid) {
      socket.emit('error-msg', 'Purse balance insufficient!');
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
      highestBidder: user.teamName,
      logo: user.logo
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
    const player = room.currentPool[room.currentIndex];
    room.unsoldPool.push(player);
    io.to(socket.roomCode).emit('player-unsold', { player });

    room.currentIndex++;
    setTimeout(() => nextPlayer(socket.roomCode), 1500);
  });

  socket.on('submit-playing-11', ({ playing11 }) => {
    const room = rooms[socket.roomCode];
    if (!room) return;

    const user = room.users[socket.id];
    if (user) {
      user.playing11 = playing11;
      room.lockedP11Count = (room.lockedP11Count || 0) + 1;

      if (room.lockedP11Count >= Object.keys(room.users).length) {
        const userList = Object.values(room.users);
        const matchResults = [];
        for (let i = 0; i < userList.length - 1; i++) {
          for (let j = i + 1; j < userList.length; j++) {
            matchResults.push(simulateMatch(userList[i], userList[j]));
          }
        }
        io.to(socket.roomCode).emit('tournament-results', { matchResults });
      }
    }
  });

  socket.on('send-chat', ({ message }) => {
    const room = rooms[socket.roomCode];
    if (!room || !message.trim()) return;
    const user = room.users[socket.id];
    if (user) {
      io.to(socket.roomCode).emit('new-chat-message', {
        sender: user.teamName,
        logo: user.logo,
        message: message.trim()
      });
    }
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
