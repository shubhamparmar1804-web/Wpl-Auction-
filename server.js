const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const rooms = {};

// COMPLETE 250 REAL PLAYERS POOL
const MASTER_PLAYERS = [
  // 1 - 30 (Top Indian & Global Superstars)
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
  { name: "Hurley Gala", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10 },

  // 151 - 200 (Expanded Domestic & Global Circuit)
  { name: "Grace Scrivens", role: "Batter", country: "ENG", isOverseas: true, basePrice: 20 },
  { name: "Alice Davidson-Richards", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 30 },
  { name: "Tash Farrant", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 20 },
  { name: "Katie Levick", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 20 },
  { name: "Georgia Elwiss", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 20 },
  { name: "Linsey Smith", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 20 },
  { name: "Paige Scholfield", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 20 },
  { name: "Ryana MacDonald-Gay", role: "Bowler", country: "ENG", isOverseas: true, basePrice: 10 },
  { name: "Charis Pavely", role: "All-Rounder", country: "ENG", isOverseas: true, basePrice: 10 },
  { name: "Seren Smale", role: "Wicket-Keeper", country: "ENG", isOverseas: true, basePrice: 10 },
  { name: "Davina Perrin", role: "Batter", country: "ENG", isOverseas: true, basePrice: 10 },
  { name: "Courtney Webb", role: "Batter", country: "AUS", isOverseas: true, basePrice: 20 },
  { name: "Nicola Carey", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 30 },
  { name: "Sammy-Jo Johnson", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 20 },
  { name: "Maitlan Brown", role: "Bowler", country: "AUS", isOverseas: true, basePrice: 20 },
  { name: "Tess Flintoff", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 20 },
  { name: "Heather Graham", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 30 },
  { name: "Stella Campbell", role: "Bowler", country: "AUS", isOverseas: true, basePrice: 10 },
  { name: "Charli Knott", role: "All-Rounder", country: "AUS", isOverseas: true, basePrice: 20 },
  { name: "Georgia Voll", role: "Batter", country: "AUS", isOverseas: true, basePrice: 20 },
  { name: "Katie Mack", role: "Batter", country: "AUS", isOverseas: true, basePrice: 20 },
  { name: "Bridget Patterson", role: "Batter", country: "AUS", isOverseas: true, basePrice: 10 },
  { name: "Anesu Mushangwe", role: "Bowler", country: "ZIM", isOverseas: true, basePrice: 10 },
  { name: "Sarah Bryce", role: "Wicket-Keeper", country: "SCO", isOverseas: true, basePrice: 10 },
  { name: "Priyanaz Chatterji", role: "All-Rounder", country: "SCO", isOverseas: true, basePrice: 10 },
  { name: "Abtaha Maqsood", role: "Bowler", country: "SCO", isOverseas: true, basePrice: 10 },
  { name: "Sterre Kalis", role: "Batter", country: "NED", isOverseas: true, basePrice: 10 },
  { name: "Iris Zwilling", role: "All-Rounder", country: "NED", isOverseas: true, basePrice: 10 },
  { name: "Babette de Leede", role: "Wicket-Keeper", country: "NED", isOverseas: true, basePrice: 10 },
  { name: "Gaby Lewis", role: "Batter", country: "IRE", isOverseas: true, basePrice: 20 },
  { name: "Orla Prendergast", role: "All-Rounder", country: "IRE", isOverseas: true, basePrice: 20 },
  { name: "Arlene Kelly", role: "All-Rounder", country: "IRE", isOverseas: true, basePrice: 10 },
  { name: "Laura Delany", role: "All-Rounder", country: "IRE", isOverseas: true, basePrice: 20 },
  { name: "Amy Hunter", role: "Wicket-Keeper", country: "IRE", isOverseas: true, basePrice: 10 },
  { name: "Cara Murray", role: "Bowler", country: "IRE", isOverseas: true, basePrice: 10 },
  { name: "Fatima Sana", role: "All-Rounder", country: "PAK", isOverseas: true, basePrice: 30 },
  { name: "Nida Dar", role: "All-Rounder", country: "PAK", isOverseas: true, basePrice: 30 },
  { name: "Aliya Riaz", role: "All-Rounder", country: "PAK", isOverseas: true, basePrice: 20 },
  { name: "Muneeba Ali", role: "Wicket-Keeper", country: "PAK", isOverseas: true, basePrice: 20 },
  { name: "Diana Baig", role: "Bowler", country: "PAK", isOverseas: true, basePrice: 20 },
  { name: "Nashra Sandhu", role: "Bowler", country: "PAK", isOverseas: true, basePrice: 20 },
  { name: "Sidra Ameen", role: "Batter", country: "PAK", isOverseas: true, basePrice: 20 },
  { name: "Sadia Iqbal", role: "Bowler", country: "PAK", isOverseas: true, basePrice: 20 },
  { name: "Tuba Hassan", role: "Bowler", country: "PAK", isOverseas: true, basePrice: 10 },
  { name: "Omaima Sohail", role: "All-Rounder", country: "PAK", isOverseas: true, basePrice: 10 },
  { name: "Ghulam Fatima", role: "Bowler", country: "PAK", isOverseas: true, basePrice: 10 },
  { name: "Gargi Banerji", role: "Batter", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Rashi Kashyap", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Mamatha Maben", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Shweta Jadhav", role: "Batter", country: "IND", isOverseas: false, basePrice: 10 },

  // 201 - 250 (Promising Domestic Talents & International Depth)
  { name: "Kajal Verma", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Nandini Kashyap", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Chitra Singh", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Pooja Nimavat", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Dhara Gujjar", role: "Batter", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Hrishita Basu", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Soumya Tiwari", role: "Batter", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Archana Devi", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Falak Naz", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Sonam Yadav", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Najla CMC", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Kirti James", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Divya Gnanananda", role: "Batter", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Prathyusha Challuru", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Sahana Pawar", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Rupali Patel", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Priyanka Garkhede", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Aaditi Surve", role: "Batter", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Shanu Sen", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Tanu Shree", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Monalisha Rout", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Rima Laxmi Ekka", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Kajal Jena", role: "Batter", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Sushree Dibyadarshini", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Rasanara Parwin", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Neetu David", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Nuzhat Siddiqui", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Shubha Satheesh", role: "Batter", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Gautami Naik", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Veda Krishnamurthy", role: "Batter", country: "IND", isOverseas: false, basePrice: 30 },
  { name: "Ekta Kaundal", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Chitra Jamwal", role: "Batter", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Jyoti Chouhan", role: "Batter", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Sunita Anand", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Shilpa Sahu", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Shivani Singh", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Soni Yadav", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Simran Dil Bahadur", role: "Bowler", country: "IND", isOverseas: false, basePrice: 20 },
  { name: "Ananya Upendran", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Niki Prasad", role: "Batter", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Ragini Yadav", role: "Wicket-Keeper", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Kashish Verma", role: "Batter", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Kavita Patil", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Vaishnavi Sharma", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Neha Chavda", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Yashasvi Katta", role: "Bowler", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Ananya Goel", role: "Batter", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Tanushree Sarkar", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Prativa Rana", role: "Batter", country: "IND", isOverseas: false, basePrice: 10 },
  { name: "Mamta Kanojia", role: "All-Rounder", country: "IND", isOverseas: false, basePrice: 10 }
];

// Profile Avatars
MASTER_PLAYERS.forEach(p => {
  p.img = `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(p.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
});

function areAllSquadsFull(room) {
  const users = Object.values(room.users);
  if (users.length === 0) return false;
  return users.every(u => u.squad.length >= 16);
}

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

  const player = room.currentPool[room.currentIndex];
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
    // Add to Unsold list for Next Round
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

  // 1. Check if all teams have 16 players
  if (areAllSquadsFull(room)) {
    endAuction(roomCode);
    return;
  }

  // 2. Check if current pool is finished
  if (room.currentIndex >= room.currentPool.length) {
    // If we have unsold players and teams still need players -> START NEXT ROUND
    if (room.unsoldPool.length > 0) {
      room.round++;
      room.currentPool = [...room.unsoldPool];
      room.unsoldPool = [];
      room.currentIndex = 0;
      io.to(roomCode).emit('round-started', { round: room.round, total: room.currentPool.length });
    } else {
      // No more players available anywhere
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
    round: room.round
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
      currentPool: [...MASTER_PLAYERS], // Pure 250 Players Pool
      unsoldPool: [],
      round: 1,
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
      team: teamName || "Team Alpha",
      purse: 1500, // ₹15.00 Cr
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
    const player = room.currentPool[room.currentIndex];
    room.unsoldPool.push(player);
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
