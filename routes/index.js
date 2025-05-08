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
      hero: {cta: "Discover Exciting Games",        banner: "/images/Banner games.webp",
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
      hero: {cta: "Explore Great Reads",          banner: "/images/BookBanner.jpg",
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
      hero: {cta: "Watch Blockbuster Films",      banner: "/images/MovieBanner2.jpg",
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