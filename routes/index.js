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


// router.get("/games", function(req, res, next) {
//   res.render("games", 
//     {
//       title: "Games",
//       banner: "/images/placeholder.jpg",
      
//         shortDescription: "Explore a curated list of top games"
//     });
// });

router.get("/games", function (req, res) {
  const games = [
    {
      name: "Halo",
      description: "A sci-fi FPS with rich lore.",
      image: "https://via.placeholder.com/300x200"
    },
    {
      name: "Zelda",
      description: "Adventure in a magical world.",
      image: "https://via.placeholder.com/300x200"
    },
    {
      name: "Minecraft",
      description: "Build and explore endless worlds.",
      image: "https://via.placeholder.com/300x200"
    },
    {
      name: "Super Mario",
      description: "Classic platforming fun.",
      image: "https://via.placeholder.com/300x200"
    }
  ];

  res.render("games", {
    title: "Games",
    cta: "Discover Exciting Games",
    shortDescription: "Explore a curated list of top games",
    games
  });
});
module.exports = router;