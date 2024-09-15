const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserModel, generateUniqueNumber } = require("../models/UsersModels");


exports.registerUser = async (req, res) => {


  const { name, email, mobile, password, referCode } = req.body;

  // Logging to verify values
  console.log(name + email + mobile + password + referCode);
  console.log(UserModel);

  // Validate required fields
  if (!name || !email || !mobile || !password) {
    return res.status(400).json({status: "false" , message: "Please fill all required fields" , users: null });
  }


  try {
    // Check if email or mobile already exists
    const results = await UserModel.findByEmailOrMobile(email, mobile);
    if (results.length > 0) {
      return res.status(400).json({status: "false" , message: "Email or Mobile already in use", users: null });
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    // Generate refer code
    const numbers = Math.floor(1000 + Math.random() * 9000).toString(); // Generates a random 4-digit number
    const letter1 = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // Generates a random uppercase letter
    const letter2 = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // Generates another random uppercase letter
    const newReferCode = numbers + letter1 + letter2; // Concatenate the numbers and letters
    

    // Check if provided referCode is valid
    let wallet = 0; 
    let joinCode = "null";
    if (referCode) {
      const referResults = await UserModel.findByReferCode(referCode);
      if (referResults.length > 0) {
        wallet = 10; // Add 10 to the wallet if referCode is valid
        joinCode = referCode
        const newWallet = referResults[0].wallet + 10
        UserModel.updateWalletByReferCode(newWallet,referCode)
      } else {
        return res.status(400).json({status: "false" , message: "Invalid referral code", users: null });
      }
    }

   // Log JWT Secret to verify
   console.log("JWT Secret:", process.env.JWT_SECRET);

   // Generate JWT token
   const token = jwt.sign({ number: mobile }, process.env.JWT_SECRET, {});

    // Create new user
    const newUser = {
      name,
      username: "null",
      email,
      mobile,
      dob: "null",
      password: hashedPassword,
      referCode: newReferCode,
      joinCode,
      wallet:0,
      winWallet: 0,
      profile: "null",
      status: 1,
      token,
    };


    const result = await UserModel.createUser(newUser);

    if(result){

      res.status(201).json({status: "true" , message: "User registered successfully", user :newUser });
    }else{
      res.status(403).json({status: "false" , message: "Rquest Failed" , users: null});
    }

  } catch (error) {
    console.error(error.message);
    res.status(500).json({status: "false" , message: "Server error" , users: error.message});
  }
};

exports.loginUser = async(req , res) =>{
  const { mobile, password} = req.body;
  // Validate required fields
  if (!mobile || !password) {
    return res.status(400).json({status: "false" , message: "Please fill all required fields" , users: null});
  }
  try {
    // Check if email or mobile already exists
    const results = await UserModel.findByEmailOrMobile("",mobile);
    if (results.length > 0) {

      const isPassValid = await bcrypt.compare(password, results[0].password);
      console.log('Stored hashed password:', results[0].password);
      console.log('Provided password:', password);
      console.log('Comparison result:', isPassValid);
      
   if(isPassValid){

 // Generate JWT token
 const newUser = {
  name: results[0].name ,
  username:  results[0].username ,
  email : results[0].email,
  mobile:  results[0].mobile ,
  dob:  results[0].dob,
  password:  results[0].password ,
  referCode:  results[0] .referCode,
  joinCode:  results[0].joinCode,
  wallet :  results[0] .wallet,
  winWallet:  0 ,
  profile:  results[0].profile,
  status: 1,
  token:results[0].token,
};


 return res.status(200).json({status: "true" , message: "User Found" ,user : newUser});
   }else{
    return res.status(401).json({status: "false" , message: "Incorrect pass" , users: null});
   }
     
    }else{
      return res.status(401).json({status: "false" , message: "User not Found" , users: null});
    }

    
  } catch (error) {
    console.error(error.message);
    res.status(500).json({status: "false" , message: "Server error" , users: null});
  }
};


exports.getBanners = async (req, res) => {
  try {
    const banners = await UserModel.getBanners(); // Fetch all banners
    res.status(200).json({status: "true" , message:"fetced" , banner: banners }); // Respond with the banners in JSON format
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getSoloct = async (req, res) => {
  
  const authHeader = req.headers.authorization; // Assuming the token is provided in the request header

  // Check if the Authorization header is present
  if (!authHeader) {
    return res.status(401).json({ status: false, message: "Authorization token is required", soloCtList: null });
  }

  const token = authHeader.split(' ')[1]; // Extract the token part

  // Check if the token is provided
  if (!token) {
    return res.status(401).json({ status: false, message: "Invalid token format", soloCtList: null });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET is set correctly
    console.log("Decoded Token:", decoded); // Log the decoded token to verify it's correct

    // Check if token is valid in the database
    const userResult = await UserModel.findByToken(token);
    console.log("User result: ", userResult); // Log the user result to check if it's empty

    if (userResult.length === 0) {
      return res.status(401).json({ status: false, message: "Invalid token", soloCtList: null });
    }

    // Fetch SoloCt list if token is valid
    const soloCtList = await UserModel.getSoloct();
    return res.status(200).json({ status: true, message: "Data fetched", soloCtList });

  } catch (error) {
    // Catch JWT errors (expired, tampered, etc.)
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ status: false, message: "Invalid or expired token", soloCtList: null });
    }
    
    // Handle any other errors
    console.error("Error stack trace:", error); // Log full error stack trace
    return res.status(500).json({ status: false, message: "Internal Server Error", soloCtList: null });
  }
};



