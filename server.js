const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static('public'));

const rooms = {};

// 251 REAL PLAYERS POOL
const MASTER_PLAYERS = [
  { name: "Smriti Mandhana", role: "Batter", country: "IND", isOverseas: false, basePrice: 50, rating: 94, stats: { mat: 141, runs: 3493, sr: 122.5, wkt: 0 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Smriti_Mandhana_in_2024.jpg/440px-Smriti_Mandhana_in_2024.jpg" },
  { name: "Harmanpreet Kaur", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 50, rating: 92, stats: { mat: 173, runs: 3576, sr: 121.2, wkt: 32 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Harmanpreet_Kaur_2023.jpg/440px-Harmanpreet_Kaur_2023.jpg" },
  { name: "Ellyse Perry", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 50, rating: 96, stats: { mat: 162, runs: 1954, sr: 116.8, wkt: 126 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Ellyse_Perry_2020.jpg/440px-Ellyse_Perry_2020.jpg" },
  { name: "Meg Lanning", role: "Batter", country: "AUS", isOverseas: true, basePrice: 50, rating: 93, stats: { mat: 132, runs: 3405, sr: 116.4, wkt: 0 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Meg_Lanning_2020.jpg/440px-Meg_Lanning_2020.jpg" },
  { name: "Deepti Sharma", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 50, rating: 91, stats: { mat: 117, runs: 1020, sr: 106.3, wkt: 131 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Deepti_Sharma_2020.jpg/440px-Deepti_Sharma_2020.jpg" },
  { name: "Sophie Molineux", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 40, rating: 90, stats: { mat: 38, runs: 210, sr: 108.5, wkt: 47 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Sophie_Molineux_2020.jpg/440px-Sophie_Molineux_2020.jpg" },
  { name: "Shafali Verma", role: "Batter", country: "IND", isOverseas: false, basePrice: 40, rating: 88, stats: { mat: 81, runs: 1948, sr: 129.7, wkt: 10 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Shafali_Verma_2020.jpg/440px-Shafali_Verma_2020.jpg" },
  { name: "Jemimah Rodrigues", role: "Batter", country: "IND", isOverseas: false, basePrice: 40, rating: 89, stats: { mat: 104, runs: 2142, sr: 114.2, wkt: 0 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Jemimah_Rodrigues_2020.jpg/440px-Jemimah_Rodrigues_2020.jpg" },
  { name: "Richa Ghosh", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 40, rating: 88, stats: { mat: 55, runs: 864, sr: 133.4, wkt: 0 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Richa_Ghosh_2020.jpg/440px-Richa_Ghosh_2020.jpg" },
  { name: "Renuka Singh Thakur", role: "Bowler", country: "IND", isOverseas: false, basePrice: 40, rating: 89, stats: { mat: 53, runs: 12, sr: 45.0, wkt: 55 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Renuka_Singh_2022.jpg/440px-Renuka_Singh_2022.jpg" },
  { name: "Sophie Devine", role: "All-Rounder", country: "NZ", isOverseas: true, basePrice: 50, rating: 93, stats: { mat: 135, runs: 3350, sr: 121.7, wkt: 117 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Sophie_Devine_2020.jpg/440px-Sophie_Devine_2020.jpg" },
  { name: "Alyssa Healy", role: "Wicket-Keeper", country: "AUS", isOverseas: true, basePrice: 50, rating: 92, stats: { mat: 159, runs: 3054, sr: 129.9, wkt: 0 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Alyssa_Healy_2020.jpg/440px-Alyssa_Healy_2020.jpg" },
  { name: "Beth Mooney", role: "Batter", country: "AUS", isOverseas: true, basePrice: 50, rating: 94, stats: { mat: 101, runs: 3009, sr: 123.6, wkt: 0 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Beth_Mooney_2020.jpg/440px-Beth_Mooney_2020.jpg" },
  { name: "Nat Sciver-Brunt", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 50, rating: 95, stats: { mat: 126, runs: 2712, sr: 117.8, wkt: 91 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Natalie_Sciver_2020.jpg/440px-Natalie_Sciver_2020.jpg" },
  { name: "Amelia Kerr", role: "All-Rounder", country: "NZ", isOverseas: true, basePrice: 50, rating: 92, stats: { mat: 82, runs: 1300, sr: 108.9, wkt: 90 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Amelia_Kerr_2020.jpg/440px-Amelia_Kerr_2020.jpg" },
  { name: "Ashleigh Gardner", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 50, rating: 94, stats: { mat: 93, runs: 1345, sr: 130.4, wkt: 74 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Ashleigh_Gardner_2020.jpg/440px-Ashleigh_Gardner_2020.jpg" },
  { name: "Marizanne Kapp", role: "All-Rounder", country: "SA", isOverseas: true, basePrice: 50, rating: 93, stats: { mat: 104, runs: 1530, sr: 116.1, wkt: 85 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Marizanne_Kapp_2020.jpg/440px-Marizanne_Kapp_2020.jpg" },
  { name: "Hayley Matthews", role: "All-Rounder", country: "WI", isOverseas: true, basePrice: 50, rating: 93, stats: { mat: 96, runs: 2341, sr: 114.5, wkt: 99 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Hayley_Matthews_2020.jpg/440px-Hayley_Matthews_2020.jpg" },
  { name: "Sophie Ecclestone", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 50, rating: 96, stats: { mat: 86, runs: 230, sr: 112.1, wkt: 126 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Sophie_Ecclestone_2020.jpg/440px-Sophie_Ecclestone_2020.jpg" },
  { name: "Shreyanka Patil", role: "Bowler", country: "IND", isOverseas: false, basePrice: 30, rating: 86, stats: { mat: 15, runs: 45, sr: 115.0, wkt: 19 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Shreyanka_Patil_2023.jpg/440px-Shreyanka_Patil_2023.jpg" },
  { name: "Pooja Vastrakar", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 30, rating: 85, stats: { mat: 68, runs: 350, sr: 122.0, wkt: 58 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Pooja_Vastrakar_2020.jpg/440px-Pooja_Vastrakar_2020.jpg" },
  { name: "Yastika Bhatia", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 30, rating: 84, stats: { mat: 24, runs: 245, sr: 95.0, wkt: 0 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Yastika_Bhatia_2022.jpg/440px-Yastika_Bhatia_2022.jpg" },
  { name: "Alice Capsey", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 40, rating: 87, stats: { mat: 34, runs: 650, sr: 124.0, wkt: 11 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Alice_Capsey_2022.jpg/440px-Alice_Capsey_2022.jpg" },
  { name: "Radha Yadav", role: "Bowler", country: "IND", isOverseas: false, basePrice: 30, rating: 85, stats: { mat: 77, runs: 120, sr: 110.0, wkt: 90 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Radha_Yadav_2020.jpg/440px-Radha_Yadav_2020.jpg" },
  { name: "Tahlia McGrath", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 40, rating: 89, stats: { mat: 47, runs: 960, sr: 133.0, wkt: 17 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Tahlia_McGrath_2020.jpg/440px-Tahlia_McGrath_2020.jpg" },
  { name: "Grace Harris", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 30, rating: 88, stats: { mat: 45, runs: 490, sr: 164.0, wkt: 9 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Grace_Harris_2020.jpg/440px-Grace_Harris_2020.jpg" },
  { name: "Laura Wolvaardt", role: "Batter", country: "SA", isOverseas: true, basePrice: 30, rating: 91, stats: { mat: 76, runs: 1850, sr: 115.0, wkt: 0 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Laura_Wolvaardt_2020.jpg/440px-Laura_Wolvaardt_2020.jpg" },
  { name: "Georgia Wareham", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 30, rating: 87, stats: { mat: 55, runs: 280, sr: 138.0, wkt: 54 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Georgia_Wareham_2020.jpg/440px-Georgia_Wareham_2020.jpg" },
  { name: "Chamari Athapaththu", role: "All-Rounder", country: "SL", isOverseas: true, basePrice: 40, rating: 92, stats: { mat: 140, runs: 3350, sr: 109.0, wkt: 58 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Chamari_Athapaththu_2020.jpg/440px-Chamari_Athapaththu_2020.jpg" },
  { name: "Shabnim Ismail", role: "Bowler", country: "SA", isOverseas: true, basePrice: 50, rating: 92, stats: { mat: 113, runs: 180, sr: 80.0, wkt: 123 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Shabnim_Ismail_2020.jpg/440px-Shabnim_Ismail_2020.jpg" },
  { name: "Annabel Sutherland", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 40, rating: 90, stats: { mat: 39, runs: 320, sr: 140.0, wkt: 36 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Annabel_Sutherland_2020.jpg/440px-Annabel_Sutherland_2020.jpg" }
];

const EXTENDED_NAMES = [
  "Heather Knight", "Danielle Wyatt-Hodge", "Jess Jonassen", "Kate Cross", "Alana King", "Lea Tahuhu", "Suzie Bates", "Shikha Pandey",
  "Rajeshwari Gayakwad", "Titas Sadhu", "Arundhati Reddy", "Amanjot Kaur", "Sneh Rana", "Harleen Deol", "Saika Ishaque", "Asha Sobhana",
  "Sajeevan Sajana", "Dayalan Hemalatha", "Kashvee Gautam", "Vrindha Dinesh", "Minnu Mani", "Ekta Bisht", "Poonam Yadav", "Kiran Navgire",
  "Anjali Sarvani", "Shweta Sehrawat", "Tanuja Kanwar", "Meghna Singh", "Lauren Bell", "Amy Jones", "Tahlia Wilson", "Nadine de Klerk",
  "Chloe Tryon", "Tazmin Brits", "Ayabonga Khaka", "Suné Luus", "Nonkululeko Mlaba", "Laura Harris", "Kim Garth", "Megan Schutt",
  "Phoebe Litchfield", "Kathryn Bryce", "Sarah Glenn", "Freya Kemp", "Issy Wong", "Maia Bouchier", "Lauren Filer", "Bess Heath",
  "Mady Villiers", "Eden Carson", "Fran Jonas", "Jess Kerr", "Hannah Rowe", "Maddy Green", "Brooke Halliday", "Isabella Gaze",
  "Molly Penfold", "Georgia Plimmer", "Stafanie Taylor", "Shemaine Campbelle", "Chinelle Henry", "Shamilia Connell", "Afy Fletcher",
  "Karishma Ramharack", "Aaliyah Alleyne", "Rashada Williams", "Qiana Joseph", "Harshitha Samarawickrama", "Vishmi Gunaratne",
  "Nilakshi de Silva", "Kavisha Dilhari", "Inoka Ranaweera", "Sugandika Kumari", "Udeshika Prabodhani", "Anushka Sanjeewani",
  "Nigar Sultana", "Nahida Akter", "Fargana Hoque", "Ritu Moni", "Shorna Akter", "Marufa Akter", "Rabeya Khan", "Fahima Khatun",
  "Devika Vaidya", "Sabbhineni Meghana", "Priya Punia", "Simran Bahadur", "Parshavi Chopra", "Mannat Kashyap", "G Trisha",
  "Shabnam Shakil", "Monica Patel", "Jintimani Kalita", "Priyanka Bala", "Humairaa Kaazi", "Aparna Mondal", "S Yashasri",
  "Laxmi Yadav", "Simran Shaikh", "Gouher Sultana", "Disha Kasat", "Indrani Roy", "Tarannum Pathan", "Poonam Khemnar",
  "Sneha Deepthi", "Komal Zanzad", "Pratika Rawal", "Rashi Kanojiya", "Anusha Bareddy", "Uma Chetry", "Bharti Fulmali",
  "Shivali Shinde", "Nuzhat Parween", "Tejal Hasabnis", "Sayali Satghare", "Priya Mishra", "Soniya Mendhiya", "Hurley Gala",
  "Grace Scrivens", "Alice Davidson-Richards", "Tash Farrant", "Katie Levick", "Georgia Elwiss", "Linsey Smith", "Paige Scholfield",
  "Ryana MacDonald-Gay", "Charis Pavely", "Seren Smale", "Davina Perrin", "Courtney Webb", "Nicola Carey", "Sammy-Jo Johnson",
  "Maitlan Brown", "Tess Flintoff", "Heather Graham", "Stella Campbell", "Charli Knott", "Georgia Voll", "Katie Mack",
  "Bridget Patterson", "Anesu Mushangwe", "Sarah Bryce", "Priyanaz Chatterji", "Abtaha Maqsood", "Sterre Kalis", "Iris Zwilling",
  "Babette de Leede", "Gaby Lewis", "Orla Prendergast", "Arlene Kelly", "Laura Delany", "Amy Hunter", "Cara Murray",
  "Fatima Sana", "Nida Dar", "Aliya Riaz", "Muneeba Ali", "Diana Baig", "Nashra Sandhu", "Sidra Ameen", "Sadia Iqbal",
  "Tuba Hassan", "Omaima Sohail", "Ghulam Fatima", "Gargi Banerji", "Rashi Kashyap", "Mamatha Maben", "Shweta Jadhav",
  "Kajal Verma", "Nandini Kashyap", "Chitra Singh", "Pooja Nimavat", "Dhara Gujjar", "Hrishita Basu", "Soumya Tiwari",
  "Archana Devi", "Falak Naz", "Sonam Yadav", "Najla CMC", "Kirti James", "Divya Gnanananda", "Prathyusha Challuru",
  "Sahana Pawar", "Rupali Patel", "Priyanka Garkhede", "Aaditi Surve", "Shanu Sen", "Tanu Shree", "Monalisha Rout",
  "Rima Laxmi Ekka", "Kajal Jena", "Sushree Dibyadarshini", "Rasanara Parwin", "Neetu David", "Nuzhat Siddiqui", "Shubha Satheesh",
  "Gautami Naik", "Veda Krishnamurthy", "Ekta Kaundal", "Chitra Jamwal", "Jyoti Chouhan", "Sunita Anand", "Shilpa Sahu",
  "Shivani Singh", "Soni Yadav", "Simran Dil Bahadur", "Ananya Upendran", "Niki Prasad", "Ragini Yadav", "Kashish Verma",
  "Kavita Patil", "Vaishnavi Sharma", "Neha Chavda", "Yashasvi Katta", "Ananya Goel", "Tanushree Sarkar", "Prativa Rana",
  "Mamta Kanojia", "Komalpreet Kaur", "Sana Mir", "Ayesha Naseem", "Kainat Imtiaz", "Javeria Khan", "Anam Amin",
  "Mahika Gaur", "Hollie Armitage", "Sophia Dunkley", "Emily Arlott", "Emma Lamb", "Rachel Priest", "Katey Martin", "Morna Nielsen"
];

const rolesList = ["Batter", "Bowler", "All-Rounder", "Wicket-Keeper"];
for (let i = 0; MASTER_PLAYERS.length < 251; i++) {
  const name = EXTENDED_NAMES[i] || `WPL Star ${i + 1}`;
  const isBat = i % 4 === 0;
  const isBowl = i % 4 === 1;
  MASTER_PLAYERS.push({
    name,
    role: rolesList[i % 4],
    country: i % 3 === 0 ? "AUS" : (i % 5 === 0 ? "ENG" : "IND"),
    isOverseas: i % 3 === 0 || i % 5 === 0,
    basePrice: 10 + ((i % 3) * 10),
    rating: 75 + (i % 12),
    stats: {
      mat: 20 + (i % 30),
      runs: isBat ? 380 + (i * 4) : 70 + i,
      sr: isBat ? 112.5 : 92.0,
      wkt: isBowl ? 22 + (i % 15) : (i % 4 === 2 ? 8 : 0)
    },
    img: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1c243f&color=f39c12&size=150`
  });
}

function calculateIncrement(currentBid) {
  if (currentBid < 50) return 5;
  if (currentBid < 100) return 10;
  return 20; // Official WPL Crores increment
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
  if (!room || Math.random() > 0.4) return;

  const player = room.currentPool[room.currentIndex];
  const aiBots = Object.values(room.users).filter(u => u.isAI);

  for (const bot of aiBots) {
    if (bot.squad.length < 16 && (!player.isOverseas || bot.overseasCount < 6)) {
      const increment = calculateIncrement(room.currentBid);
      const nextBid = room.highestBidder ? room.currentBid + increment : room.currentBid;

      if (bot.purse >= nextBid && nextBid <= (player.rating * 4.2) && room.highestBidder !== bot.id) {
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
  setTimeout(() => nextPlayer(roomCode), 2000);
}

function nextPlayer(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  const users = Object.values(room.users);
  if (users.length > 0 && users.every(u => u.squad.length >= 16)) {
    endAuction(roomCode);
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
    if (rooms[roomCode]) return socket.emit('error-msg', 'Room code already exists!');

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

    if (isSolo) {
      const aiTeams = [
        { key: "MI", name: "Mumbai Indians", logo: "🌀" },
        { key: "DC", name: "Delhi Capitals", logo: "🐯" },
        { key: "UPW", name: "UP Warriorz", logo: "⚔️" },
        { key: "GG", name: "Gujarat Giants", logo: "⚡" }
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
    if (!room) return socket.emit('error-msg', 'Room not found!');
    if (Object.keys(room.users).length >= room.maxTeams) return socket.emit('error-msg', 'Room full!');

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

    if (user.squad.length >= 16) return socket.emit('error-msg', 'Squad limit (16) reached!');
    if (player.isOverseas && user.overseasCount >= 6) return socket.emit('error-msg', 'Max 6 Overseas allowed!');

    const increment = calculateIncrement(room.currentBid);
    const nextBid = room.highestBidder ? room.currentBid + increment : room.currentBid;

    if (user.purse < nextBid) return socket.emit('error-msg', 'Purse balance insufficient!');
    if (room.highestBidder === socket.id) return socket.emit('error-msg', 'You are already the highest bidder!');

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
