var express = require("express");
var router = express.Router();
const upload = require('../config/multer');

//modules
const { getBestRated, getRandomBooks, getRandomMovies, getRandomGames } = require("../modules/home");
const { getContentByTypeAndId } = require("../modules/detail");
const { registerUser } = require("../modules/register");
const { loginUser } = require("../modules/login");
const { validateRegisterInput, validateLoginInput, validateUpdateInput, verifyCurrentPassword } = require("../modules/userValidation");
const { getUserById, checkDuplicateEmail, updateUser, getUserRequests } = require('../modules/user');
const { searchAllContent } = require('../modules/search');
// const { io } = require("../modules/chatroom");


const e = require("express");
const { sql, poolPromise } = require("../config/db");

//toevoegen pagina
const addedItems = []; // tijdelijk opgeslagen inhoud

var requests = []; // Her request: { username, title, description, status }


//user-page
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next(); // login
  }
  res.redirect("/login");
}

router.get('/', async function (req, res) {
  try {
    const bestRatedContent = await getBestRated();
    const randomBooksContent = await getRandomBooks();
    const randomMoviesContent = await getRandomMovies();
    const randomGamesContent = await getRandomGames();
    console.log('Homepage data:', { bestRatedContent, randomBooksContent, randomMoviesContent, randomGamesContent }); // Debug

    res.render('index', {
      title: 'Home',
      banner: '/images/BannerHome.jpg',
      hero: {
        cta: 'Welcome to MediaMate',
        shortDescription: 'Find the best in entertainment'
      },
      bestRatedContent,
      randomBooksContent,
      randomMoviesContent,
      randomGamesContent
    });
  } catch (error) {
    console.error('Error loading homepage content:', error);
    res.status(500).render('index', {
      title: 'Home',
      banner: '/images/BannerHome.jpg',
      hero: {
        cta: 'Welcome to MediaMate',
        shortDescription: 'Find the best in entertainment'
      },
      bestRatedContent: [],
      randomBooksContent: [],
      randomMoviesContent: [],
      randomGamesContent: [],
      error: 'Failed to load content'
    });
  }
});

/* POST search */
router.post('/search', async function (req, res) {
  console.log('POST /search received:', req.body);
  const query = req.body.query?.trim();
  if (!query) {
    console.log('No query provided, redirecting with error');
    return res.redirect('/search?error=Please enter a search query');
  }
  console.log(`Redirecting to /search?query=${encodeURIComponent(query)}`);
  res.redirect(`/search?query=${encodeURIComponent(query)}`);
});