exports.getSologame = async (req, res) => {
  const authHeader = req.headers.authorization; // Get the authorization header

  // Check if the Authorization header is present
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: false, message: "Authorization token is required", soloGame: null });
  }

  const token = authHeader.split(' ')[1]; // Extract the token part from the Bearer token

  // Check if the token is provided
  if (!token) {
    return res.status(401).json({ status: false, message: "Invalid token format", soloGame: null });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET is set correctly
    console.log("Decoded Token:", decoded); // Log the decoded token to verify it's correct

    // Check if token is valid in the database
    const userResult = await UserModel.findByToken(token);
    console.log("User result: ", userResult); // Log the user result to check if it's empty

    if (userResult.length === 0) {
      return res.status(401).json({ status: false, message: "Invalid token", soloGame: null });
    }

    // Extract fields from request body
    const { category, status } = req.body;

    // Validate required fields
    if (!category || !status) {
      return res.status(400).json({ status: false, message: "Category and status are required fields", soloGame: null });
    }

     // Fetch SoloGame list based on category and status if token is valid
     const soloGame = await UserModel.getSoloGame(category, status);

     if(soloGame.length==0){
      return res.status(400).json({ status: false, message: "InValid category or status", soloGame: null });
     }

  
     res.status(200).json({ status: true, message: "Data fetched", soloGame });


  } catch (error) {
    // Catch JWT errors (expired, tampered, etc.)
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ status: false, message: "Invalid or expired token", soloGame: null });
    }
    
    // Handle any other errors
    console.error("Error stack trace:", error); // Log full error stack trace
    return res.status(500).json({ status: false, message: "Internal Server Error", soloGame: null });
  }
};




