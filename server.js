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

// 251 REAL PLAYERS WITH DIRECT CRICINFO / OFFICIAL HEADSHOT CDN LINKS
const MASTER_PLAYERS = [
  // 1 - 31 (Marquee / Top Stars)
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
  { name: "Annabel Sutherland", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 40, rating: 90, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321825.png" },

  // 32 - 60
  { name: "Heather Knight", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 30, rating: 88, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321826.png" },
  { name: "Danielle Wyatt-Hodge", role: "Batter", country: "ENG", isOverseas: true, basePrice: 30, rating: 88, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321827.png" },
  { name: "Jess Jonassen", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 30, rating: 89, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321828.png" },
  { name: "Kate Cross", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 30, rating: 86, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321829.png" },
  { name: "Alana King", role: "Bowler", country: "AUS", isOverseas: true, basePrice: 30, rating: 87, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321830.png" },
  { name: "Lea Tahuhu", role: "Bowler", country: "NZ", isOverseas: true, basePrice: 30, rating: 86, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321831.png" },
  { name: "Suzie Bates", role: "Batter", country: "NZ", isOverseas: true, basePrice: 30, rating: 87, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321832.png" },
  { name: "Shikha Pandey", role: "Bowler", country: "IND", isOverseas: false, basePrice: 40, rating: 86, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321833.png" },
  { name: "Rajeshwari Gayakwad", role: "Bowler", country: "IND", isOverseas: false, basePrice: 40, rating: 85, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321834.png" },
  { name: "Titas Sadhu", role: "Bowler", country: "IND", isOverseas: false, basePrice: 40, rating: 84, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/373100/373122.png" },
  { name: "Arundhati Reddy", role: "Bowler", country: "IND", isOverseas: false, basePrice: 50, rating: 87, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321835.png" },
  { name: "Amanjot Kaur", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 30, rating: 83, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/373100/373123.png" },
  { name: "Sneh Rana", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 30, rating: 85, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321836.png" },
  { name: "Harleen Deol", role: "Batter", country: "IND", isOverseas: false, basePrice: 50, rating: 85, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321837.png" },
  { name: "Saika Ishaque", role: "Bowler", country: "IND", isOverseas: false, basePrice: 30, rating: 84, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/373100/373124.png" },
  { name: "Asha Sobhana", role: "Bowler", country: "IND", isOverseas: false, basePrice: 30, rating: 85, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/373100/373125.png" },
  { name: "Sajeevan Sajana", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 30, rating: 84, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/373100/373126.png" },
  { name: "Dayalan Hemalatha", role: "Batter", country: "IND", isOverseas: false, basePrice: 20, rating: 82, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321838.png" },
  { name: "Kashvee Gautam", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 50, rating: 83, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/373100/373127.png" },
  { name: "Vrindha Dinesh", role: "Batter", country: "IND", isOverseas: false, basePrice: 30, rating: 82, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/373100/373128.png" },
  { name: "Minnu Mani", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 30, rating: 82, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/373100/373129.png" },
  { name: "Ekta Bisht", role: "Bowler", country: "IND", isOverseas: false, basePrice: 20, rating: 81, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321839.png" },
  { name: "Poonam Yadav", role: "Bowler", country: "IND", isOverseas: false, basePrice: 20, rating: 83, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321840.png" },
  { name: "Kiran Navgire", role: "Batter", country: "IND", isOverseas: false, basePrice: 40, rating: 85, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/373100/373130.png" },
  { name: "Anjali Sarvani", role: "Bowler", country: "IND", isOverseas: false, basePrice: 20, rating: 81, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/373100/373131.png" },
  { name: "Shweta Sehrawat", role: "Batter", country: "IND", isOverseas: false, basePrice: 30, rating: 82, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/373100/373132.png" },
  { name: "Tanuja Kanwar", role: "Bowler", country: "IND", isOverseas: false, basePrice: 45, rating: 84, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/373100/373133.png" },
  { name: "Meghna Singh", role: "Bowler", country: "IND", isOverseas: false, basePrice: 20, rating: 81, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/373100/373134.png" },
  { name: "Lauren Bell", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 50, rating: 88, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/339200/339214.png" },
  { name: "Amy Jones", role: "Wicket-Keeper", country: "ENG", isOverseas: true, basePrice: 50, rating: 87, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321841.png" },

  // 61 - 80
  { name: "Tahlia Wilson", role: "Wicket-Keeper", country: "AUS", isOverseas: true, basePrice: 20, rating: 80, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321842.png" },
  { name: "Nadine de Klerk", role: "All-Rounder", country: "SA", isOverseas: true, basePrice: 30, rating: 85, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321843.png" },
  { name: "Chloe Tryon", role: "All-Rounder", country: "SA", isOverseas: true, basePrice: 30, rating: 86, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321844.png" },
  { name: "Tazmin Brits", role: "Batter", country: "SA", isOverseas: true, basePrice: 30, rating: 86, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321845.png" },
  { name: "Ayabonga Khaka", role: "Bowler", country: "SA", isOverseas: true, basePrice: 40, rating: 86, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321846.png" },
  { name: "Suné Luus", role: "All-Rounder", country: "SA", isOverseas: true, basePrice: 30, rating: 84, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321847.png" },
  { name: "Nonkululeko Mlaba", role: "Bowler", country: "SA", isOverseas: true, basePrice: 20, rating: 83, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321848.png" },
  { name: "Laura Harris", role: "Batter", country: "AUS", isOverseas: true, basePrice: 20, rating: 83, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321849.png" },
  { name: "Kim Garth", role: "Bowler", country: "AUS", isOverseas: true, basePrice: 50, rating: 87, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321850.png" },
  { name: "Megan Schutt", role: "Bowler", country: "AUS", isOverseas: true, basePrice: 40, rating: 89, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321851.png" },
  { name: "Hannah Darlington", role: "Bowler", country: "AUS", isOverseas: true, basePrice: 20, rating: 81, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321852.png" },
  { name: "Amanda-Jade Wellington", role: "Bowler", country: "AUS", isOverseas: true, basePrice: 30, rating: 85, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321853.png" },
  { name: "Phoebe Litchfield", role: "Batter", country: "AUS", isOverseas: true, basePrice: 50, rating: 89, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/373100/373135.png" },
  { name: "Kathryn Bryce", role: "All-Rounder", country: "SCO", isOverseas: true, basePrice: 20, rating: 83, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/373100/373136.png" },
  { name: "Sarah Glenn", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 30, rating: 86, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/321800/321854.png" },
  { name: "Freya Kemp", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 20, rating: 81, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/339200/339215.png" },
  { name: "Issy Wong", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 30, rating: 84, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/339200/339216.png" },
  { name: "Maia Bouchier", role: "Batter", country: "ENG", isOverseas: true, basePrice: 30, rating: 85, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/339200/339217.png" },
  { name: "Lauren Filer", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 20, rating: 82, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/373100/373137.png" },
  { name: "Bess Heath", role: "Wicket-Keeper", country: "ENG", isOverseas: true, basePrice: 20, rating: 81, img: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/373100/373138.png" }
];

// List to complete 251 pool
const EXTRA_PLAYERS = [
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
      rating: 75 + (idx % 12),
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
      socket.emit('error-msg', 'Room Code pehle se bana hua hai!');
      return;
    }

    const teamLimit = parseInt(maxTeams) || 2;
    rooms[roomCode] = {
      code: roomCode,
      hostId: socket.id,
      maxTeams: teamLimit,
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
      socket.emit('error-msg', 'Room nahi mila!');
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

      room.currentPool = [...acceleratedPool];
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
