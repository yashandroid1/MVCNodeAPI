const express = require("express");
const router = express.Router();
const { registerUser ,
loginUser , getBanners ,
 getSoloct , getSologame ,
 createSoloGame , updateSoloGame ,
 deleteSoloGame , getTournamentct ,
  getTournamentList , crategamehistory , createwallethistory ,  getwallethistory , updateWallet} = require("../controllers/UsersController");

// router.get("/test",function(){
//     console.log("connected");
// });
// Define routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/banner", getBanners);
router.post("/soloct", getSoloct);
router.post("/sologame", getSologame);
router.post("/createsologame", createSoloGame);
router.post("/opponentcancelacceptsologame", updateSoloGame);
router.post("/matchcancled", deleteSoloGame);
router.post("/gettournamentct", getTournamentct);
router.post("/gettournamentlist", getTournamentList);
router.post("/creategamehistory", crategamehistory);
router.post("/createwallethistory", createwallethistory);
router.post("/getwallethistory", getwallethistory);
router.post("/updatewallet", updateWallet);


module.exports = router;