exports.createSoloGame = async (req, res) => {
  const authHeader = req.headers.authorization; // Get the authorization header

  // Validate if Bearer token is provided
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: false, message: "Authorization token is required", game: null });
  }

  const token = authHeader.split(' ')[1]; // Extract the token part from the Bearer token

  if (!token) {
    return res.status(401).json({ status: false, message: "Authorization token is missing", game: null });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use the correct secret to verify
    console.log("Decoded Token:", decoded); // Logging the decoded token

    // Generate match ID
    const matchId = generateUniqueNumber();
    console.log("Generated Match ID:", matchId);

    // Extract fields from request body
    const {
      category,
      challangedPlayer,
      OpponentPlayer,
      challangedPlayerToken,
      OpponentPlayerToken,
      profileChld,
      profileOpo,
      beatAmount,
      winAmount,
      type,
      roomId,
      password,
      teamCode,
      Charge,
      challangedSquadUsername,
      opponentSquadUsername,
      status
    } = req.body;

    // Logging to verify values
    console.log("Request Body:", req.body); // Log all values from the request body

    // Validate required fields
    if (!category || !challangedPlayer || !challangedPlayerToken || !profileChld || !beatAmount || !winAmount || !type || !status  || !challangedSquadUsername) {
      return res.status(400).json({ status: false, message: "Please fill all required fields", game: null });
    }

    // Additional validation for numeric fields
    if (isNaN(beatAmount) || isNaN(winAmount)) {
      return res.status(400).json({ status: false, message: "Amount fields must be valid numbers", game: null });
    }

    if (Charge && isNaN(Charge)) {
      return res.status(400).json({ status: false, message: "Charge must be a valid number", game: null });
    }

    // Create the new solo game object
    const newSoloGame = {
      category,
      match_Id: matchId,
      challangedPlayer,
      OpponentPlayer: OpponentPlayer || "null", // Default to "null" if not provided
      challangedPlayerToken,
      OpponentPlayerToken: OpponentPlayerToken || "null", // Default to "null" if not provided
      profileChld,
      profileOpo: profileOpo || "null", // Default to "null" if not provided
      beatAmount,
      winAmount,
      type,
      roomId: roomId || "null", // Default to "null" if not provided
      password: password || "null", // Default to "null" if not provided
      teamCode: teamCode || "null", // Default to "null" if not provided
      Charge: Charge || 0, // Default Charge to 0 if not provided
      challangedSquadUsername,
      opponentSquadUsername : null,
      status
    };

    // Proceed with saving the solo game in the database
    const result = await UserModel.createSoloGame(newSoloGame);

    if (result) {
      res.status(201).json({ status: true, message: "Solo game created successfully", game: newSoloGame });
    } else {
      res.status(403).json({ status: false, message: "Failed to create the solo game", game: null });
    }

  } catch (error) {
    console.error("Error:", error.message); // Log error message
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ status: false, message: "Invalid or malformed token", game: null });
    }
    return res.status(500).json({ status: false, message: "Internal Server Error", game: null });
  }
};




// controllers/gameController.js

exports.updateSoloGame = async (req, res) => {
  const authHeader = req.headers.authorization; // Get the authorization header

  // Validate if Bearer token is provided
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: false, message: "Authorization token is required", game: null });
  }

  const token = authHeader.split(' ')[1]; // Extract the token part from the Bearer token

  if (!token) {
    return res.status(401).json({ status: false, message: "Authorization token is missing", game: null });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use the correct secret to verify
    console.log("Decoded Token:", decoded); // Logging the decoded token

    // Extract fields from request body
    const { matchId, OpponentPlayer, OpponentPlayerToken, profileOpo, opponentSquadUsername, status } = req.body;

    // Validate required fields
    if (!matchId || !OpponentPlayer || !OpponentPlayerToken || !profileOpo || !opponentSquadUsername || !status) {
      return res.status(400).json({ status: false, message: "Please fill all required fields", game: null });
    }

    // Check if the provided matchId exists in the database
    const matchCheck = await UserModel.checkMatchID(matchId);
    console.log("Match Check Result:", matchCheck); // Log the match check result

    if (matchCheck.length === 0) {
      return res.status(400).json({ status: false, message: "Invalid Match ID", game: null });
    }

    // Create an object with only fields that are provided (to update selectively)
    const updateFields = {};
    if (OpponentPlayer !== undefined) updateFields.OpponentPlayer = OpponentPlayer;
    if (OpponentPlayerToken !== undefined) updateFields.OpponentPlayerToken = OpponentPlayerToken;
    if (profileOpo !== undefined) updateFields.profileOpo = profileOpo;
    if (opponentSquadUsername !== undefined) updateFields.opponentSquadUsername = opponentSquadUsername;
    if (status !== undefined) updateFields.status = status;

    // Check if there are fields to update
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ status: false, message: "No fields provided for update", game: null });
    }

    // Proceed with updating the solo game in the database
    const result = await UserModel.updateSoloGame(matchId, updateFields);
    console.log("Update Result:", result); // Log the update result

    if (result.affectedRows > 0) {
      res.status(200).json({ status: true, message: "Solo game updated successfully", game: updateFields });
    } else {
      res.status(404).json({ status: false, message: "Game not found or no changes made", game: null });
    }

  } catch (error) {
    console.error("Error:", error); // Log full error stack trace
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ status: false, message: "Invalid or malformed token", game: null });
    }
    return res.status(500).json({ status: false, message: "Internal Server Error", game: null });
  }
};



