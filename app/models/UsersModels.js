const connect = require("../config/db");
const { promisify } = require("util");

const promise_connection = promisify(connect.query).bind(connect);

const UserModel = {};


// Method to find a user by email or mobile
UserModel.findByEmailOrMobile = async (email, mobile) => {
  let query = "SELECT * FROM `users` WHERE `email` = ? OR `mobile` = ?";
  return await promise_connection(query, [email, mobile]);
};
UserModel.updateWalletByReferCode = async (wallet,refercode) => {
  let query = "UPDATE `users` SET `wallet` =? WHERE `referCode` = ?";
  return await promise_connection(query, [wallet, refercode]);
};


// Method to create a new user
UserModel.createUser = async (user) => {
  let query = "INSERT INTO `users` SET ?";
  return await promise_connection(query, user);
};

// Method to find a user by referral code
UserModel.findByReferCode = async (referCode) => {
  let query = "SELECT * FROM `users` WHERE `referCode` = ?";
  return await promise_connection(query, [referCode]);
};




// Fetch all banners from the `banner` table
UserModel.getBanners = async () => {
  const query = "SELECT * FROM `banner`";
  return await promise_connection(query);
};


// Method to check token
UserModel.findByToken = async (token) => {
  let query = "SELECT * FROM `users` WHERE `token` = ? ";
  return await promise_connection(query, [token]);
};

// Method to call SoloCtList
UserModel.getSoloct = async () => {
  const query = "SELECT * FROM `soloct`"; // Query to fetch all banners
  return await promise_connection(query); // Execute the query without any parameters
};
      

// Method to call SoloGame
UserModel.getSoloGame = async (category, status , typeStatus) => {
  // Query to fetch solo games with filters for category and status
  const query = "SELECT * FROM `sologame` WHERE `category` = ? AND `status` = ? AND `typeStatus` = ?";
  
  // Parameters to pass to the query
  const params = [category, status , typeStatus];
  
  // Execute the query with parameters
  return await promise_connection(query, params);
};



// Method to create a new game
UserModel.createSoloGame = async (user) => {
  let query = "INSERT INTO `sologame` SET ?";
  return await promise_connection(query, user);
};


// // Method to Check MatchID
// UserModel.checkMatchID = async (matchIde) => {
//   let query = "SELECT * FROM `sologame` WHERE `match_id` = ?";
//   return await promise_connection(query, [matchIde]);
// };


// // Method to update a solo game
// UserModel.updateSoloGame = async (matchId, updateFields) => {
//   let query = "UPDATE `sologame` SET ? WHERE `match_Id` = ?";
//   let data = [updateFields, matchId];
  
//   return await promise_connection(query, data);
// };





// Method to check if MatchID exists in the database
UserModel.checkMatchID = async (matchId) => {
  const query = "SELECT * FROM `sologame` WHERE `match_id` = ?";
  return await promise_connection(query, [matchId]);
};

// Method to update a solo game
UserModel.updateSoloGame = async (matchId, updateFields) => {
  const query = "UPDATE `sologame` SET ? WHERE `match_id` = ?";
  const data = [updateFields, matchId];
  
  return await promise_connection(query, data);
};




// Function to delete a solo game by matchId
UserModel.deleteSoloGame = async (matchId) => {
  const query = "DELETE FROM `sologame` WHERE `match_Id` = ?";
  return await promise_connection(query, [matchId]);
};



// Method to call TournamentList
UserModel.getTournamentct = async () => {
  const query = "SELECT * FROM `soloct` WHERE `status` = 3"; // Query to fetch all banners
  return await promise_connection(query); // Execute the query without any parameters
};




// Method to call SoloGame
UserModel.tournamentGame = async (category, status) => {
  // Query to fetch solo games with filters for category and status
  const query = "SELECT * FROM `tournamentgame` WHERE `category` = ? AND `status` = ?";
  
  // Parameters to pass to the query
  const params = [category, status];
  
  // Execute the query with parameters
  return await promise_connection(query, params);
};

//Method to Create Game History
UserModel.crategamehistory = async (gme_history) => {
  let query = "INSERT INTO `playedtournament` SET ?";
  return await promise_connection(query, gme_history);
};

// Method to call TournamentList
UserModel.gameIDCheck = async (gameid) => {
  const query = "SELECT * FROM `playedtournament` WHERE `gameId` = ?"; // Query to fetch all banners
  // Parameters to pass to the query
  const params = [gameid];
  
  // Execute the query with parameters
  return await promise_connection(query, params);
};


// Method to call SlotCheck
UserModel.slotcheck = async (gameid , slotno) => {
  const query = "SELECT * FROM `playedtournament` WHERE `gameId` = ?  AND  `slotNumber` = ? "; // Query to fetch all banners
  // Parameters to pass to the query
  const params = [gameid , slotno];

  // Execute the query with parameters
  return await promise_connection(query, params);
};


//Method to Call Wallet
UserModel.callWalletbyToken = async (token) => {

  const query = "SELECT * FROM `wallet` WHERE `token` = ?"; // Query to fetch all banners
  // Parameters to pass to the query
  const params = [token];
  
  // Execute the query with parameters
  return await promise_connection(query, params);
};


  //Metod to Update Wallet


//Method to Create Wallet History
UserModel.createwallethistory = async (walletHistory) => {
  let query = "INSERT INTO `wallet` SET ?";
  return await promise_connection(query, walletHistory);
};


// Method to update wallet and winWallet for a user
UserModel.updateWallet = async (token, wallet, winWallet) => {
  const query = "UPDATE `users` SET `wallet` = ?, `winWallet` = ? WHERE `token` = ?";
  const data = [wallet, winWallet, token];
  return await promise_connection(query, data);
  
};


function generateUniqueNumber() {
  // Get the last 5 digits of the current timestamp
  const timestampDigits = Date.now().toString().slice(-5);

  // Generate a random digit (0-9)
  const randomDigit = Math.floor(Math.random() * 10);

  // Combine the timestamp digits and the random digit to form a 5-digit number
  return timestampDigits + randomDigit;

  //console.log(generateUniqueNumber);
}




// Example usage
// const uniqueNumber = generateUniqueNumber();
// const rfercode = generateReferCode();
// console.log(uniqueNumber); // Output will be a 5-digit number based on current time
// console.log(rfercode);
  
//module.exports = { UserModel, generateReferCode };
module.exports = { UserModel, generateUniqueNumber };
