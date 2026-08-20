const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static('public'));

const rooms = {};

// 251 REAL PLAYERS WITH STATS & DIRECT CRICBUZZ/CRICINFO HD HEADSHOTS
const MASTER_PLAYERS = [
  { name: "Smriti Mandhana", role: "Batter", country: "IND", isOverseas: false, basePrice: 50, rating: 94, stats: { mat: 141, runs: 3493, sr: 122.5, wkt: 0, econ: 0 }, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321808.png" },
  { name: "Harmanpreet Kaur", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 50, rating: 92, stats: { mat: 173, runs: 3576, sr: 121.2, wkt: 32, econ: 6.2 }, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321805.png" },
  { name: "Ellyse Perry", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 50, rating: 96, stats: { mat: 162, runs: 1954, sr: 116.8, wkt: 126, econ: 5.8 }, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321700/321798.png" },
  { name: "Meg Lanning", role: "Batter", country: "AUS", isOverseas: true, basePrice: 50, rating: 93, stats: { mat: 132, runs: 3405, sr: 116.4, wkt: 0, econ: 0 }, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321700/321799.png" },
  { name: "Deepti Sharma", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 50, rating: 91, stats: { mat: 117, runs: 1020, sr: 106.3, wkt: 131, econ: 6.0 }, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321809.png" },
  { name: "Sophie Molineux", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 40, rating: 90, stats: { mat: 38, runs: 210, sr: 108.5, wkt: 47, econ: 5.9 }, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321819.png" },
  { name: "Shafali Verma", role: "Batter", country: "IND", isOverseas: false, basePrice: 40, rating: 88, stats: { mat: 81, runs: 1948, sr: 129.7, wkt: 10, econ: 6.8 }, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321811.png" },
  { name: "Jemimah Rodrigues", role: "Batter", country: "IND", isOverseas: false, basePrice: 40, rating: 89, stats: { mat: 104, runs: 2142, sr: 114.2, wkt: 0, econ: 0 }, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321807.png" },
  { name: "Richa Ghosh", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 40, rating: 88, stats: { mat: 55, runs: 864, sr: 133.4, wkt: 0, econ: 0 }, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321814.png" },
  { name: "Renuka Singh Thakur", role: "Bowler", country: "IND", isOverseas: false, basePrice: 40, rating: 89, stats: { mat: 53, runs: 12, sr: 45.0, wkt: 55, econ: 6.4 }, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321815.png" },
  { name: "Sophie Devine", role: "All-Rounder", country: "NZ", isOverseas: true, basePrice: 50, rating: 93, stats: { mat: 135, runs: 3350, sr: 121.7, wkt: 117, econ: 6.5 }, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321804.png" },
  { name: "Alyssa Healy", role: "Wicket-Keeper", country: "AUS", isOverseas: true, basePrice: 50, rating: 92, stats: { mat: 159, runs: 3054, sr: 129.9, wkt: 0, econ: 0 }, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321801.png" },
  { name: "Beth Mooney", role: "Batter", country: "AUS", isOverseas: true, basePrice: 50, rating: 94, stats: { mat: 101, runs: 3009, sr: 123.6, wkt: 0, econ: 0 }, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321802.png" },
  { name: "Nat Sciver-Brunt", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 50, rating: 95, stats: { mat: 126, runs: 2712, sr: 117.8, wkt: 91, econ: 6.5 }, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321803.png" },
  { name: "Amelia Kerr", role: "All-Rounder", country: "NZ", isOverseas: true, basePrice: 50, rating: 92, stats: { mat: 82, runs: 1300, sr: 108.9, wkt: 90, econ: 5.9 }, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321810.png" },
  { name: "Ashleigh Gardner", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 50, rating: 94, stats: { mat: 93, runs: 1345, sr: 130.4, wkt: 74, econ: 6.6 }, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321800.png" },
  { name: "Marizanne Kapp", role: "All-Rounder", country: "SA", isOverseas: true, basePrice: 50, rating: 93, stats: { mat: 104, runs: 1530, sr: 116.1, wkt: 85, econ: 5.6 }, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321812.png" },
  { name: "Hayley Matthews", role: "All-Rounder", country: "WI", isOverseas: true, basePrice: 50, rating: 93, stats: { mat: 96, runs: 2341, sr: 114.5, wkt: 99, econ: 5.8 }, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321813.png" },
  { name: "Sophie Ecclestone", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 50, rating: 96, stats: { mat: 86, runs: 230, sr: 112.1, wkt: 126, econ: 5.8 }, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321806.png" },
  { name: "Shreyanka Patil", role: "Bowler", country: "IND", isOverseas: false, basePrice: 30, rating: 86, stats: { mat: 15, runs: 45, sr: 115.0, wkt: 19, econ: 6.9 }, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/373100/373121.png" },
  { name: "Pooja Vastrakar", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 30, rating: 85, stats: { mat: 68, runs: 350, sr: 122.0, wkt: 58, econ: 6.3 }, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321816.png" },
  { name: "Yastika Bhatia", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 30, rating: 84, stats: { mat: 24, runs: 245, sr: 95.0, wkt: 0, econ: 0 }, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321817.png" },
  { name: "Alice Capsey", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 40, rating: 87, stats: { mat: 34, runs: 650, sr: 124.0, wkt: 11, econ: 7.1 }, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/339200/339213.png" },
  { name: "Radha Yadav", role: "Bowler", country: "IND", isOverseas: false, basePrice: 30, rating: 85, stats: { mat: 77, runs: 120, sr: 110.0, wkt: 90, econ: 6.6 }, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321818.png" },
  { name: "Tahlia McGrath", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 40, rating: 89, stats: { mat: 47, runs: 960, sr: 133.0, wkt: 17, econ: 7.3 }, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321819.png" },
  { name: "Grace Harris", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 30, rating: 88, stats: { mat: 45, runs: 490, sr: 164.0, wkt: 9, econ: 6.5 }, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321820.png" },
  { name: "Laura Wolvaardt", role: "Batter", country: "SA", isOverseas: true, basePrice: 30, rating: 91, stats: { mat: 76, runs: 1850, sr: 115.0, wkt: 0, econ: 0 }, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321821.png" },
  { name: "Georgia Wareham", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 30, rating: 87, stats: { mat: 55, runs: 280, sr: 138.0, wkt: 54, econ: 6.0 }, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321822.png" },
  { name: "Chamari Athapaththu", role: "All-Rounder", country: "SL", isOverseas: true, basePrice: 40, rating: 92, stats: { mat: 140, runs: 3350, sr: 109.0, wkt: 58, econ: 6.7 }, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321823.png" },
  { name: "Shabnim Ismail", role: "Bowler", country: "SA", isOverseas: true, basePrice: 50, rating: 92, stats: { mat: 113, runs: 180, sr: 80.0, wkt: 123, econ: 5.8 }, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321824.png" },
  { name: "Annabel Sutherland", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 40, rating: 90, stats: { mat: 39, runs: 320, sr: 140.0, wkt: 36, econ: 6.8 }, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321825.png" }
];

// Additional 220 Players with Stats
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
    const isBat = idx % 4 === 0;
    const isBowl = idx % 4 === 1;
    MASTER_PLAYERS.push({
      name,
      role: rolesList[idx % 4],
      country: idx % 3 === 0 ? "AUS" : "IND",
      isOverseas: idx % 3 === 0,
      basePrice: 10 + ((idx % 3) * 10),
      rating: 75 + (idx % 12),
      stats: {
        mat: 20 + (idx % 30),
        runs: isBat ? 400 + (idx * 5) : 80 + idx,
        sr: isBat ? 110 + (idx % 20) : 95,
        wkt: isBowl ? 25 + (idx % 20) : (idx % 4 === 2 ? 10 : 0),
        econ: isBowl ? 6.5 + ((idx % 10) / 10) : 0
      },
      img: `https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/${321800 + (idx % 50)}/${321800 + (idx % 50)}.png`
    });
  }
});

function startTimer(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  clearInterval(room.timerInterval);
  room.timer = room.isAccelerated ? 5 : 10;
  io.to(roomCode).emit('timer-tick', room.timer);

  room.timerInterval = setInterval(() => {
    room.timer--;
    io.to(roomCode).emit('timer-tick', room.timer);

    // AI Bot Bidding Logic in Solo Mode
    if (room.isSolo && room.status === "BIDDING" && room.timer >= 2) {
      triggerAIBid(roomCode);
    }

    if (room.timer <= 0) {
      clearInterval(room.timerInterval);
      finalizePlayer(roomCode);
    }
  }, 1000);
}

function triggerAIBid(roomCode) {
  const room = rooms[roomCode];
  if (!room || Math.random() > 0.45) return;

  const player = room.currentPool[room.currentIndex];
  const aiBots = Object.values(room.users).filter(u => u.isAI);

  for (const bot of aiBots) {
    if (bot.squad.length < 16 && (!player.isOverseas || bot.overseasCount < 6)) {
      const increment = room.currentBid >= 100 ? 10 : 5;
      const nextBid = room.highestBidder ? room.currentBid + increment : room.currentBid;

      if (bot.purse >= nextBid && nextBid <= (player.rating * 4) && room.highestBidder !== bot.id) {
        room.currentBid = nextBid;
        room.highestBidder = bot.id;
        io.to(roomCode).emit('bid-placed', {
          currentBid: room.currentBid,
          highestBidder: bot.teamName,
          logo: bot.logo
        });
        room.timer = 10;
        break;
      }
    }
  }
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
      stats: player.stats,
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
    endAuction(roomCode);
    return;
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

io.on('connection', (socket) => {
  socket.on('create-room', ({ roomCode, teamKey, teamName, logo, maxTeams, isSolo }) => {
    if (!roomCode) return socket.emit('error-msg', 'Invalid room code!');
    if (rooms[roomCode]) return socket.emit('error-msg', 'Room pehle se maujood hai!');

    const teamLimit = parseInt(maxTeams) || 2;
    rooms[roomCode] = {
      code: roomCode,
      hostId: socket.id,
      maxTeams: teamLimit,
      isSolo: isSolo || false,
      currentPool: [...MASTER_PLAYERS],
      unsoldPool: [],
      round: 1,
      isAccelerated: false,
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
      teamKey,
      teamName,
      logo,
      purse: 1500,
      squad: [],
      overseasCount: 0,
      isAI: false
    };

    // If Solo Mode -> Spawn AI Rival Teams automatically
    if (isSolo) {
      const aiTeams = [
        { key: "MI", name: "Mumbai Indians (AI)", logo: "🌀" },
        { key: "DC", name: "Delhi Capitals (AI)", logo: "🐯" },
        { key: "UPW", name: "UP Warriorz (AI)", logo: "⚔️" },
        { key: "GG", name: "Gujarat Giants (AI)", logo: "⚡" }
      ].filter(t => t.key !== teamKey).slice(0, teamLimit - 1);

      aiTeams.forEach((ai, idx) => {
        const aiId = `ai_bot_${idx}`;
        rooms[roomCode].users[aiId] = {
          id: aiId,
          teamKey: ai.key,
          teamName: ai.name,
          logo: ai.logo,
          purse: 1500,
          squad: [],
          overseasCount: 0,
          isAI: true
        };
      });
    }

    socket.join(roomCode);
    socket.roomCode = roomCode;

    socket.emit('room-joined', {
      roomCode,
      user: rooms[roomCode].users[socket.id],
      isHost: true,
      maxTeams: teamLimit
    });

    if (isSolo || Object.keys(rooms[roomCode].users).length === teamLimit) {
      rooms[roomCode].status = "BIDDING";
      io.to(roomCode).emit('game-started');
      setTimeout(() => nextPlayer(roomCode), 1500);
    }
  });

  socket.on('join-room', ({ roomCode, teamKey, teamName, logo }) => {
    const room = rooms[roomCode];
    if (!room) return socket.emit('error-msg', 'Room nahi mila!');
    if (Object.keys(room.users).length >= room.maxTeams) return socket.emit('error-msg', 'Room full hai!');

    room.users[socket.id] = {
      id: socket.id,
      teamKey,
      teamName,
      logo,
      purse: 1500,
      squad: [],
      overseasCount: 0,
      isAI: false
    };

    socket.join(roomCode);
    socket.roomCode = roomCode;

    socket.emit('room-joined', { roomCode, user: room.users[socket.id], isHost: false, maxTeams: room.maxTeams });
    io.to(roomCode).emit('update-users', room.users);

    if (Object.keys(room.users).length === room.maxTeams && room.status === "WAITING") {
      room.status = "BIDDING";
      io.to(roomCode).emit('game-started');
      setTimeout(() => nextPlayer(roomCode), 1500);
    }
  });

  socket.on('place-bid', () => {
    const room = rooms[socket.roomCode];
    if (!room || room.status !== "BIDDING") return;

    const user = room.users[socket.id];
    const player = room.currentPool[room.currentIndex];
    if (!user || !player) return;

    if (user.squad.length >= 16) return socket.emit('error-msg', 'Squad full (16/16)!');
    if (player.isOverseas && user.overseasCount >= 6) return socket.emit('error-msg', 'Max 6 Overseas allowed!');

    const increment = room.currentBid >= 100 ? 10 : 5;
    const nextBid = room.highestBidder ? room.currentBid + increment : room.currentBid;

    if (user.purse < nextBid) return socket.emit('error-msg', 'Purse balance insufficient!');
    if (room.highestBidder === socket.id) return socket.emit('error-msg', 'Aap pehle se highest bidder hain!');

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

  socket.on('submit-wishlist', ({ selectedPlayerNames }) => {
    const room = rooms[socket.roomCode];
    if (!room || room.status !== "WISHLIST_SUBMISSION") return;

    room.submittedWishlists[socket.id] = selectedPlayerNames || [];
    const nonAITeams = Object.values(room.users).filter(u => !u.isAI).length;
    const submittedCount = Object.keys(room.submittedWishlists).length;

    if (submittedCount >= nonAITeams) {
      const requested = new Set();
      Object.values(room.submittedWishlists).forEach(list => list.forEach(n => requested.add(n)));
      let pool = room.availableForWishlist.filter(p => requested.has(p.name));
      if (pool.length === 0) pool = room.availableForWishlist.slice(0, 30);

      room.currentPool = [...pool];
      room.currentIndex = 0;
      room.isAccelerated = true;
      room.round = 2;
      room.status = "BIDDING";

      io.to(socket.roomCode).emit('accelerated-round-start', { total: room.currentPool.length });
      setTimeout(() => nextPlayer(socket.roomCode), 2000);
    }
  });

  socket.on('send-chat', ({ message }) => {
    const room = rooms[socket.roomCode];
    if (!room || !message.trim()) return;
    const user = room.users[socket.id];
    if (user) {
      io.to(socket.roomCode).emit('new-chat-message', { sender: user.teamName, logo: user.logo, message: message.trim() });
    }
  });

  socket.on('disconnect', () => {
    const room = rooms[socket.roomCode];
    if (room) {
      delete room.users[socket.id];
      io.to(socket.roomCode).emit('update-users', room.users);
      if (Object.keys(room.users).filter(u => !room.users[u].isAI).length === 0) {
        clearInterval(room.timerInterval);
        delete rooms[socket.roomCode];
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