exports.deleteSoloGame = async (req, res) => {
  const authHeader = req.headers.authorization; // Get the authorization header

  // Validate if Bearer token is provided
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: false, message: "Authorization token is required", game: null });
  }

  const token = authHeader.split(' ')[1]; // Extract the token part from the Bearer token

  if (!token) {
    return res.status(401).json({ status: false, message: "Authorization token is missing", game: null });
  }


  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use the correct secret to verify
    console.log("Decoded Token:", decoded); // Logging the decoded token

    // Extract matchId from query parameters
    const { matchId } = req.body;

    // Validate matchId
    if (!matchId) {
      return res.status(400).json({ status: false, message: "Invalid or missing matchId", game: null , matcheuid:matchId});
    }

    // Proceed with deleting the solo game from the database
    const result = await UserModel.deleteSoloGame(matchId);

    if (result.affectedRows > 0) {
      res.status(200).json({ status: true, message: "Solo game deleted successfully", game: null });
    } else {
      res.status(404).json({ status: false, message: "Game not found", game: null });
    }

  } catch (error) {
    console.error("Error:", error.message); // Log error message
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ status: false, message: "Invalid or malformed token", game: null });
    }
    return res.status(500).json({ status: false, message: "Internal Server Error", game: null });
  }
};


exports.getTournamentct = async (req, res) => {
  
  const authHeader = req.headers.authorization; // Assuming the token is provided in the request header

  // Check if the Authorization header is present
  if (!authHeader) {
    return res.status(401).json({ status: false, message: "Authorization token is required", soloCtList: null });
  }

  const token = authHeader.split(' ')[1]; // Extract the token part

  // Check if the token is provided
  if (!token) {
    return res.status(401).json({ status: false, message: "Invalid token format", soloCtList: null });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET is set correctly
    console.log("Decoded Token:", decoded); // Log the decoded token to verify it's correct

    // Check if token is valid in the database
    const userResult = await UserModel.findByToken(token);
    console.log("User result: ", userResult); // Log the user result to check if it's empty

    if (userResult.length === 0) {
      return res.status(401).json({ status: false, message: "Invalid token", soloCtList: null });
    }

    // Fetch SoloCt list if token is valid
    const soloCtList = await UserModel.getTournamentct();
    return res.status(200).json({ status: true, message: "Data fetched", soloCtList });

  } catch (error) {
    // Catch JWT errors (expired, tampered, etc.)
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ status: false, message: "Invalid or expired token", soloCtList: null });
    }
    
    // Handle any other errors
    console.error("Error stack trace:", error); // Log full error stack trace
    return res.status(500).json({ status: false, message: "Internal Server Error", soloCtList: null });
  }
};


