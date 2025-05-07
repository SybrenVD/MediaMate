var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index",
    {
      title: "Home",
      hero: {
        banner: "/images/placeholder.jpg",
        cta: "Welcome to MediaMate",
        shortDescription: "Find the best in entertainment"
      },
      card: {
        title: "Title",
        description: "Description",
        img: "/images/placeholder.jpg"
      }

    });
});


router.get("/category/:type", function (req, res) {
  const { type } = req.params;

  const dataMap = {
    games: {
      title: "Games",
      hero: {cta: "Discover Exciting Games",        banner: "/images/placeholder.jpg",
      shortDescription: "Explore a curated list of top games"},
      card: {
        title: "Title",
        description: "Description",
        img: "/images/placeholder.jpg"
      },
      items: [
        { name: "Halo", description: "A sci-fi FPS with rich lore.", image: "https://via.placeholder.com/300x200" },
        { name: "Zelda", description: "Adventure in a magical world.", image: "https://via.placeholder.com/300x200" },
        { name: "Minecraft", description: "Build and explore endless worlds.", image: "https://via.placeholder.com/300x200" },
        { name: "Super Mario", description: "Classic platforming fun.", image: "https://via.placeholder.com/300x200" }
      ]
    },
    books: {
      title: "Books",
      hero: {cta: "Explore Great Reads",          banner: "/images/placeholder.jpg",
      shortDescription: "Browse a hand-picked list of top books"},
      items: [
        { name: "1984", description: "Dystopian classic by George Orwell.", image: "https://via.placeholder.com/300x200" },
        { name: "Dune", description: "Epic sci-fi adventure.", image: "https://via.placeholder.com/300x200" },
        { name: "The Hobbit", description: "A journey through Middle-earth.", image: "https://via.placeholder.com/300x200" },
        { name: "Harry Potter", description: "Magic and mystery at Hogwarts.", image: "https://via.placeholder.com/300x200" }
      ]
    },
    movies: {
      title: "Movies",
      hero: {cta: "Watch Blockbuster Films",      banner: "/images/placeholder.jpg",
      shortDescription: "Check out the most loved movies"},
      items: [
        { name: "Inception", description: "A mind-bending thriller.", image: "https://via.placeholder.com/300x200" },
        { name: "The Matrix", description: "Enter the digital world.", image: "https://via.placeholder.com/300x200" },
        { name: "Interstellar", description: "Explore space and time.", image: "https://via.placeholder.com/300x200" },
        { name: "The Dark Knight", description: "Gotham's greatest hero.", image: "https://via.placeholder.com/300x200" }
      ]
    }
  };

  const pageData = dataMap[type];

  if (!pageData) {
    return res.status(404).send("Category not found");
  }

  res.render("category", {
    ...pageData
  });
});
module.exports = router;