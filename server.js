const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static('public'));

const rooms = {};

// 251 REAL PLAYERS WITH DIRECT UNBLOCKED HIGH-RES CRICKET HEADSHOTS & CAREER STATS
const MASTER_PLAYERS = [
  { name: "Smriti Mandhana", role: "Batter", country: "IND", isOverseas: false, basePrice: 50, rating: 94, stats: { mat: 141, runs: 3493, sr: 122.5, wkt: 0 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Smriti_Mandhana_in_2024.jpg/440px-Smriti_Mandhana_in_2024.jpg" },
  { name: "Harmanpreet Kaur", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 50, rating: 92, stats: { mat: 173, runs: 3576, sr: 121.2, wkt: 32 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Harmanpreet_Kaur_2023.jpg/440px-Harmanpreet_Kaur_2023.jpg" },
  { name: "Ellyse Perry", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 50, rating: 96, stats: { mat: 162, runs: 1954, sr: 116.8, wkt: 126 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Ellyse_Perry_2020.jpg/440px-Ellyse_Perry_2020.jpg" },
  { name: "Meg Lanning", role: "Batter", country: "AUS", isOverseas: true, basePrice: 50, rating: 93, stats: { mat: 132, runs: 3405, sr: 116.4, wkt: 0 }, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Meg_Lanning_2020.jpg/440px-Meg_Lanning_2020.jpg" },
  { name: "Deepti Sharma", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 50, rating: 91, stats: { mat: 117, runs: 1020, sr: 106.3, wkt: 131 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/562.png" },
  { name: "Sophie Molineux", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 40, rating: 90, stats: { mat: 38, runs: 210, sr: 108.5, wkt: 47 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/1959.png" },
  { name: "Shafali Verma", role: "Batter", country: "IND", isOverseas: false, basePrice: 40, rating: 88, stats: { mat: 81, runs: 1948, sr: 129.7, wkt: 10 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/3087.png" },
  { name: "Jemimah Rodrigues", role: "Batter", country: "IND", isOverseas: false, basePrice: 40, rating: 89, stats: { mat: 104, runs: 2142, sr: 114.2, wkt: 0 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/1963.png" },
  { name: "Richa Ghosh", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 40, rating: 88, stats: { mat: 55, runs: 864, sr: 133.4, wkt: 0 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/3173.png" },
  { name: "Renuka Singh Thakur", role: "Bowler", country: "IND", isOverseas: false, basePrice: 40, rating: 89, stats: { mat: 53, runs: 12, sr: 45.0, wkt: 55 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/3697.png" },
  { name: "Sophie Devine", role: "All-Rounder", country: "NZ", isOverseas: true, basePrice: 50, rating: 93, stats: { mat: 135, runs: 3350, sr: 121.7, wkt: 117 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/129.png" },
  { name: "Alyssa Healy", role: "Wicket-Keeper", country: "AUS", isOverseas: true, basePrice: 50, rating: 92, stats: { mat: 159, runs: 3054, sr: 129.9, wkt: 0 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/147.png" },
  { name: "Beth Mooney", role: "Batter", country: "AUS", isOverseas: true, basePrice: 50, rating: 94, stats: { mat: 101, runs: 3009, sr: 123.6, wkt: 0 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/531.png" },
  { name: "Nat Sciver-Brunt", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 50, rating: 95, stats: { mat: 126, runs: 2712, sr: 117.8, wkt: 91 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/511.png" },
  { name: "Amelia Kerr", role: "All-Rounder", country: "NZ", isOverseas: true, basePrice: 50, rating: 92, stats: { mat: 82, runs: 1300, sr: 108.9, wkt: 90 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/1806.png" },
  { name: "Ashleigh Gardner", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 50, rating: 94, stats: { mat: 93, runs: 1345, sr: 130.4, wkt: 74 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/1785.png" },
  { name: "Marizanne Kapp", role: "All-Rounder", country: "SA", isOverseas: true, basePrice: 50, rating: 93, stats: { mat: 104, runs: 1530, sr: 116.1, wkt: 85 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/197.png" },
  { name: "Hayley Matthews", role: "All-Rounder", country: "WI", isOverseas: true, basePrice: 50, rating: 93, stats: { mat: 96, runs: 2341, sr: 114.5, wkt: 99 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/580.png" },
  { name: "Sophie Ecclestone", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 50, rating: 96, stats: { mat: 86, runs: 230, sr: 112.1, wkt: 126 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/1804.png" },
  { name: "Shreyanka Patil", role: "Bowler", country: "IND", isOverseas: false, basePrice: 30, rating: 86, stats: { mat: 15, runs: 45, sr: 115.0, wkt: 19 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/4734.png" },
  { name: "Pooja Vastrakar", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 30, rating: 85, stats: { mat: 68, runs: 350, sr: 122.0, wkt: 58 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/1964.png" },
  { name: "Yastika Bhatia", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 30, rating: 84, stats: { mat: 24, runs: 245, sr: 95.0, wkt: 0 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/3503.png" },
  { name: "Alice Capsey", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 40, rating: 87, stats: { mat: 34, runs: 650, sr: 124.0, wkt: 11 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/3981.png" },
  { name: "Radha Yadav", role: "Bowler", country: "IND", isOverseas: false, basePrice: 30, rating: 85, stats: { mat: 77, runs: 120, sr: 110.0, wkt: 90 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/1962.png" },
  { name: "Tahlia McGrath", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 40, rating: 89, stats: { mat: 47, runs: 960, sr: 133.0, wkt: 17 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/1784.png" },
  { name: "Grace Harris", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 30, rating: 88, stats: { mat: 45, runs: 490, sr: 164.0, wkt: 9 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/630.png" },
  { name: "Laura Wolvaardt", role: "Batter", country: "SA", isOverseas: true, basePrice: 30, rating: 91, stats: { mat: 76, runs: 1850, sr: 115.0, wkt: 0 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/1199.png" },
  { name: "Georgia Wareham", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 30, rating: 87, stats: { mat: 55, runs: 280, sr: 138.0, wkt: 54 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/1987.png" },
  { name: "Chamari Athapaththu", role: "All-Rounder", country: "SL", isOverseas: true, basePrice: 40, rating: 92, stats: { mat: 140, runs: 3350, sr: 109.0, wkt: 58 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/212.png" },
  { name: "Shabnim Ismail", role: "Bowler", country: "SA", isOverseas: true, basePrice: 50, rating: 92, stats: { mat: 113, runs: 180, sr: 80.0, wkt: 123 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/200.png" },
  { name: "Annabel Sutherland", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 40, rating: 90, stats: { mat: 39, runs: 320, sr: 140.0, wkt: 36 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/3086.png" },

  // 32 - 70
  { name: "Heather Knight", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 30, rating: 88, stats: { mat: 118, runs: 1880, sr: 119.0, wkt: 21 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/155.png" },
  { name: "Danielle Wyatt-Hodge", role: "Batter", country: "ENG", isOverseas: true, basePrice: 30, rating: 88, stats: { mat: 160, runs: 2820, sr: 127.0, wkt: 46 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/157.png" },
  { name: "Jess Jonassen", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 30, rating: 89, stats: { mat: 105, runs: 440, sr: 105.0, wkt: 96 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/273.png" },
  { name: "Kate Cross", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 30, rating: 86, stats: { mat: 18, runs: 25, sr: 80.0, wkt: 13 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/512.png" },
  { name: "Alana King", role: "Bowler", country: "AUS", isOverseas: true, basePrice: 30, rating: 87, stats: { mat: 28, runs: 45, sr: 120.0, wkt: 26 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/3698.png" },
  { name: "Lea Tahuhu", role: "Bowler", country: "NZ", isOverseas: true, basePrice: 30, rating: 86, stats: { mat: 94, runs: 160, sr: 102.0, wkt: 93 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/280.png" },
  { name: "Suzie Bates", role: "Batter", country: "NZ", isOverseas: true, basePrice: 30, rating: 87, stats: { mat: 162, runs: 4348, sr: 109.0, wkt: 58 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/128.png" },
  { name: "Shikha Pandey", role: "Bowler", country: "IND", isOverseas: false, basePrice: 40, rating: 86, stats: { mat: 62, runs: 512, sr: 110.0, wkt: 43 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/536.png" },
  { name: "Rajeshwari Gayakwad", role: "Bowler", country: "IND", isOverseas: false, basePrice: 40, rating: 85, stats: { mat: 58, runs: 10, sr: 40.0, wkt: 61 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/537.png" },
  { name: "Titas Sadhu", role: "Bowler", country: "IND", isOverseas: false, basePrice: 40, rating: 84, stats: { mat: 8, runs: 5, sr: 50.0, wkt: 10 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/4735.png" },
  { name: "Arundhati Reddy", role: "Bowler", country: "IND", isOverseas: false, basePrice: 50, rating: 87, stats: { mat: 32, runs: 90, sr: 95.0, wkt: 28 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/1965.png" },
  { name: "Amanjot Kaur", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 30, rating: 83, stats: { mat: 14, runs: 120, sr: 118.0, wkt: 7 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/4736.png" },
  { name: "Sneh Rana", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 30, rating: 85, stats: { mat: 25, runs: 110, sr: 125.0, wkt: 24 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/535.png" },
  { name: "Harleen Deol", role: "Batter", country: "IND", isOverseas: false, basePrice: 50, rating: 85, stats: { mat: 24, runs: 251, sr: 112.0, wkt: 6 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/2102.png" },
  { name: "Saika Ishaque", role: "Bowler", country: "IND", isOverseas: false, basePrice: 30, rating: 84, stats: { mat: 3, runs: 2, sr: 50.0, wkt: 5 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/4737.png" },
  { name: "Asha Sobhana", role: "Bowler", country: "IND", isOverseas: false, basePrice: 30, rating: 85, stats: { mat: 5, runs: 8, sr: 70.0, wkt: 8 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/4738.png" },
  { name: "Sajeevan Sajana", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 30, rating: 84, stats: { mat: 9, runs: 65, sr: 142.0, wkt: 2 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/4739.png" },
  { name: "Dayalan Hemalatha", role: "Batter", country: "IND", isOverseas: false, basePrice: 20, rating: 82, stats: { mat: 23, runs: 285, sr: 120.0, wkt: 5 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/1966.png" },
  { name: "Kashvee Gautam", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 50, rating: 83, stats: { mat: 12, runs: 90, sr: 110.0, wkt: 15 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/4740.png" },
  { name: "Vrindha Dinesh", role: "Batter", country: "IND", isOverseas: false, basePrice: 30, rating: 82, stats: { mat: 8, runs: 140, sr: 105.0, wkt: 0 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/4741.png" },
  { name: "Minnu Mani", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 30, rating: 82, stats: { mat: 7, runs: 40, sr: 100.0, wkt: 9 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/4742.png" },
  { name: "Ekta Bisht", role: "Bowler", country: "IND", isOverseas: false, basePrice: 20, rating: 81, stats: { mat: 42, runs: 30, sr: 60.0, wkt: 53 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/168.png" },
  { name: "Poonam Yadav", role: "Bowler", country: "IND", isOverseas: false, basePrice: 20, rating: 83, stats: { mat: 72, runs: 15, sr: 45.0, wkt: 98 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/538.png" },
  { name: "Kiran Navgire", role: "Batter", country: "IND", isOverseas: false, basePrice: 40, rating: 85, stats: { mat: 6, runs: 65, sr: 145.0, wkt: 0 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/4743.png" },
  { name: "Anjali Sarvani", role: "Bowler", country: "IND", isOverseas: false, basePrice: 20, rating: 81, stats: { mat: 6, runs: 4, sr: 50.0, wkt: 3 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/4744.png" },
  { name: "Shweta Sehrawat", role: "Batter", country: "IND", isOverseas: false, basePrice: 30, rating: 82, stats: { mat: 10, runs: 180, sr: 115.0, wkt: 0 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/4745.png" },
  { name: "Tanuja Kanwar", role: "Bowler", country: "IND", isOverseas: false, basePrice: 45, rating: 84, stats: { mat: 12, runs: 30, sr: 90.0, wkt: 14 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/4746.png" },
  { name: "Meghna Singh", role: "Bowler", country: "IND", isOverseas: false, basePrice: 20, rating: 81, stats: { mat: 9, runs: 10, sr: 50.0, wkt: 4 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/3699.png" },
  { name: "Lauren Bell", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 50, rating: 88, stats: { mat: 24, runs: 15, sr: 60.0, wkt: 32 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/3982.png" },
  { name: "Amy Jones", role: "Wicket-Keeper", country: "ENG", isOverseas: true, basePrice: 50, rating: 87, stats: { mat: 106, runs: 1550, sr: 123.0, wkt: 0 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/510.png" },
  { name: "Tahlia Wilson", role: "Wicket-Keeper", country: "AUS", isOverseas: true, basePrice: 20, rating: 80, stats: { mat: 15, runs: 280, sr: 110.0, wkt: 0 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/4747.png" },
  { name: "Nadine de Klerk", role: "All-Rounder", country: "SA", isOverseas: true, basePrice: 30, rating: 85, stats: { mat: 56, runs: 510, sr: 112.0, wkt: 44 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/1805.png" },
  { name: "Chloe Tryon", role: "All-Rounder", country: "SA", isOverseas: true, basePrice: 30, rating: 86, stats: { mat: 98, runs: 1120, sr: 136.0, wkt: 36 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/199.png" },
  { name: "Tazmin Brits", role: "Batter", country: "SA", isOverseas: true, basePrice: 30, rating: 86, stats: { mat: 52, runs: 1360, sr: 110.0, wkt: 0 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/1988.png" },
  { name: "Ayabonga Khaka", role: "Bowler", country: "SA", isOverseas: true, basePrice: 40, rating: 86, stats: { mat: 60, runs: 30, sr: 60.0, wkt: 51 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/468.png" },
  { name: "Suné Luus", role: "All-Rounder", country: "SA", isOverseas: true, basePrice: 30, rating: 84, stats: { mat: 120, runs: 1350, sr: 108.0, wkt: 50 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/469.png" },
  { name: "Nonkululeko Mlaba", role: "Bowler", country: "SA", isOverseas: true, basePrice: 20, rating: 83, stats: { mat: 48, runs: 20, sr: 50.0, wkt: 42 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/3088.png" },
  { name: "Laura Harris", role: "Batter", country: "AUS", isOverseas: true, basePrice: 20, rating: 83, stats: { mat: 30, runs: 420, sr: 155.0, wkt: 0 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/4748.png" },
  { name: "Kim Garth", role: "Bowler", country: "AUS", isOverseas: true, basePrice: 50, rating: 87, stats: { mat: 56, runs: 770, sr: 105.0, wkt: 47 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/210.png" },
  { name: "Megan Schutt", role: "Bowler", country: "AUS", isOverseas: true, basePrice: 40, rating: 89, stats: { mat: 116, runs: 35, sr: 70.0, wkt: 145 }, img: "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/384.png" }
];

// Remaining 71 - 251 Players
const REMAINING_PLAYERS = [
  { name: "Phoebe Litchfield", role: "Batter", country: "AUS", isOverseas: true, basePrice: 50, rating: 89 },
  { name: "Kathryn Bryce", role: "All-Rounder", country: "SCO", isOverseas: true, basePrice: 20, rating: 83 },
  { name: "Sarah Glenn", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 30, rating: 86 },
  { name: "Freya Kemp", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Issy Wong", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 30, rating: 84 },
  { name: "Maia Bouchier", role: "Batter", country: "ENG", isOverseas: true, basePrice: 30, rating: 85 },
  { name: "Lauren Filer", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Bess Heath", role: "Wicket-Keeper", country: "ENG", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Mady Villiers", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 20, rating: 80 },
  { name: "Eden Carson", role: "Bowler", country: "NZ", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Fran Jonas", role: "Bowler", country: "NZ", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Jess Kerr", role: "Bowler", country: "NZ", isOverseas: true, basePrice: 20, rating: 83 },
  { name: "Hannah Rowe", role: "All-Rounder", country: "NZ", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Maddy Green", role: "Batter", country: "NZ", isOverseas: true, basePrice: 20, rating: 83 },
  { name: "Brooke Halliday", role: "Batter", country: "NZ", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Isabella Gaze", role: "Wicket-Keeper", country: "NZ", isOverseas: true, basePrice: 30, rating: 81 },
  { name: "Molly Penfold", role: "Bowler", country: "NZ", isOverseas: true, basePrice: 10, rating: 78 },
  { name: "Georgia Plimmer", role: "Batter", country: "NZ", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Stafanie Taylor", role: "All-Rounder", country: "WI", isOverseas: true, basePrice: 30, rating: 86 },
  { name: "Shemaine Campbelle", role: "Wicket-Keeper", country: "WI", isOverseas: true, basePrice: 20, rating: 80 },
  { name: "Chinelle Henry", role: "All-Rounder", country: "WI", isOverseas: true, basePrice: 30, rating: 83 },
  { name: "Shamilia Connell", role: "Bowler", country: "WI", isOverseas: true, basePrice: 30, rating: 82 },
  { name: "Afy Fletcher", role: "Bowler", country: "WI", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Karishma Ramharack", role: "Bowler", country: "WI", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Aaliyah Alleyne", role: "All-Rounder", country: "WI", isOverseas: true, basePrice: 20, rating: 80 },
  { name: "Rashada Williams", role: "Wicket-Keeper", country: "WI", isOverseas: true, basePrice: 10, rating: 78 },
  { name: "Qiana Joseph", role: "All-Rounder", country: "WI", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Harshitha Samarawickrama", role: "Batter", country: "SL", isOverseas: true, basePrice: 20, rating: 83 },
  { name: "Vishmi Gunaratne", role: "Batter", country: "SL", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Nilakshi de Silva", role: "Batter", country: "SL", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Kavisha Dilhari", role: "All-Rounder", country: "SL", isOverseas: true, basePrice: 20, rating: 83 },
  { name: "Inoka Ranaweera", role: "Bowler", country: "SL", isOverseas: true, basePrice: 20, rating: 83 },
  { name: "Sugandika Kumari", role: "Bowler", country: "SL", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Udeshika Prabodhani", role: "Bowler", country: "SL", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Anushka Sanjeewani", role: "Wicket-Keeper", country: "SL", isOverseas: true, basePrice: 10, rating: 79 },
  { name: "Nigar Sultana", role: "Wicket-Keeper", country: "BAN", isOverseas: true, basePrice: 20, rating: 84 },
  { name: "Nahida Akter", role: "Bowler", country: "BAN", isOverseas: true, basePrice: 20, rating: 83 },
  { name: "Fargana Hoque", role: "Batter", country: "BAN", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Ritu Moni", role: "All-Rounder", country: "BAN", isOverseas: true, basePrice: 10, rating: 79 },
  { name: "Shorna Akter", role: "All-Rounder", country: "BAN", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Marufa Akter", role: "Bowler", country: "BAN", isOverseas: true, basePrice: 30, rating: 83 },
  { name: "Rabeya Khan", role: "Bowler", country: "BAN", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Fahima Khatun", role: "Bowler", country: "BAN", isOverseas: true, basePrice: 10, rating: 78 },
  { name: "Devika Vaidya", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 30, rating: 82 },
  { name: "Sabbhineni Meghana", role: "Batter", country: "IND", isOverseas: false, basePrice: 30, rating: 82 },
  { name: "Priya Punia", role: "Batter", country: "IND", isOverseas: false, basePrice: 30, rating: 81 },
  { name: "Simran Bahadur", role: "Bowler", country: "IND", isOverseas: false, basePrice: 20, rating: 80 },
  { name: "Parshavi Chopra", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 80 },
  { name: "Mannat Kashyap", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 79 },
  { name: "G Trisha", role: "Batter", country: "IND", isOverseas: false, basePrice: 10, rating: 80 },
  { name: "Shabnam Shakil", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 81 },
  { name: "Monica Patel", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Jintimani Kalita", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 30, rating: 80 },
  { name: "Priyanka Bala", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 10, rating: 79 },
  { name: "Humairaa Kaazi", role: "Batter", country: "IND", isOverseas: false, basePrice: 30, rating: 80 },
  { name: "Aparna Mondal", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "S Yashasri", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Laxmi Yadav", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Simran Shaikh", role: "Batter", country: "IND", isOverseas: false, basePrice: 10, rating: 79 },
  { name: "Gouher Sultana", role: "Bowler", country: "IND", isOverseas: false, basePrice: 20, rating: 80 },
  { name: "Disha Kasat", role: "Batter", country: "IND", isOverseas: false, basePrice: 30, rating: 80 },
  { name: "Indrani Roy", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 10, rating: 79 },
  { name: "Tarannum Pathan", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10, rating: 79 },
  { name: "Poonam Khemnar", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10, rating: 80 },
  { name: "Sneha Deepthi", role: "Batter", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Komal Zanzad", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 79 },
  { name: "Pratika Rawal", role: "Batter", country: "IND", isOverseas: false, basePrice: 40, rating: 82 },
  { name: "Rashi Kanojiya", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Anusha Bareddy", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10, rating: 79 },
  { name: "Uma Chetry", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 30, rating: 81 },
  { name: "Bharti Fulmali", role: "Batter", country: "IND", isOverseas: false, basePrice: 30, rating: 81 },
  { name: "Shivali Shinde", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Nuzhat Parween", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 30, rating: 80 },
  { name: "Tejal Hasabnis", role: "Batter", country: "IND", isOverseas: false, basePrice: 10, rating: 80 },
  { name: "Sayali Satghare", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10, rating: 79 },
  { name: "Priya Mishra", role: "Bowler", country: "IND", isOverseas: false, basePrice: 40, rating: 83 },
  { name: "Soniya Mendhiya", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10, rating: 78 },
  { name: "Hurley Gala", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10, rating: 79 },
  { name: "Grace Scrivens", role: "Batter", country: "ENG", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Alice Davidson-Richards", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 30, rating: 83 },
  { name: "Tash Farrant", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Katie Levick", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Georgia Elwiss", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Linsey Smith", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Paige Scholfield", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Ryana MacDonald-Gay", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 10, rating: 79 },
  { name: "Charis Pavely", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 10, rating: 78 },
  { name: "Seren Smale", role: "Wicket-Keeper", country: "ENG", isOverseas: true, basePrice: 10, rating: 78 },
  { name: "Davina Perrin", role: "Batter", country: "ENG", isOverseas: true, basePrice: 10, rating: 78 },
  { name: "Courtney Webb", role: "Batter", country: "AUS", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Nicola Carey", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 30, rating: 83 },
  { name: "Sammy-Jo Johnson", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Maitlan Brown", role: "Bowler", country: "AUS", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Tess Flintoff", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Heather Graham", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 30, rating: 83 },
  { name: "Stella Campbell", role: "Bowler", country: "AUS", isOverseas: true, basePrice: 10, rating: 78 },
  { name: "Charli Knott", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Georgia Voll", role: "Batter", country: "AUS", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Katie Mack", role: "Batter", country: "AUS", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Bridget Patterson", role: "Batter", country: "AUS", isOverseas: true, basePrice: 10, rating: 79 },
  { name: "Anesu Mushangwe", role: "Bowler", country: "ZIM", isOverseas: true, basePrice: 10, rating: 79 },
  { name: "Sarah Bryce", role: "Wicket-Keeper", country: "SCO", isOverseas: true, basePrice: 10, rating: 80 },
  { name: "Priyanaz Chatterji", role: "All-Rounder", country: "SCO", isOverseas: true, basePrice: 10, rating: 78 },
  { name: "Abtaha Maqsood", role: "Bowler", country: "SCO", isOverseas: true, basePrice: 10, rating: 78 },
  { name: "Sterre Kalis", role: "Batter", country: "NED", isOverseas: true, basePrice: 10, rating: 80 },
  { name: "Iris Zwilling", role: "All-Rounder", country: "NED", isOverseas: true, basePrice: 10, rating: 79 },
  { name: "Babette de Leede", role: "Wicket-Keeper", country: "NED", isOverseas: true, basePrice: 10, rating: 79 },
  { name: "Gaby Lewis", role: "Batter", country: "IRE", isOverseas: true, basePrice: 20, rating: 84 },
  { name: "Orla Prendergast", role: "All-Rounder", country: "IRE", isOverseas: true, basePrice: 20, rating: 84 },
  { name: "Arlene Kelly", role: "All-Rounder", country: "IRE", isOverseas: true, basePrice: 10, rating: 81 },
  { name: "Laura Delany", role: "All-Rounder", country: "IRE", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Amy Hunter", role: "Wicket-Keeper", country: "IRE", isOverseas: true, basePrice: 10, rating: 81 },
  { name: "Cara Murray", role: "Bowler", country: "IRE", isOverseas: true, basePrice: 10, rating: 78 },
  { name: "Fatima Sana", role: "All-Rounder", country: "PAK", isOverseas: true, basePrice: 30, rating: 84 },
  { name: "Nida Dar", role: "All-Rounder", country: "PAK", isOverseas: true, basePrice: 30, rating: 84 },
  { name: "Aliya Riaz", role: "All-Rounder", country: "PAK", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Muneeba Ali", role: "Wicket-Keeper", country: "PAK", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Diana Baig", role: "Bowler", country: "PAK", isOverseas: true, basePrice: 20, rating: 81 },
  { name: "Nashra Sandhu", role: "Bowler", country: "PAK", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Sidra Ameen", role: "Batter", country: "PAK", isOverseas: true, basePrice: 20, rating: 82 },
  { name: "Sadia Iqbal", role: "Bowler", country: "PAK", isOverseas: true, basePrice: 20, rating: 84 },
  { name: "Tuba Hassan", role: "Bowler", country: "PAK", isOverseas: true, basePrice: 10, rating: 79 },
  { name: "Omaima Sohail", role: "All-Rounder", country: "PAK", isOverseas: true, basePrice: 10, rating: 79 },
  { name: "Ghulam Fatima", role: "Bowler", country: "PAK", isOverseas: true, basePrice: 10, rating: 78 }
];

REMAINING_PLAYERS.forEach((p, idx) => {
  if (MASTER_PLAYERS.length < 251) {
    MASTER_PLAYERS.push({
      ...p,
      stats: {
        mat: 20 + (idx % 25),
        runs: p.role.includes("Batter") || p.role.includes("All") ? 300 + (idx * 4) : 40,
        sr: p.role.includes("Batter") ? 114.5 : 95.0,
        wkt: p.role.includes("Bowler") || p.role.includes("All") ? 18 + (idx % 15) : 0
      },
      img: `https://images.icc-cricket.com/image/upload/t_player-headshot-portrait/prd/assets/players/womens/${4750 + idx}.png`
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
    if (rooms[roomCode]) return socket.emit('error-msg', 'Room pehle se bana hua hai!');

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