exports.getTournamentList = async (req, res) => {
  const authHeader = req.headers.authorization;

  // Check if the Authorization header is present
  if (!authHeader) {
    return res.status(401).json({ status: false, message: "Authorization token is required", soloCtList: null });
  }

  const token = authHeader.split(' ')[1]; // Extract the token part

  // Check if the token is provided
  if (!token) {
    return res.status(401).json({ status: false, message: "Invalid token format", soloCtList: null });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);

    // Check if the token is valid in the database
    const userResult = await UserModel.findByToken(token);
    console.log("User result: ", userResult);

    if (userResult.length === 0) {
      return res.status(401).json({ status: false, message: "Invalid token", tournamentGame: null });
    }

    // Extract status and category from request (either from query, params, or body)
    const { category, status } = req.body; // or req.query or req.params depending on your implementation

    if (!category || !status) {
      return res.status(400).json({ status: false, message: "Category and status are required", tournamentGame: null });
    }

    // Fetch the list of tournament games based on the provided category and status
    const tournamentGame = await UserModel.tournamentGame(category, status);

    if(tournamentGame.length==0){
      return res.status(400).json({ status: false, message: "Category and status are not valid", tournamentGame: null });
    }

     res.status(200).json({ status: true, message: "Data fetched", tournamentGame });
     
  } catch (error) {
    // Catch JWT errors (expired, tampered, etc.)
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ status: false, message: "Invalid or expired token", tournamentGame: null });
    }

    // Handle any other errors
    console.error("Error stack trace:", error);
    return res.status(500).json({ status: false, message: "Internal Server Error", tournamentGame: null });
  }
};



exports.crategamehistory = async (req, res) => {
  const authHeader = req.headers.authorization;

  // Validate if Bearer token is provided
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: false, message: "Authorization token is required", game: null });
  }

  const token = authHeader.split(' ')[1]; // Extract the token part from the Bearer token

  if (!token) {
    return res.status(401).json({ status: false, message: "Authorization token is missing", game: null });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);

    // Extract fields from request body
    const {
      name,
      username,
      mobile,
      gameId,
      gameName,
      totalKill = 0, // Autofill to 0 if not provided
      gameImg,
      totalWin = 0,  // Autofill to 0 if not provided
      slotNumber,
      status = 0     // Autofill to 0 if not provided
    } = req.body;

    // Logging to verify values
    console.log("Request Body:", req.body);

    // Validate required fields
    if (!name || !username || !mobile || !gameId || !gameName || !gameImg || !slotNumber) {
      return res.status(400).json({ status: false, message: "Please fill all required fields", game: null });
    }

    // Additional validation (if needed)
    if (isNaN(totalKill) || isNaN(totalWin) || isNaN(status)) {
      return res.status(400).json({ status: false, message: "Total Kill, Total Win, and Status must be valid numbers", game: null });
    }

    // Check if the gameId exists
    const gameIdCheckResult = await UserModel.gameIDCheck(gameId);

    if (gameIdCheckResult.length == 0) {
      // If gameId doesn't exist, create game history without checking slotNumber
      const newGameHistory = {
        token,
        name,
        username,
        mobile,
        gameId,
        gameName,
        totalKill,
        gameImg,
        totalWin,
        slotNumber,
        status,
      };

     const result = await UserModel.crategamehistory(newGameHistory);

    
      if (result) {
        return res.status(201).json({ status: true, message: "Game history created successfully", game: newGameHistory });
      } else {
        return res.status(403).json({ status: false, message: "Failed to create game history", game: null });
      }
    }

    // If gameId exists, check if the slotNumber is available for that gameId
    const slotCheckResult = await UserModel.slotcheck(gameId, slotNumber);
    if (slotCheckResult.length > 0) {
      return res.status(409).json({ status: false, message: `Slot number ${slotNumber} is already taken for this game`, game: null });
    }

    // If slotNumber is available, create game history
    const newGameHistory = {
      token,
      name,
      username,
      mobile,
      gameId,
      gameName,
      totalKill,
      gameImg,
      totalWin,
      slotNumber,
      status,
    };

    const result = await UserModel.crategamehistory(newGameHistory);

    if (result) {
      return res.status(201).json({ status: true, message: "Game history created successfully", game: newGameHistory });
    } else {
      return res.status(403).json({ status: false, message: "Failed to create game history", game: null });
    }

  } catch (error) {
    console.error("Error:", error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ status: false, message: "Invalid or malformed token", game: null });
    }
    return res.status(500).json({ status: false, message: "Internal Server Error", game: null });
  }
};



