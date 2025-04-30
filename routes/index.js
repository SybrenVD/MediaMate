var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", 
    { 
      title: "Home",
      banner: "/images/placeholder.jpg",


        cta: "Welcome to MediaMate",
        shortDescription: "Find the best in entertainment"

    
      
      
    });
});


module.exports = router;