/* GET search results */
router.get('/search', async function (req, res) {
  console.log('GET /search received:', req.query);
  const query = req.query.query?.trim() || '';
  const page = parseInt(req.query.page) || 1;
  const error = req.query.error;

  try {
    let searchResults = [];
    let searchError = error;
    let currentPage = 1;
    let totalPages = 1;

    if (query) {
      const result = await searchAllContent(query, page);
      searchResults = Array.isArray(result.searchResults) ? result.searchResults : [];
      currentPage = result.currentPage;
      totalPages = result.totalPages;
      // Log searchResults details
      console.log('Search Results:', searchResults);
      console.log('Search Results Type:', Array.isArray(searchResults) ? 'Array' : typeof searchResults);
      console.log('Search Results Length:', searchResults.length);
      if (searchResults.length === 0) {
        searchError = 'No results found';
      }
    } else if (!error) {
      searchError = 'Please enter a search query';
    }

    // Log data passed to render
    const renderData = {
      title: 'Search Results',
      searchResults,
      searchQuery: query,
      currentPage,
      totalPages,
      error: searchError,
      range: (start, end) => Array.from({ length: end - start + 1 }, (_, i) => i + start),
      eq: (a, b) => a === b,
      gt: (a, b) => a > b,
      lt: (a, b) => a < b,
      add: (a, b) => a + b,
      subtract: (a, b) => a - b,
      json: (context) => JSON.stringify(context, null, 2) // Added for debug
    };
    console.log('Render Data:', renderData);

    res.render('search', renderData); // Updated to 'search'
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).render('search', { // Updated to 'search'
      title: 'Search Results',
      searchResults: [],
      searchQuery: query,
      currentPage: 1,
      totalPages: 1,
      error: 'Search failed, please try again',
      range: (start, end) => Array.from({ length: end - start + 1 }, (_, i) => i + start),
      eq: (a, b) => a === b,
      gt: (a, b) => a > b,
      lt: (a, b) => a < b,
      add: (a, b) => a + b,
      subtract: (a, b) => a - b,
      json: (context) => JSON.stringify(context, null, 2)
    });
  }
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
router.get("/category/:type/:id", async function (req, res) {
  const { type, id } = req.params;
  const from = req.query.from || "category";

  const itemData = await getContentByTypeAndId(type, parseInt(id));

  if (!itemData) return res.status(404).send("Item not found");

  res.render("content-detail", {
    item: {
      name: itemData.Title,
      description: itemData.Description,
      image: itemData.Image || "/images/placeholder.jpg",
      releaseDate: itemData.ReleaseDate
    },
    title: itemData.Title,
    type,
    from
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

// GET: form
router.get('/create-community', (req, res) => {
  res.render('create-community', {
    title: 'Create Community',
    active: 'create-community',
    error: null
  });
});

// POST: handle form
router.post('/create-community', upload.single('image'), (req, res) => {
  const { name, keywords } = req.body;
  const imageFile = req.file;

  // Check for required fields
  if (!name || !keywords || !imageFile) {
    return res.status(400).render('create-community', {
      title: 'Create Community',
      active: 'create-community',
      error: 'All fields (name, keywords, image) are required.'
    });
  }

  console.log('✅ Community created:');
  console.log('Name:', name);
  console.log('Keywords:', keywords.split(',').map(k => k.trim()));
  console.log('Image file:', imageFile.filename);

  res.send('Community created successfully!');
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
router.get("/login", function (req, res) {
  res.render("login", {
    title: "Login",
    errorMessage: null,
    successMessage: null
  });
});

// Login Page - POST
router.post("/login", async function (req, res) {
  const { username, password } = req.body;

  // Validate inputs
  const validationResult = validateLoginInput(username, password);

  if (!validationResult.isValid) {
    return res.render("login", {
      title: "Login",
      errorMessage: validationResult.error,
      successMessage: null
    });
  }

  try {
    const result = await loginUser(validationResult.trimmedUsername, password);

    if (result.success) {
      // Set session
      req.session.user = result.user; // Store user object in session
      return res.redirect("/");
    } else {
      return res.render("login", {
        title: "Login",
        errorMessage: result.message,
        successMessage: null
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.render("login", {
      title: "Login",
      errorMessage: "Server error during login",
      successMessage: null
    });
  }
});

// Logout
router.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/");
});


// Register Page - GET
router.get("/register", function (req, res) {
  res.render("register", {
    title: "Register",
    errorMessage: null,
    successMessage: null
  });
});

// Register Page - POST
router.post("/register", async function (req, res) {
  const { username, email, password } = req.body;

  // Validate inputs
  const validationResult = validateRegisterInput(username, email, password);

  if (!validationResult.isValid) {
    return res.render("register", {
      title: "Register",
      errorMessage: validationResult.error,
      successMessage: null
    });
  }

  try {
    const result = await registerUser(validationResult.trimmedUsername, validationResult.trimmedEmail, password);

    if (result.success) {
      return res.render("register", {
        title: "Register",
        errorMessage: null,
        successMessage: `Welcome, ${result.user.Username}! Your account has been created.`
      });
    } else {
      return res.render("register", {
        title: "Register",
        errorMessage: result.message,
        successMessage: null
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    return res.render("register", {
      title: "Register",
      errorMessage: "Server error during registration",
      successMessage: null
    });
  }
});

// User Page - GET
router.get("/user", isAuthenticated, async (req, res) => {
  const userResult = await getUserById(req.session.user.UserID);
  if (!userResult.success) {
    return res.status(404).render('error', { message: userResult.message });
  }

  const requestsResult = await getUserRequests(req.session.user.UserID);
  if (!requestsResult.success) {
    return res.status(500).render('error', { message: requestsResult.message });
  }

  res.render("user", {
    title: "Your Profile",
    user: userResult.user,
    requests: requestsResult.requests,
    errors: {},
    successMessage: null,
    inputValues: { email: userResult.user.Email }
  });
});

// User Page - POST (Update Email, Image, Password)
router.post("/user", isAuthenticated, upload.single('image'), async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
  const userID = req.session.user.UserID;

  // Validate inputs
  const validationResult = validateUpdateInput(email, imagePath, newPassword, currentPassword);
  if (!validationResult.isValid) {
    const userResult = await getUserById(userID);
    const requestsResult = await getUserRequests(userID);
    const user = userResult.success ? userResult.user : req.session.user;
    const requests = requestsResult.success ? requestsResult.requests : [];

    return res.render("user", {
      title: "Your Profile",
      user,
      requests,
      errors: validationResult.errors,
      successMessage: null,
      inputValues: { email: validationResult.trimmedEmail || user.Email }
    });
  }

  // Verify current password if updating password
  if (newPassword) {
    const passwordVerification = await verifyCurrentPassword(userID, currentPassword);
    if (!passwordVerification.isValid) {
      const userResult = await getUserById(userID);
      const requestsResult = await getUserRequests(userID);
      const user = userResult.success ? userResult.user : req.session.user;
      const requests = requestsResult.success ? requestsResult.requests : [];

      return res.render("user", {
        title: "Your Profile",
        user,
        requests,
        errors: { currentPassword: passwordVerification.error },
        successMessage: null,
        inputValues: { email: validationResult.trimmedEmail || user.Email }
      });
    }
  }

  // Check for duplicate email
  if (validationResult.trimmedEmail && validationResult.trimmedEmail !== req.session.user.Email) {
    const emailCheck = await checkDuplicateEmail(validationResult.trimmedEmail, userID);
    if (!emailCheck.isUnique) {
      const userResult = await getUserById(userID);
      const requestsResult = await getUserRequests(userID);
      const user = userResult.success ? userResult.user : req.session.user;
      const requests = requestsResult.success ? requestsResult.requests : [];

      return res.render("user", {
        title: "Your Profile",
        user,
        requests,
        errors: { email: emailCheck.message },
        successMessage: null,
        inputValues: { email: validationResult.trimmedEmail }
      });
    }
  }

  // Build update inputs
  const updates = [];
  const inputs = {};
  if (validationResult.trimmedEmail && validationResult.trimmedEmail !== req.session.user.Email) {
    updates.push('Email = @Email');
    inputs.Email = validationResult.trimmedEmail;
  }
  if (imagePath) {
    updates.push('Image = @Image');
    inputs.Image = imagePath;
  }
  if (newPassword) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    updates.push('PasswordHash = @PasswordHash');
    inputs.PasswordHash = hashedPassword;
  }

  // Update user
  const updateResult = await updateUser(userID, updates, inputs);
  if (!updateResult.success) {
    const userResult = await getUserById(userID);
    const requestsResult = await getUserRequests(userID);
    const user = userResult.success ? userResult.user : req.session.user;
    const requests = requestsResult.success ? requestsResult.requests : [];

    return res.render("user", {
      title: "Your Profile",
      user,
      requests,
      errors: { general: updateResult.message },
      successMessage: null,
      inputValues: { email: validationResult.trimmedEmail || user.Email }
    });
  }

  // Update session
  if (inputs.Email) req.session.user.Email = inputs.Email;
  if (inputs.Image) req.session.user.Image = inputs.Image;

  // Fetch updated user data and requests
  const userResult = await getUserById(userID);
  const requestsResult = await getUserRequests(userID);
  const user = userResult.success ? userResult.user : req.session.user;
  const requests = requestsResult.success ? requestsResult.requests : [];

  res.render("user", {
    title: "Your Profile",
    user,
    requests,
    errors: {},
    successMessage: 'Profile updated successfully',
    inputValues: { email: user.Email }
  });
});

    
//GET FavList Page
router.get("/favorites", isAuthenticated, function(req, res)
{
  res.render("fav-list",{
    title: "Favourite"
  });
});



//get add route
router.get("/add", isAuthenticated, function (req, res) {
  res.render("add", {
    title: "Request"
  });
});


//post add route
router.post("/add", isAuthenticated, function (req, res) {
  const { type, title, description, image } = req.body;

  if (!type || !title || !description) {
    return res.render("add", {
      title: "Request",
      errorMessage: "All fields are required."
    });
  }

  requests.push({
    username: req.session.user,
    type,
    title,
    description,
    image,
    status: "Pending"
  });

  res.render("add", {
    title: "Request",
    successMessage: "Your request has been received."
  });

  
});

//admin-panel get
router.get("/admin-panel", isAuthenticated, function (req, res) {


  const requests = [
    {
      requestID: "1", // Added unique ID
      username: "test_user1",
      type: "Bug Report",
      title: "Login button not working",
      description: "Clicking the login button does nothing on Chrome browser.",
      image: "https://example.com/image1.png",
      status: "Pending"
    },
    {
      requestID: "2", // Added unique ID
      username: "test_user2",
      type: "Feature Request",
      title: "Add dark mode",
      description: "A dark mode option would be helpful for night-time browsing.",
      image: "https://example.com/image2.png",
      status: "Pending"
    },
    {
      requestID: "3", // Added unique ID
      username: "test_user3",
      type: "Feedback",
      title: "Great user interface!",
      description: "The new dashboard layout is very intuitive and clean.",
      image: "https://example.com/image3.png",
      status: "Pending"
    },
    {
      requestID: "4", // Added unique ID
      username: "test_user3",
      type: "Feedback",
      title: "Great user interface!",
      description: "The new dashboard layout is very intuitive and clean.",
      image: "https://example.com/image3.png",
      status: "Accepted"
    }
  ];

  const pendingRequests = requests.filter(r => r.status === "Pending");

  res.render("admin-panel", {
    title: "Admin Panel",
    requests: pendingRequests
  });
});

router.get('/admin-panel/:requestID', (req, res) => {

  const requests = [
    {
      requestID: "1", // Added unique ID
      username: "test_user1",
      type: "Book",
      title: "Login button not working",
      description: "Clicking the login button does nothing on Chrome browser.",
      image: "https://example.com/image1.png",
      status: "Pending"
    },
    {
      requestID: "2", // Added unique ID
      username: "test_user2",
      type: "Book",
      title: "Add dark mode",
      description: "A dark mode option would be helpful for night-time browsing.",
      image: "https://example.com/image2.png",
      status: "Pending"
    },
    {
      requestID: "3", // Added unique ID
      username: "test_user3",
      type: "Book",
      title: "Great user interface!",
      description: "The new dashboard layout is very intuitive and clean.",
      image: "https://example.com/image3.png",
      status: "Pending"
    },
    {
      requestID: "4", // Added unique ID
      username: "test_user3",
      type: "Book",
      title: "Great user interface!",
      description: "The new dashboard layout is very intuitive and clean.",
      image: "https://example.com/image3.png",
      status: "Accepted"
    }
  ];

  const requestID = req.params.requestID;
  const foundRequest = requests.find(req => req.requestID === requestID);
  console.log('Request ID:', req.params.requestID, typeof req.params.requestID);
  // Query the database using requestID
  // Example: db.findById(requestID)
  // foundRequest as result
  // Render the page with the request data
  res.render('request-detail', { 
    request: foundRequest 
  });
});
router.post('/admin/edit/:id', async (req, res) => {
  const action = req.body.action;
  const requestId = req.params.id;

  if (action === 'accept') {
    // Update the request
    await Request.findByIdAndUpdate(requestId, {
      type: req.body.type,
      title: req.body.title,
      description: req.body.description,
      image: req.body.image,
      status: 'Accepted' // Update status to Accepted
    });

    res.render('status', {
      message: 'Request Accepted. Redirecting to admin panel...',
      redirect: '/admin-panel'
    });
  }

  if (action === 'decline') {
    // Delete the request
    await Request.findByIdAndDelete(requestId);

    res.render('status', {
      message: 'Request Declined. Redirecting to admin panel...',
      redirect: '/admin-panel'
    });
  }
});


/*GET chatroom */
router.get("/chatroom", async function(req, res) {
  try {
    const pool = await poolPromise;
    const roomResult = await pool.request().query('SELECT RoomID, ChatName FROM Communities');
    const rooms = roomResult.recordset;
    // rooms.forEach(room => {
    //   room.Image = "";
    //   room.members = "";
    // });
    const messagesByRoom = {};
    for (const room of rooms) {
      const msgResult = await pool.request().input('RoomID', sql.Int, room.RoomID).query(`SELECT TOP 50 MessageID, FromUser, Time, Content FROM Messages WHERE RoomID = @RoomID ORDER BY Time DESC`);
      messagesByRoom[room.RoomID] = msgResult.recordset;
    }

  res.render("chatroom", {
    title: "Chatrooms",
    rooms,
    messagesByRoom
  });
} catch (err) {
  console.error('Error loading chatroom', err);
}
});
/*Get test chatroom*/
router.get("/testroom", function(req,res){
  res.render("testroom", {  });
});




module.exports = router;
// module.exports = {sql, poolPromise};