var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index",
    {
      title: "Home",
      banner: "/images/BannerHome.jpg",
      hero: {
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
      type: "games", // Add type here
      hero: {
        cta: "Discover Exciting Games",
        banner: "/images/Banner games.webp",
        shortDescription: "Explore a curated list of top games"
      },
      items: [
        {
          id: "halo",
          name: "Halo",
          description: "A sci-fi FPS with rich lore.",
          longDescription: "Halo is a military science fiction franchise centered on a war between humanity and an alliance of aliens known as the Covenant. Known for its storytelling and multiplayer combat.",
          releaseDate: "2001-11-15",
          estimatedTimeToFinish: "10-12 hours",
          developer: "Bungie / 343 Industries",
          image: "/images/Halo.jpg"
        },
        {
          id: "zelda",
          name: "Zelda",
          description: "Adventure in a magical world.",
          longDescription: "The Legend of Zelda is a high-fantasy action-adventure franchise with exploration, puzzle-solving, and epic storytelling set in the land of Hyrule.",
          releaseDate: "1986-02-21",
          estimatedTimeToFinish: "15-20 hours",
          developer: "Nintendo",
          image: "/images/zelda.jpg"
        },
        {
          id: "minecraft",
          name: "Minecraft",
          description: "Build and explore endless worlds.",
          longDescription: "Minecraft is a sandbox video game where players can build and explore virtual worlds made up of blocks. Known for its open-ended gameplay and creative possibilities.",
          releaseDate: "2011-11-18",
          estimatedTimeToFinish: "Endless / Sandbox",
          developer: "Mojang Studios",
          image: "/images/minecraft.jpg"
        },
        {
          id: "super-mario",
          name: "Super Mario",
          description: "Classic platforming fun.",
          longDescription: "Super Mario is a beloved platforming series featuring Mario's adventures to rescue Princess Peach from Bowser. Known for iconic level design and gameplay.",
          releaseDate: "1985-09-13",
          estimatedTimeToFinish: "6-8 hours",
          developer: "Nintendo",
          image: "/images/SuperMario.jpg"
        }
      ]
    },

    books: {
      title: "Books",
      type: "books", // Add type here
      hero: {
        cta: "Explore Great Reads",
        banner: "/images/BookBanner.jpg",
        shortDescription: "Browse a hand-picked list of top books"
      },
      items: [
        {
          id: "1984",
          name: "1984",
          description: "Dystopian classic by George Orwell.",
          longDescription: "1984 is a chilling dystopian novel that critiques totalitarianism and extreme political ideology through the lens of a society under constant surveillance.",
          releaseDate: "1949-06-08",
          author: "George Orwell",
          image: "/images/1984.jpg"
        },
        {
          id: "dune",
          name: "Dune",
          description: "Epic sci-fi adventure.",
          longDescription: "Dune tells the story of Paul Atreides as he navigates a complex interstellar struggle for power and control over the desert planet Arrakis and its valuable spice.",
          releaseDate: "1965-08-01",
          author: "Frank Herbert",
          image: "/images/Dune.jpg"
        },
        {
          id: "the-hobbit",
          name: "The Hobbit",
          description: "A journey through Middle-earth.",
          longDescription: "The Hobbit follows Bilbo Baggins on an epic journey to help a group of dwarves reclaim their homeland from the dragon Smaug. A prelude to the Lord of the Rings.",
          releaseDate: "1937-09-21",
          author: "J.R.R. Tolkien",
          image: "/images/TheHobbit.jpg"
        },
        {
          id: "harry-potter",
          name: "Harry Potter",
          description: "Magic and mystery at Hogwarts.",
          longDescription: "Harry Potter is a fantasy series chronicling a young wizard’s time at Hogwarts and his battle against the dark wizard Voldemort.",
          releaseDate: "1997-06-26",
          author: "J.K. Rowling",
          image: "/images/HarryPotter.jpg"
        }
      ]
    },

    movies: {
      title: "Movies",
      type: "movies", // Add type here
      hero: {
        cta: "Watch Blockbuster Films",
        banner: "/images/MovieBanner2.jpg",
        shortDescription: "Check out the most loved movies"
      },
      items: [
        {
          id: "inception",
          name: "Inception",
          description: "A mind-bending thriller.",
          longDescription: "Inception is a science fiction heist thriller where a skilled thief steals secrets by infiltrating the subconscious. Directed by Christopher Nolan.",
          releaseDate: "2010-07-16",
          length: "2h 28m",
          director: "Christopher Nolan",
          image: "/images/Inception.jpg"
        },
        {
          id: "the-matrix",
          name: "The Matrix",
          description: "Enter the digital world.",
          longDescription: "The Matrix follows Neo, who discovers the reality he knows is a simulation controlled by intelligent machines. A cyberpunk classic.",
          releaseDate: "1999-03-31",
          length: "2h 16m",
          director: "Lana & Lilly Wachowski",
          image: "/images/TheMatrix.jpg"
        },
        {
          id: "interstellar",
          name: "Interstellar",
          description: "Explore space and time.",
          longDescription: "Interstellar follows a team of explorers who travel through a wormhole in space to ensure humanity's survival. A blend of science and emotion.",
          releaseDate: "2014-11-07",
          length: "2h 49m",
          director: "Christopher Nolan",
          image: "/images/Interstellar.jpg"
        },
        {
          id: "the-dark-knight",
          name: "The Dark Knight",
          description: "Gotham's greatest hero.",
          longDescription: "The Dark Knight continues Batman’s fight against crime, introducing the Joker as his greatest adversary in a gritty and acclaimed superhero film.",
          releaseDate: "2008-07-18",
          length: "2h 32m",
          director: "Christopher Nolan",
          image: "/images/TheDarkKnight.jpg"
        }
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

  const dataMap = {
    games: {
      title: "Games",
      type: "games",
      hero: {
        cta: "Discover Exciting Games",
        banner: "/images/Banner games.webp",
        shortDescription: "Explore a curated list of top games"
      },
      items: [
        {
          id: "halo",
          name: "Halo",
          description: "A sci-fi FPS with rich lore.",
          longDescription: "Halo is a military science fiction franchise centered on a war between humanity and an alliance of aliens known as the Covenant. Known for its storytelling and multiplayer combat.",
          releaseDate: "2001-11-15",
          estimatedTimeToFinish: "10-12 hours",
          developer: "Bungie / 343 Industries",
          image: "/images/Halo.jpg"
        },
        {
          id: "zelda",
          name: "Zelda",
          description: "Adventure in a magical world.",
          longDescription: "The Legend of Zelda is a high-fantasy action-adventure franchise with exploration, puzzle-solving, and epic storytelling set in the land of Hyrule.",
          releaseDate: "1986-02-21",
          estimatedTimeToFinish: "15-20 hours",
          developer: "Nintendo",
          image: "/images/zelda.jpg"
        },
        {
          id: "minecraft",
          name: "Minecraft",
          description: "Build and explore endless worlds.",
          longDescription: "Minecraft is a sandbox video game where players can build and explore virtual worlds made up of blocks. Known for its open-ended gameplay and creative possibilities.",
          releaseDate: "2011-11-18",
          estimatedTimeToFinish: "Endless / Sandbox",
          developer: "Mojang Studios",
          image: "/images/minecraft.jpg"
        },
        {
          id: "super-mario",
          name: "Super Mario",
          description: "Classic platforming fun.",
          longDescription: "Super Mario is a beloved platforming series featuring Mario's adventures to rescue Princess Peach from Bowser. Known for iconic level design and gameplay.",
          releaseDate: "1985-09-13",
          estimatedTimeToFinish: "6-8 hours",
          developer: "Nintendo",
          image: "/images/SuperMario.jpg"
        }
      ]
    },
  
    books: {
      title: "Books",
      type: "books",
      hero: {
        cta: "Explore Great Reads",
        banner: "/images/BookBanner.jpg",
        shortDescription: "Browse a hand-picked list of top books"
      },
      items: [
        {
          id: "1984",
          name: "1984",
          description: "Dystopian classic by George Orwell.",
          longDescription: "1984 is a chilling dystopian novel that critiques totalitarianism and extreme political ideology through the lens of a society under constant surveillance.",
          releaseDate: "1949-06-08",
          author: "George Orwell",
          image: "/images/1984.jpg"
        },
        {
          id: "dune",
          name: "Dune",
          description: "Epic sci-fi adventure.",
          longDescription: "Dune tells the story of Paul Atreides as he navigates a complex interstellar struggle for power and control over the desert planet Arrakis and its valuable spice.",
          releaseDate: "1965-08-01",
          author: "Frank Herbert",
          image: "/images/Dune.jpg"
        },
        {
          id: "the-hobbit",
          name: "The Hobbit",
          description: "A journey through Middle-earth.",
          longDescription: "The Hobbit follows Bilbo Baggins on an epic journey to help a group of dwarves reclaim their homeland from the dragon Smaug. A prelude to the Lord of the Rings.",
          releaseDate: "1937-09-21",
          author: "J.R.R. Tolkien",
          image: "/images/TheHobbit.jpg"
        },
        {
          id: "harry-potter",
          name: "Harry Potter",
          description: "Magic and mystery at Hogwarts.",
          longDescription: "Harry Potter is a fantasy series chronicling a young wizard’s time at Hogwarts and his battle against the dark wizard Voldemort.",
          releaseDate: "1997-06-26",
          author: "J.K. Rowling",
          image: "/images/HarryPotter.jpg"
        }
      ]
    },
  
    movies: {
      title: "Movies",
      type: "movies",
      hero: {
        cta: "Watch Blockbuster Films",
        banner: "/images/MovieBanner2.jpg",
        shortDescription: "Check out the most loved movies"
      },
      items: [
        {
          id: "inception",
          name: "Inception",
          description: "A mind-bending thriller.",
          longDescription: "Inception is a science fiction heist thriller where a skilled thief steals secrets by infiltrating the subconscious. Directed by Christopher Nolan.",
          releaseDate: "2010-07-16",
          length: "2h 28m",
          director: "Christopher Nolan",
          image: "/images/Inception.jpg"
        },
        {
          id: "the-matrix",
          name: "The Matrix",
          description: "Enter the digital world.",
          longDescription: "The Matrix follows Neo, who discovers the reality he knows is a simulation controlled by intelligent machines. A cyberpunk classic.",
          releaseDate: "1999-03-31",
          length: "2h 16m",
          director: "Lana & Lilly Wachowski",
          image: "/images/TheMatrix.jpg"
        },
        {
          id: "interstellar",
          name: "Interstellar",
          description: "Explore space and time.",
          longDescription: "Interstellar follows a team of explorers who travel through a wormhole in space to ensure humanity's survival. A blend of science and emotion.",
          releaseDate: "2014-11-07",
          length: "2h 49m",
          director: "Christopher Nolan",
          image: "/images/Interstellar.jpg"
        },
        {
          id: "the-dark-knight",
          name: "The Dark Knight",
          description: "Gotham's greatest hero.",
          longDescription: "The Dark Knight continues Batman’s fight against crime, introducing the Joker as his greatest adversary in a gritty and acclaimed superhero film.",
          releaseDate: "2008-07-18",
          length: "2h 32m",
          director: "Christopher Nolan",
          image: "/images/TheDarkKnight.jpg"
        }
      ]
    }
  };
  
  // Category overview route
  router.get("/category/:type", function (req, res) {
    const { type } = req.params;
    const pageData = dataMap[type];
  
    if (!pageData) {
      return res.status(404).send("Category not found");
    }
  
    res.render("category", {
      title: pageData.title,
      type: pageData.type,
      hero: pageData.hero,
      items: pageData.items
    });
  });
  
  // Detail page route
  router.get("/category/:type/:id", function (req, res) {
    const { type, id } = req.params;
    const pageData = dataMap[type];
  
    if (!pageData) {
      return res.status(404).send("Category not found");
    }
  
    const itemData = pageData.items.find(item => item.id === id);
  
    if (!itemData) {
      return res.status(404).send("Item not found");
    }
  
    res.render("detail", {
      item: itemData,
      title: pageData.title,
      type: pageData.type,
      hero: pageData.hero
    });
  });





router.get("/faq", function (req, res, next) {
  res.render("faq", {
    title: "FAQ",
    cta: "Frequently Asked Questions",
    shortDescription: "Find answers to common questions below",
    faqs: [
      {
        question: "What is MediaMate?",
        answer: "MediaMate is a platform to discover top games, books, and movies."
      },
      {
        question: "Is MediaMate free to use?",
        answer: "Yes, it's completely free to browse and explore content."
      },
      {
        question: "How often is content updated?",
        answer: "New content is added weekly to keep things fresh."
      },
      {
        question: "Can I create an account?",
        answer: "Currently, you can browse without an account. Account features are coming soon."
      },
      {
        question: "How do you choose which media to feature?",
        answer: "We curate content based on popularity, reviews, and community feedback."
      },
      {
        question: "Can I suggest content to be added?",
        answer: "Yes! Reach out via our contact form to suggest games, books, or movies."
      },
      {
        question: "Is MediaMate available on mobile?",
        answer: "Yes, the site is fully responsive and works great on phones and tablets."
      },
      {
        question: "Does MediaMate have ads?",
        answer: "No, we currently do not display any ads on the platform."
      },
      {
        question: "What browsers are supported?",
        answer: "MediaMate works on all modern browsers including Chrome, Firefox, Safari, and Edge."
      },
      {
        question: "Who is behind MediaMate?",
        answer: "MediaMate is built by a small team of developers and media enthusiasts."
      }
    ]
  });
});


// Login Page - GET
router.get("/login", function (req, res) 
{
  res.render("login", {
    title: "Login"
  });
});


// Login Page - POST
router.post("/login", function (req, res) 
{
  const { username, password } = req.body;

  console.log("Login attempt:");
  console.log("Username:", username);
  console.log("Password:", password);


  // Fake Control
  if (username === "admin" && password === "1234") 
    {
    req.session.user = username;
    return res.redirect("/");
    }

   else 
   {
    res.render("login", {
      title: "Login",
      errorMessage: "Invalid username or password"
    });
  }
});

//logout
router.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/");
});



// Register Page - GET

router.get("/register", function (req, res) {
  res.render("register", {
    title: "Register"
  });
});

// Register Page - POST

router.post("/register", function (req, res) {
  const { username, email, password } = req.body;

  console.log("Registration attempt:");
  console.log("Username:", username);
  console.log("Email:", email);
  console.log("Password:", password);

  res.render("register", {
    title: "Register",
    successMessage: `Welcome, ${username}! Your account has been created.`
  });
});



// Contact Page - GET

router.get("/contact", function (req, res) {
  res.render("contact", {
    title: "Contact"
  });
});

// Contact Page - POST

router.post("/contact", function (req, res) 
{
  
  const { name, email, message } = req.body;

  console.log("Contact form submitted:");
  console.log("Name:", name);
  console.log("Email:", email);
  console.log("Message:", message);

  res.render("contact", {
    title: "Contact",
    successMessage: `Thanks for contacting us, ${name}!`
  
});
});

router.get('/community', function (req, res) {
  res.render('community', {
    title: 'Community'
  });
});
    
//GET FavList Page
router.get("/favList",function(req, res){
  res.render("fav-list",{
    title: "Favourite"
  });
});

//toevoegen pagina
const addedItems = []; // tijdelijk opgeslagen inhoud

//get add route
router.get("/add", function (req, res) {
  res.render("add", {
    title: "Toevoegen"
  });
});


//post add route
router.post("/add", function (req, res) {
  const { type, title, description, image } = req.body;

  if (!type || !title || !description) {
    return res.render("add", {
      title: "Add",
      errorMessage: "All fields are required."
    });
  }


  addedItems.push({ type, title, description, image });
  console.log("New item added:", { type, title, description, image });

  res.render("add", {
    title: "Add",
    successMessage: `The ${type} "${title}" was added successfully!`
  });
});
module.exports = router;