exports.createwallethistory = async (req, res) => {
  const authHeader = req.headers.authorization;

  // Validate if Bearer token is provided
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: false, message: "Authorization token is required", wallet: null });
  }

  const token = authHeader.split(' ')[1]; // Extract the token part from the Bearer token

  if (!token) {
    return res.status(401).json({ status: false, message: "Authorization token is missing", wallet: null });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);

    // Extract fields from request body
    const {
      date,
      type,
      amount,
      currentAmount,
      message
    } = req.body;

    // Logging to verify values
    console.log("Request Body:", req.body);

    // Validate required fields
    if (!date || !type || !amount || !currentAmount || !message ) {
      return res.status(400).json({ status: false, message: "Please fill all required fields", wallet: null });
    }


    const newWalletHistory = {
      token,
      date,
      type,
      amount,
      currentAmount,
      message
    };

    const result = await UserModel.createwallethistory(newWalletHistory);

    if (result) {
      return res.status(201).json({ status: true, message: "wallet history created successfully", wallet: newWalletHistory });
    } else {
      return res.status(403).json({ status: false, message: "Failed to create wallet history", wallet: null });
    }

  } catch (error) {
    console.error("Error:", error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ status: false, message: "Invalid or malformed token", wallet: null });
    }
    return res.status(500).json({ status: false, message: "Internal Server Error", wallet: null });
  }
};



exports.getwallethistory = async (req, res) => {
  const authHeader = req.headers.authorization;

  // Check if the Authorization header is present
  if (!authHeader) {
    return res.status(401).json({ status: false, message: "Authorization token is required", walletHistory: null });
  }

  const token = authHeader.split(' ')[1]; // Extract the token part

  // Check if the token is provided
  if (!token) {
    return res.status(401).json({ status: false, message: "Invalid token format", walletHistory: null });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);

    // Check if the token is valid in the database
    const userResult = await UserModel.findByToken(token);
    console.log("User result: ", userResult);

    if (userResult.length === 0) {
      return res.status(401).json({ status: false, message: "Invalid token", walletHistory: null });
    }

    // Fetch the list of tournament games based on the provided category and status
    const walletHistory = await UserModel.callWalletbyToken(token);

    if(walletHistory.length==0){
      return res.status(400).json({ status: false, message: "Have no Any data", walletHistory: null });
    }

     res.status(200).json({ status: true, message: "Data fetched", walletHistory });
     
  } catch (error) {
    // Catch JWT errors (expired, tampered, etc.)
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ status: false, message: "Invalid or expired token", walletHistory: null });
    }

    // Handle any other errors
    console.error("Error stack trace:", error);
    return res.status(500).json({ status: false, message: "Internal Server Error", walletHistory: null });
  }
};






exports.updateWallet = async (req, res) => {
  const authHeader = req.headers.authorization;

  // Check if the Authorization header is present
  if (!authHeader) {
    return res.status(401).json({ status: false, message: "Authorization token is required", walletHistory: null });
  }

  const token = authHeader.split(' ')[1]; // Extract the token part

  // Check if the token is provided
  if (!token) {
    return res.status(401).json({ status: false, message: "Invalid token format", walletHistory: null });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);

    // Check if the token is valid in the database
    const userResult = await UserModel.findByToken(token);
    console.log("User result: ", userResult);

    if (userResult.length === 0) {
      return res.status(401).json({ status: false, message: "Invalid token", walletHistory: null });
    }

    const { wallet, winWallet } = req.body; // Get wallet and winWallet values from request body

    // Validate that both fields are provided
    if (wallet === undefined || winWallet === undefined) {
      return res.status(400).json({ status: "false", message: "Wallet and WinWallet values are required" });
    }

    // Update the wallet and winWallet
    const result = await UserModel.updateWallet(token, wallet, winWallet);

    if (result) {
      return res.status(200).json({ status: "true", message: "Wallet updated successfully" });
    } else {
      return res.status(500).json({ status: "false", message: "Failed to update wallet" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ status: "false", message: "Server error", error: error.message });
  }
};


