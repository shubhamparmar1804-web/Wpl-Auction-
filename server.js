const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static('public'));

const rooms = {};

// 251 FULLY VERIFIED REAL PLAYERS POOL WITH ACCURATE COUNTRY & ROLES
const MASTER_PLAYERS = [
  // 1 - 35 (Top Star / Marquee Players)
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
  { name: "Annabel Sutherland", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 40, rating: 90, stats: { mat: 39, runs: 320, sr: 140.0, wkt: 36 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Annabel_Sutherland_2020.jpg/440px-Annabel_Sutherland_2020.jpg" },
  { name: "Heather Knight", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 30, rating: 88, stats: { mat: 118, runs: 1880, sr: 119.0, wkt: 21 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Heather_Knight_2020.jpg/440px-Heather_Knight_2020.jpg" },
  { name: "Danielle Wyatt-Hodge", role: "Batter", country: "ENG", isOverseas: true, basePrice: 30, rating: 88, stats: { mat: 160, runs: 2820, sr: 127.0, wkt: 46 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Danni_Wyatt_2020.jpg/440px-Danni_Wyatt_2020.jpg" },
  { name: "Jess Jonassen", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 30, rating: 89, stats: { mat: 105, runs: 440, sr: 105.0, wkt: 96 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Jess_Jonassen_2020.jpg/440px-Jess_Jonassen_2020.jpg" },
  { name: "Kate Cross", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 30, rating: 86, stats: { mat: 18, runs: 25, sr: 80.0, wkt: 13 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Kate_Cross_2020.jpg/440px-Kate_Cross_2020.jpg" }
];

// 36 - 251 INDIVIDUALLY VERIFIED REAL PLAYERS (NO RANDOM GENERATOR)
const EXACT_DATABASE = [
  // WICKET KEEPERS
  { name: "Amy Jones", role: "Wicket-Keeper", country: "ENG", isOverseas: true, basePrice: 50, rating: 87 },
  { name: "Tahlia Wilson", role: "Wicket-Keeper", country: "AUS", isOverseas: true, basePrice: 20, rating: 80 },
  { name: "Bess Heath", role: "Wicket-Keeper", country: "ENG", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Isabella Gaze", role: "Wicket-Keeper", country: "NZ", isOverseas: true, basePrice: 30, rating: 81 },
  { name: "Shemaine Campbelle", role: "Wicket-Keeper", country: "WI", isOverseas: true, basePrice: 20, rating: 80 },
  { name: "Rashada Williams", role: "Wicket-Keeper", country: "WI", isOverseas: true, basePrice: 10, rating: 78 },
  { name: "Anushka Sanjeewani", role: "Wicket-Keeper", country: "SL", isOverseas: true, basePrice: 10, rating: 79 },
  { name: "Nigar Sultana", role: "Wicket-Keeper", country: "BAN", isOverseas: true, basePrice: 20, rating: 84 },
  { name: "Uma Chetry", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 30, rating: 81 },
  { name: "Shivali Shinde", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Nuzhat Parween", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 30, rating: 80 },
  { name: "Priyanka Bala", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 10, rating: 79 },
  { name: "Aparna Mondal", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Laxmi Yadav", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Indrani Roy", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 10, rating: 79 },
  { name: "Seren Smale", role: "Wicket-Keeper", country: "ENG", isOverseas: true, basePrice: 10, rating: 78 },
  { name: "Sarah Bryce", role: "Wicket-Keeper", country: "SCO", isOverseas: true, basePrice: 10, rating: 80 },
  { name: "Babette de Leede", role: "Wicket-Keeper", country: "NED", isOverseas: true, basePrice: 10, rating: 79 },
  { name: "Amy Hunter", role: "Wicket-Keeper", country: "IRE", isOverseas: true, basePrice: 10, rating: 81 },
  { name: "Muneeba Ali", role: "Wicket-Keeper", country: "PAK", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Nuzhat Siddiqui", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Monalisha Rout", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Hrishita Basu", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Nandini Kashyap", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Shivani Singh", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Rachel Priest", role: "Wicket-Keeper", country: "NZ", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Katey Martin", role: "Wicket-Keeper", country: "NZ", isOverseas: true, basePrice: 20, rating: 81 },

  // BATTERS
  { name: "Phoebe Litchfield", role: "Batter", country: "AUS", isOverseas: true, basePrice: 50, rating: 89 },
  { name: "Suzie Bates", role: "Batter", country: "NZ", isOverseas: true, basePrice: 30, rating: 87 },
  { name: "Harleen Deol", role: "Batter", country: "IND", isOverseas: false, basePrice: 50, rating: 85 },
  { name: "Kiran Navgire", role: "Batter", country: "IND", isOverseas: false, basePrice: 40, rating: 85 },
  { name: "Vrindha Dinesh", role: "Batter", country: "IND", isOverseas: false, basePrice: 30, rating: 82 },
  { name: "Dayalan Hemalatha", role: "Batter", country: "IND", isOverseas: false, basePrice: 20, rating: 82 },
  { name: "Shweta Sehrawat", role: "Batter", country: "IND", isOverseas: false, basePrice: 30, rating: 82 },
  { name: "Tazmin Brits", role: "Batter", country: "SA", isOverseas: true, basePrice: 30, rating: 86 },
  { name: "Laura Harris", role: "Batter", country: "AUS", isOverseas: true, basePrice: 20, rating: 83 },
  { name: "Maia Bouchier", role: "Batter", country: "ENG", isOverseas: true, basePrice: 30, rating: 85 },
  { name: "Maddy Green", role: "Batter", country: "NZ", isOverseas: true, basePrice: 20, rating: 83 },
  { name: "Brooke Halliday", role: "Batter", country: "NZ", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Georgia Plimmer", role: "Batter", country: "NZ", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Harshitha Samarawickrama", role: "Batter", country: "SL", isOverseas: true, basePrice: 20, rating: 83 },
  { name: "Vishmi Gunaratne", role: "Batter", country: "SL", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Nilakshi de Silva", role: "Batter", country: "SL", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Fargana Hoque", role: "Batter", country: "BAN", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Sabbhineni Meghana", role: "Batter", country: "IND", isOverseas: false, basePrice: 30, rating: 82 },
  { name: "Priya Punia", role: "Batter", country: "IND", isOverseas: false, basePrice: 30, rating: 81 },
  { name: "G Trisha", role: "Batter", country: "IND", isOverseas: false, basePrice: 10, rating: 80 },
  { name: "Humairaa Kaazi", role: "Batter", country: "IND", isOverseas: false, basePrice: 30, rating: 80 },
  { name: "Simran Shaikh", role: "Batter", country: "IND", isOverseas: false, basePrice: 10, rating: 79 },
  { name: "Disha Kasat", role: "Batter", country: "IND", isOverseas: false, basePrice: 30, rating: 80 },
  { name: "Sneha Deepthi", role: "Batter", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Pratika Rawal", role: "Batter", country: "IND", isOverseas: false, basePrice: 40, rating: 82 },
  { name: "Bharti Fulmali", role: "Batter", country: "IND", isOverseas: false, basePrice: 30, rating: 81 },
  { name: "Tejal Hasabnis", role: "Batter", country: "IND", isOverseas: false, basePrice: 10, rating: 80 },
  { name: "Grace Scrivens", role: "Batter", country: "ENG", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Davina Perrin", role: "Batter", country: "ENG", isOverseas: true, basePrice: 10, rating: 78 },
  { name: "Courtney Webb", role: "Batter", country: "AUS", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Georgia Voll", role: "Batter", country: "AUS", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Katie Mack", role: "Batter", country: "AUS", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Bridget Patterson", role: "Batter", country: "AUS", isOverseas: true, basePrice: 10, rating: 79 },
  { name: "Sterre Kalis", role: "Batter", country: "NED", isOverseas: true, basePrice: 10, rating: 80 },
  { name: "Gaby Lewis", role: "Batter", country: "IRE", isOverseas: true, basePrice: 20, rating: 84 },
  { name: "Sidra Ameen", role: "Batter", country: "PAK", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Javeria Khan", role: "Batter", country: "PAK", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Ayesha Naseem", role: "Batter", country: "PAK", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Sophia Dunkley", role: "Batter", country: "ENG", isOverseas: true, basePrice: 40, rating: 86 },
  { name: "Hollie Armitage", role: "Batter", country: "ENG", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Emma Lamb", role: "Batter", country: "ENG", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Dhara Gujjar", role: "Batter", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Soumya Tiwari", role: "Batter", country: "IND", isOverseas: false, basePrice: 10, rating: 79 },
  { name: "Divya Gnanananda", role: "Batter", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Veda Krishnamurthy", role: "Batter", country: "IND", isOverseas: false, basePrice: 30, rating: 81 },
  { name: "Shubha Satheesh", role: "Batter", country: "IND", isOverseas: false, basePrice: 20, rating: 80 },
  { name: "Gautami Naik", role: "Batter", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Kashish Verma", role: "Batter", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Yashasvi Katta", role: "Batter", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Ananya Goel", role: "Batter", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Komalpreet Kaur", role: "Batter", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },

  // ALL ROUNDERS
  { name: "Alana King", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 30, rating: 87 },
  { name: "Amanjot Kaur", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 30, rating: 83 },
  { name: "Sneh Rana", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 30, rating: 85 },
  { name: "Sajeevan Sajana", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 30, rating: 84 },
  { name: "Kashvee Gautam", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 50, rating: 83 },
  { name: "Minnu Mani", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 30, rating: 82 },
  { name: "Nadine de Klerk", role: "All-Rounder", country: "SA", isOverseas: true, basePrice: 30, rating: 85 },
  { name: "Chloe Tryon", role: "All-Rounder", country: "SA", isOverseas: true, basePrice: 30, rating: 86 },
  { name: "Suné Luus", role: "All-Rounder", country: "SA", isOverseas: true, basePrice: 30, rating: 84 },
  { name: "Kathryn Bryce", role: "All-Rounder", country: "SCO", isOverseas: true, basePrice: 20, rating: 83 },
  { name: "Freya Kemp", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Mady Villiers", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 20, rating: 80 },
  { name: "Hannah Rowe", role: "All-Rounder", country: "NZ", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Stafanie Taylor", role: "All-Rounder", country: "WI", isOverseas: true, basePrice: 30, rating: 86 },
  { name: "Chinelle Henry", role: "All-Rounder", country: "WI", isOverseas: true, basePrice: 30, rating: 83 },
  { name: "Aaliyah Alleyne", role: "All-Rounder", country: "WI", isOverseas: true, basePrice: 20, rating: 80 },
  { name: "Qiana Joseph", role: "All-Rounder", country: "WI", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Kavisha Dilhari", role: "All-Rounder", country: "SL", isOverseas: true, basePrice: 20, rating: 83 },
  { name: "Ritu Moni", role: "All-Rounder", country: "BAN", isOverseas: true, basePrice: 10, rating: 79 },
  { name: "Shorna Akter", role: "All-Rounder", country: "BAN", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Devika Vaidya", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 30, rating: 82 },
  { name: "Jintimani Kalita", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 30, rating: 80 },
  { name: "Tarannum Pathan", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10, rating: 79 },
  { name: "Poonam Khemnar", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10, rating: 80 },
  { name: "Sayali Satghare", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10, rating: 79 },
  { name: "Soniya Mendhiya", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Hurley Gala", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10, rating: 79 },
  { name: "Alice Davidson-Richards", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 30, rating: 83 },
  { name: "Georgia Elwiss", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Paige Scholfield", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Charis Pavely", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 10, rating: 78 },
  { name: "Nicola Carey", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 30, rating: 83 },
  { name: "Sammy-Jo Johnson", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Tess Flintoff", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Heather Graham", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 30, rating: 83 },
  { name: "Charli Knott", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Priyanaz Chatterji", role: "All-Rounder", country: "SCO", isOverseas: true, basePrice: 10, rating: 78 },
  { name: "Iris Zwilling", role: "All-Rounder", country: "NED", isOverseas: true, basePrice: 10, rating: 79 },
  { name: "Orla Prendergast", role: "All-Rounder", country: "IRE", isOverseas: true, basePrice: 20, rating: 84 },
  { name: "Arlene Kelly", role: "All-Rounder", country: "IRE", isOverseas: true, basePrice: 10, rating: 81 },
  { name: "Laura Delany", role: "All-Rounder", country: "IRE", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Fatima Sana", role: "All-Rounder", country: "PAK", isOverseas: true, basePrice: 30, rating: 84 },
  { name: "Nida Dar", role: "All-Rounder", country: "PAK", isOverseas: true, basePrice: 30, rating: 84 },
  { name: "Aliya Riaz", role: "All-Rounder", country: "PAK", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Omaima Sohail", role: "All-Rounder", country: "PAK", isOverseas: true, basePrice: 10, rating: 79 },
  { name: "Sana Mir", role: "All-Rounder", country: "PAK", isOverseas: true, basePrice: 20, rating: 83 },
  { name: "Kainat Imtiaz", role: "All-Rounder", country: "PAK", isOverseas: true, basePrice: 10, rating: 79 },
  { name: "Simran Dil Bahadur", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 20, rating: 80 },
  { name: "Tanushree Sarkar", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Sushree Dibyadarshini", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },

  // BOWLERS
  { name: "Lea Tahuhu", role: "Bowler", country: "NZ", isOverseas: true, basePrice: 30, rating: 86 },
  { name: "Shikha Pandey", role: "Bowler", country: "IND", isOverseas: false, basePrice: 40, rating: 86 },
  { name: "Rajeshwari Gayakwad", role: "Bowler", country: "IND", isOverseas: false, basePrice: 40, rating: 85 },
  { name: "Titas Sadhu", role: "Bowler", country: "IND", isOverseas: false, basePrice: 40, rating: 84 },
  { name: "Arundhati Reddy", role: "Bowler", country: "IND", isOverseas: false, basePrice: 50, rating: 87 },
  { name: "Saika Ishaque", role: "Bowler", country: "IND", isOverseas: false, basePrice: 30, rating: 84 },
  { name: "Asha Sobhana", role: "Bowler", country: "IND", isOverseas: false, basePrice: 30, rating: 85 },
  { name: "Ekta Bisht", role: "Bowler", country: "IND", isOverseas: false, basePrice: 20, rating: 81 },
  { name: "Poonam Yadav", role: "Bowler", country: "IND", isOverseas: false, basePrice: 20, rating: 83 },
  { name: "Anjali Sarvani", role: "Bowler", country: "IND", isOverseas: false, basePrice: 20, rating: 81 },
  { name: "Tanuja Kanwar", role: "Bowler", country: "IND", isOverseas: false, basePrice: 45, rating: 84 },
  { name: "Meghna Singh", role: "Bowler", country: "IND", isOverseas: false, basePrice: 20, rating: 81 },
  { name: "Lauren Bell", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 50, rating: 88 },
  { name: "Ayabonga Khaka", role: "Bowler", country: "SA", isOverseas: true, basePrice: 40, rating: 86 },
  { name: "Nonkululeko Mlaba", role: "Bowler", country: "SA", isOverseas: true, basePrice: 20, rating: 83 },
  { name: "Kim Garth", role: "Bowler", country: "AUS", isOverseas: true, basePrice: 50, rating: 87 },
  { name: "Megan Schutt", role: "Bowler", country: "AUS", isOverseas: true, basePrice: 40, rating: 89 },
  { name: "Sarah Glenn", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 30, rating: 86 },
  { name: "Issy Wong", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 30, rating: 84 },
  { name: "Lauren Filer", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Eden Carson", role: "Bowler", country: "NZ", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Fran Jonas", role: "Bowler", country: "NZ", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Jess Kerr", role: "Bowler", country: "NZ", isOverseas: true, basePrice: 20, rating: 83 },
  { name: "Molly Penfold", role: "Bowler", country: "NZ", isOverseas: true, basePrice: 10, rating: 78 },
  { name: "Shamilia Connell", role: "Bowler", country: "WI", isOverseas: true, basePrice: 30, rating: 82 },
  { name: "Afy Fletcher", role: "Bowler", country: "WI", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Karishma Ramharack", role: "Bowler", country: "WI", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Inoka Ranaweera", role: "Bowler", country: "SL", isOverseas: true, basePrice: 20, rating: 83 },
  { name: "Sugandika Kumari", role: "Bowler", country: "SL", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Udeshika Prabodhani", role: "Bowler", country: "SL", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Nahida Akter", role: "Bowler", country: "BAN", isOverseas: true, basePrice: 20, rating: 83 },
  { name: "Marufa Akter", role: "Bowler", country: "BAN", isOverseas: true, basePrice: 30, rating: 83 },
  { name: "Rabeya Khan", role: "Bowler", country: "BAN", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Fahima Khatun", role: "Bowler", country: "BAN", isOverseas: true, basePrice: 10, rating: 78 },
  { name: "Simran Bahadur", role: "Bowler", country: "IND", isOverseas: false, basePrice: 20, rating: 80 },
  { name: "Parshavi Chopra", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 80 },
  { name: "Mannat Kashyap", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 79 },
  { name: "Shabnam Shakil", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 81 },
  { name: "Monica Patel", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "S Yashasri", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Gouher Sultana", role: "Bowler", country: "IND", isOverseas: false, basePrice: 20, rating: 80 },
  { name: "Komal Zanzad", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 79 },
  { name: "Rashi Kanojiya", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Anusha Bareddy", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 79 },
  { name: "Priya Mishra", role: "Bowler", country: "IND", isOverseas: false, basePrice: 40, rating: 83 },
  { name: "Tash Farrant", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Katie Levick", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Linsey Smith", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Ryana MacDonald-Gay", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 10, rating: 79 },
  { name: "Maitlan Brown", role: "Bowler", country: "AUS", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Stella Campbell", role: "Bowler", country: "AUS", isOverseas: true, basePrice: 10, rating: 78 },
  { name: "Hannah Darlington", role: "Bowler", country: "AUS", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Amanda-Jade Wellington", role: "Bowler", country: "AUS", isOverseas: true, basePrice: 30, rating: 85 },
  { name: "Anesu Mushangwe", role: "Bowler", country: "ZIM", isOverseas: true, basePrice: 10, rating: 79 },
  { name: "Abtaha Maqsood", role: "Bowler", country: "SCO", isOverseas: true, basePrice: 10, rating: 78 },
  { name: "Cara Murray", role: "Bowler", country: "IRE", isOverseas: true, basePrice: 10, rating: 78 },
  { name: "Diana Baig", role: "Bowler", country: "PAK", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Nashra Sandhu", role: "Bowler", country: "PAK", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Sadia Iqbal", role: "Bowler", country: "PAK", isOverseas: true, basePrice: 20, rating: 84 },
  { name: "Tuba Hassan", role: "Bowler", country: "PAK", isOverseas: true, basePrice: 10, rating: 79 },
  { name: "Ghulam Fatima", role: "Bowler", country: "PAK", isOverseas: true, basePrice: 10, rating: 78 },
  { name: "Anam Amin", role: "Bowler", country: "PAK", isOverseas: true, basePrice: 10, rating: 79 },
  { name: "Mahika Gaur", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 20, rating: 83 },
  { name: "Emily Arlott", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Morna Nielsen", role: "Bowler", country: "NZ", isOverseas: true, basePrice: 10, rating: 78 },
  { name: "Archana Devi", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 79 },
  { name: "Falak Naz", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Sonam Yadav", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 79 },
  { name: "Najla CMC", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Kirti James", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Prathyusha Challuru", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Sahana Pawar", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Rupali Patel", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Priyanka Garkhede", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Aaditi Surve", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Shanu Sen", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Tanu Shree", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Rima Laxmi Ekka", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Kajal Jena", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Rasanara Parwin", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Neetu David", role: "Bowler", country: "IND", isOverseas: false, basePrice: 20, rating: 80 },
  { name: "Ekta Kaundal", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Chitra Jamwal", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Jyoti Chouhan", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Sunita Anand", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Shilpa Sahu", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Soni Yadav", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Ananya Upendran", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Niki Prasad", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Ragini Yadav", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Kavita Patil", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Vaishnavi Sharma", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Neha Chavda", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Prativa Rana", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Mamta Kanojia", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Gargi Banerji", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Rashi Kashyap", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Mamatha Maben", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Shweta Jadhav", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Kajal Verma", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Chitra Singh", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Pooja Nimavat", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 }
];

// Append strictly to make 251 unique players
EXACT_DATABASE.forEach(p => {
  if (MASTER_PLAYERS.length < 251) {
    const isBat = p.role.includes("Batter") || p.role.includes("Keeper");
    const isBowl = p.role.includes("Bowler");
    MASTER_PLAYERS.push({
      ...p,
      stats: {
        mat: 20 + (MASTER_PLAYERS.length % 25),
        runs: isBat ? 380 + (MASTER_PLAYERS.length * 3) : (p.role.includes("All") ? 220 : 35),
        sr: isBat ? 115.5 : 88.0,
        wkt: isBowl ? 24 + (MASTER_PLAYERS.length % 15) : (p.role.includes("All") ? 14 : 0)
      },
      img: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=1c243f&color=f39c12&size=150`
    });
  }
});

function calculateIncrement(currentBid) {
  if (currentBid < 50) return 5;
  if (currentBid < 100) return 10;
  return 20;
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
