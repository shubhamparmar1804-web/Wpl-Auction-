const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const rooms = {};

// 251 REAL PLAYERS POOL (Including Sophie Molineux)
const MASTER_PLAYERS = [
  { name: "Smriti Mandhana", role: "Batter", country: "IND", isOverseas: false, basePrice: 50, rating: 94, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321808.png" },
  { name: "Harmanpreet Kaur", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 50, rating: 92, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321805.png" },
  { name: "Ellyse Perry", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 50, rating: 96, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321700/321798.png" },
  { name: "Meg Lanning", role: "Batter", country: "AUS", isOverseas: true, basePrice: 50, rating: 93, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321700/321799.png" },
  { name: "Deepti Sharma", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 50, rating: 91, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321809.png" },
  { name: "Sophie Molineux", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 40, rating: 90, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321819.png" },
  { name: "Shafali Verma", role: "Batter", country: "IND", isOverseas: false, basePrice: 40, rating: 88, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321811.png" },
  { name: "Jemimah Rodrigues", role: "Batter", country: "IND", isOverseas: false, basePrice: 40, rating: 89, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321807.png" },
  { name: "Richa Ghosh", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 40, rating: 88, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321814.png" },
  { name: "Renuka Singh Thakur", role: "Bowler", country: "IND", isOverseas: false, basePrice: 40, rating: 89, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321815.png" },
  { name: "Sophie Devine", role: "All-Rounder", country: "NZ", isOverseas: true, basePrice: 50, rating: 93, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321804.png" },
  { name: "Alyssa Healy", role: "Wicket-Keeper", country: "AUS", isOverseas: true, basePrice: 50, rating: 92, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321801.png" },
  { name: "Beth Mooney", role: "Batter", country: "AUS", isOverseas: true, basePrice: 50, rating: 94, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321802.png" },
  { name: "Nat Sciver-Brunt", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 50, rating: 95, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321803.png" },
  { name: "Amelia Kerr", role: "All-Rounder", country: "NZ", isOverseas: true, basePrice: 50, rating: 92, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321810.png" },
  { name: "Ashleigh Gardner", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 50, rating: 94, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321800.png" },
  { name: "Marizanne Kapp", role: "All-Rounder", country: "SA", isOverseas: true, basePrice: 50, rating: 93, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321812.png" },
  { name: "Hayley Matthews", role: "All-Rounder", country: "WI", isOverseas: true, basePrice: 50, rating: 93, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321813.png" },
  { name: "Sophie Ecclestone", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 50, rating: 96, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321806.png" },
  { name: "Shreyanka Patil", role: "Bowler", country: "IND", isOverseas: false, basePrice: 30, rating: 86, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/373100/373121.png" },
  { name: "Pooja Vastrakar", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 30, rating: 85, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321816.png" },
  { name: "Yastika Bhatia", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 30, rating: 84, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321817.png" },
  { name: "Alice Capsey", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 40, rating: 87, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/339200/339213.png" },
  { name: "Radha Yadav", role: "Bowler", country: "IND", isOverseas: false, basePrice: 30, rating: 85, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321818.png" },
  { name: "Tahlia McGrath", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 40, rating: 89, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321819.png" },
  { name: "Grace Harris", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 30, rating: 88, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321820.png" },
  { name: "Laura Wolvaardt", role: "Batter", country: "SA", isOverseas: true, basePrice: 30, rating: 91, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321821.png" },
  { name: "Georgia Wareham", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 30, rating: 87, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321822.png" },
  { name: "Chamari Athapaththu", role: "All-Rounder", country: "SL", isOverseas: true, basePrice: 40, rating: 92, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321823.png" },
  { name: "Shabnim Ismail", role: "Bowler", country: "SA", isOverseas: true, basePrice: 50, rating: 92, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321824.png" },
  { name: "Annabel Sutherland", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 40, rating: 90, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321825.png" }
];

// Additional Players to complete 251 pool
const EXTRA_NAMES = [
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
EXTRA_NAMES.forEach((name, idx) => {
  if (MASTER_PLAYERS.length < 251) {
    MASTER_PLAYERS.push({
      name,
      role: rolesList[idx % 4],
      country: idx % 3 === 0 ? "AUS" : "IND",
      isOverseas: idx % 3 === 0,
      basePrice: 10 + ((idx % 3) * 10),
      rating: 75 + (idx % 12),
      img: `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
    });
  }
});

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function areAllSquadsFull(room) {
  const users = Object.values(room.users);
  if (users.length === 0) return false;
  return users.every(u => u.squad.length >= 16);
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

  if (areAllSquadsFull(room)) {
    endAuction(roomCode);
    return;
  }

  // 100 PLAYERS COMPLETE -> TRIGGER ACCELERATED WISHLIST PHASE
  if (!room.isAccelerated && room.currentIndex === 100) {
    pauseForAcceleratedWishlist(roomCode);
    return;
  }

  if (room.currentIndex >= room.currentPool.length) {
    if (!room.isAccelerated) {
      // If reached end before 100, still start accelerated wishlist
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

  // Remaining available players (Unsold + Rest of the pool)
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
  let scoreA = teamA.playing11.reduce((sum, p) => sum + (p.rating || 80) * (p.isCaptain ? 2.0 : (p.isVC ? 1.5 : 1.0)), 0);
  let scoreB = teamB.playing11.reduce((sum, p) => sum + (p.rating || 80) * (p.isCaptain ? 2.0 : (p.isVC ? 1.5 : 1.0)), 0);

  const runsA = Math.floor(130 + (scoreA / 12) + (Math.random() * 40));
  const wicketsA = Math.min(10, Math.floor(3 + Math.random() * 6));

  const runsB = Math.floor(130 + (scoreB / 12) + (Math.random() * 40));
  const wicketsB = Math.min(10, Math.floor(3 + Math.random() * 6));

  let winner = runsA >= runsB ? teamA.teamName : teamB.teamName;
  return {
    teamA: { name: teamA.teamName, logo: teamA.logo, runs: runsA, wickets: wicketsA },
    teamB: { name: teamB.teamName, logo: teamB.logo, runs: runsB, wickets: wicketsB },
    winner
  };
}

io.on('connection', (socket) => {
  // Reconnect
  socket.on('reconnect-user', ({ userId, roomCode }) => {
    const room = rooms[roomCode];
    if (room && room.users[userId]) {
      const user = room.users[userId];
      user.socketId = socket.id;
      socket.userId = userId;
      socket.roomCode = roomCode;
      socket.join(roomCode);

      socket.emit('reconnect-success', {
        roomCode,
        user,
        isHost: room.hostUserId === userId,
        status: room.status,
        users: room.users,
        currentPoolIndex: room.currentIndex,
        round: room.round,
        isAccelerated: room.isAccelerated
      });

      if (room.status === "BIDDING") {
        const player = room.currentPool[room.currentIndex];
        if (player) {
          socket.emit('new-player', {
            player,
            currentBid: room.currentBid,
            index: room.currentIndex + 1,
            total: room.currentPool.length,
            round: room.round,
            isAccelerated: room.isAccelerated
          });
        }
      } else if (room.status === "WISHLIST_SUBMISSION") {
        socket.emit('open-wishlist-modal', { remainingPlayers: room.availableForWishlist });
      }
    }
  });

  // Create Room
  socket.on('create-room', ({ roomCode, teamKey, teamName, logo, userId, maxTeams }) => {
    if (rooms[roomCode]) {
      socket.emit('error-msg', 'Room code pehle se maujood hai!');
      return;
    }

    const teamLimit = parseInt(maxTeams) || 2;

    rooms[roomCode] = {
      code: roomCode,
      hostUserId: userId,
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

    rooms[roomCode].users[userId] = {
      userId,
      socketId: socket.id,
      teamKey,
      teamName,
      logo,
      purse: 1500,
      squad: [],
      playing11: [],
      overseasCount: 0
    };

    socket.userId = userId;
    socket.roomCode = roomCode;
    socket.join(roomCode);

    socket.emit('room-joined', {
      roomCode,
      user: rooms[roomCode].users[userId],
      isHost: true,
      maxTeams: teamLimit
    });
  });

  // Join Room
  socket.on('join-room', ({ roomCode, teamKey, teamName, logo, userId }) => {
    const room = rooms[roomCode];
    if (!room) {
      socket.emit('error-msg', 'Room nahi mila! Code check karein.');
      return;
    }

    if (Object.keys(room.users).length >= room.maxTeams && !room.users[userId]) {
      socket.emit('error-msg', `Room full hai! Max ${room.maxTeams} Teams allowed.`);
      return;
    }

    room.users[userId] = {
      userId,
      socketId: socket.id,
      teamKey,
      teamName,
      logo,
      purse: 1500,
      squad: [],
      playing11: [],
      overseasCount: 0
    };

    socket.userId = userId;
    socket.roomCode = roomCode;
    socket.join(roomCode);

    socket.emit('room-joined', {
      roomCode,
      user: room.users[userId],
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

  // Submit Wishlist for Accelerated Round
  socket.on('submit-wishlist', ({ selectedPlayerNames }) => {
    const room = rooms[socket.roomCode];
    if (!room || room.status !== "WISHLIST_SUBMISSION") return;

    room.submittedWishlists[socket.userId] = selectedPlayerNames || [];

    const totalTeams = Object.keys(room.users).length;
    const submittedCount = Object.keys(room.submittedWishlists).length;

    io.to(socket.roomCode).emit('wishlist-progress', { submittedCount, totalTeams });

    if (submittedCount >= totalTeams) {
      // Merge all wishlists uniquely
      const requestedNames = new Set();
      Object.values(room.submittedWishlists).forEach(list => list.forEach(name => requestedNames.add(name)));

      let acceleratedPool = room.availableForWishlist.filter(p => requestedNames.has(p.name));
      if (acceleratedPool.length === 0) {
        acceleratedPool = room.availableForWishlist.slice(0, 30);
      }

      room.currentPool = shuffleArray(acceleratedPool);
      room.currentIndex = 0;
      room.isAccelerated = true;
      room.round = 2;
      room.status = "BIDDING";

      io.to(socket.roomCode).emit('accelerated-round-start', {
        total: room.currentPool.length,
        round: 2
      });

      setTimeout(() => nextPlayer(socket.roomCode), 2000);
    }
  });

  // Bidding
  socket.on('place-bid', () => {
    const room = rooms[socket.roomCode];
    if (!room || room.status !== "BIDDING") return;

    const user = room.users[socket.userId];
    const player = room.currentPool[room.currentIndex];
    if (!user || !player) return;

    if (user.squad.length >= 16) {
      socket.emit('error-msg', 'Aapka Squad full ho chuka hai (16/16)!');
      return;
    }

    if (player.isOverseas && user.overseasCount >= 6) {
      socket.emit('error-msg', 'Overseas limit reached (Max 6 Overseas allowed)!');
      return;
    }

    let increment = (room.currentBid >= 100) ? 10 : 5;
    const nextBid = room.highestBidder ? room.currentBid + increment : room.currentBid;

    if (user.purse < nextBid) {
      socket.emit('error-msg', 'Purse Balance insufficient!');
      return;
    }

    if (room.highestBidder === socket.userId) {
      socket.emit('error-msg', 'Aap pehle se highest bidder hain!');
      return;
    }

    room.currentBid = nextBid;
    room.highestBidder = socket.userId;
    io.to(socket.roomCode).emit('bid-placed', {
      currentBid: room.currentBid,
      highestBidder: user.teamName,
      logo: user.logo
    });

    startTimer(socket.roomCode);
  });

  // Host Actions
  socket.on('host-action-sold', () => {
    const room = rooms[socket.roomCode];
    if (!room || room.hostUserId !== socket.userId || room.status !== "BIDDING") return;
    finalizePlayer(socket.roomCode);
  });

  socket.on('host-action-unsold', () => {
    const room = rooms[socket.roomCode];
    if (!room || room.hostUserId !== socket.userId || room.status !== "BIDDING") return;

    clearInterval(room.timerInterval);
    const player = room.currentPool[room.currentIndex];
    room.unsoldPool.push(player);
    io.to(socket.roomCode).emit('player-unsold', { player });

    room.currentIndex++;
    setTimeout(() => nextPlayer(socket.roomCode), 1500);
  });

  // Tournament
  socket.on('submit-playing-11', ({ playing11 }) => {
    const room = rooms[socket.roomCode];
    if (!room) return;

    const user = room.users[socket.userId];
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

  // Chat
  socket.on('send-chat', ({ message }) => {
    const room = rooms[socket.roomCode];
    if (!room || !message.trim()) return;

    const user = room.users[socket.userId];
    if (user) {
      io.to(socket.roomCode).emit('new-chat-message', {
        sender: user.teamName,
        logo: user.logo,
        message: message.trim()
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
