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

router.get("/books", function (req, res) {
  const books = [
    {
      name: "1984",
      description: "A dystopian novel about surveillance and totalitarianism.",
      image: "https://via.placeholder.com/300x200"
    },
    {
      name: "To Kill a Mockingbird",
      description: "A story of justice and moral growth in the American South.",
      image: "https://via.placeholder.com/300x200"
    },
    {
      name: "The Hobbit",
      description: "An epic fantasy adventure through Middle-earth.",
      image: "https://via.placeholder.com/300x200"
    },
    {
      name: "Pride and Prejudice",
      description: "A classic romance exploring class and character.",
      image: "https://via.placeholder.com/300x200"
    }
  ];

  res.render("books", {
    title: "Books",
    cta: "Discover Timeless Books",
    shortDescription: "Explore a curated list of must-read books",
    books
  });
});

router.get("/movies", function (req, res) {
  const movies = [
    {
      name: "Inception",
      description: "A mind-bending thriller about dreams within dreams.",
      image: "https://via.placeholder.com/300x200"
    },
    {
      name: "The Godfather",
      description: "A cinematic classic exploring family, power, and loyalty.",
      image: "https://via.placeholder.com/300x200"
    },
    {
      name: "The Matrix",
      description: "A hacker discovers the shocking truth about his reality.",
      image: "https://via.placeholder.com/300x200"
    },
    {
      name: "Titanic",
      description: "A tragic love story set aboard a doomed ocean liner.",
      image: "https://via.placeholder.com/300x200"
    }
  ];

  res.render("movies", {
    title: "Movies",
    cta: "Explore Iconic Movies",
    shortDescription: "Dive into a curated list of must-watch films",
    movies
  });
});
module.exports = router;