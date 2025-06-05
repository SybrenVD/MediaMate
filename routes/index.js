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
const { getCommunities } = require('../modules/community');
const { getCategoryContent } = require("../modules/category");
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

// Homepage GET route
router.get('/', async function (req, res) {
  try {
    const bestRatedContent = await getBestRated();
    const randomBooksContent = await getRandomBooks();
    const randomMoviesContent = await getRandomMovies();
    const randomGamesContent = await getRandomGames();
    res.render('index', {
      title: 'Home',
      banner: '/images/BannerHome.jpg',
      hero: {
        cta: 'Welcome to MediaMate',
        shortDescription: 'Find the best in entertainment'
      },
      searchQuery: '',
      bestRatedContent,
      randomBooksContent,
      randomMoviesContent,
      randomGamesContent
    });
  } catch (error) {
    console.error('Error loading homepage content:', error);
    res.render('index', {
      title: 'Home',
      banner: '/images/BannerHome.jpg',
      hero: {
        cta: 'Welcome to MediaMate',
        shortDescription: 'Find the best in entertainment'
      },
      searchQuery: '',
      bestRatedContent: [],
      randomBooksContent: [],
      randomMoviesContent: [],
      randomGamesContent: [],
      error: 'Failed to load content'
    });
  }
});

// Search POST route
router.post('/search', async function (req, res) {
  console.log('POST /search received:', req.body);
  const query = req.body.query?.trim() || '';
  let genres = [];

  try {
    if (req.body.genres) {
      if (typeof req.body.genres === 'string') {
        // Handle single string or comma-separated string
        genres = req.body.genres.split(',').map(g => g.trim()).filter(g => g);
      } else if (Array.isArray(req.body.genres)) {
        // Handle multiple genres (e.g., genres=value1&genres=value2)
        genres = req.body.genres;
      }
    } else if (req.body['genres[]']) {
      // Handle genres[]=value1&genres[]=value2 (if form uses genres[])
      genres = Array.isArray(req.body['genres[]'])
        ? req.body['genres[]']
        : [req.body['genres[]']];
    }
    if (!Array.isArray(genres)) {
      console.warn('Genres is not an array after parsing:', genres);
      genres = [];
    }
    console.log('Parsed genres:', genres);
  } catch (error) {
    console.error('Error parsing genres:', error.message);
    genres = [];
  }

  const queryParams = new URLSearchParams({ query });
  if (genres.length > 0) {
    queryParams.append('genres', JSON.stringify(genres));
  }
  console.log(`Redirecting to /search?${queryParams.toString()}`);
  res.redirect(`/search?${queryParams.toString()}`);
});

// Search GET route
router.get('/search', async function (req, res) {
  console.log('GET /search received:', req.query);
  const query = req.query.query?.trim() || '';
  let genres = [];
  try {
    genres = req.query.genres ? JSON.parse(req.query.genres) : [];
    if (!Array.isArray(genres)) {
      genres = [];
    }
  } catch (error) {
    console.error('Error parsing genres:', error);
    genres = [];
  }
  const page = parseInt(req.query.page) || 1;
  const error = req.query.error;

  try {
    let searchResults = [];
    let searchError = error;
    let currentPage = 1;
    let totalPages = 1;
    let startPage = 1;
    let endPage = 1;

    // Call searchAllContent for any query or genres
    const result = await searchAllContent(query, page, 40, genres);
    searchResults = Array.isArray(result.searchResults) ? result.searchResults : [];
    currentPage = result.currentPage;
    totalPages = result.totalPages;

    // Pagination logic
    const pageWindow = 2;
    startPage = Math.max(2, currentPage - pageWindow);
    endPage = Math.min(totalPages - 1, currentPage + pageWindow);

    if (currentPage <= 3) {
      startPage = 2;
      endPage = Math.min(5, totalPages - 1);
    }
    if (currentPage >= totalPages - 2) {
      startPage = Math.max(totalPages - 4, 2);
      endPage = totalPages - 1;
    }

    if (searchResults.length === 0) {
      searchError = 'No results found';
    }

    const renderData = {
      title: 'Search Results',
      searchResults,
      searchQuery: query,
      selectedGenres: genres,
      currentPage,
      totalPages,
      startPage,
      endPage,
      error: searchError,
      range: (start, end) => Array.from({ length: end - start + 1 }, (_, i) => i + start),
      eq: (a, b) => a === b,
      gt: (a, b) => a > b,
      lt: (a, b) => a < b,
      add: (a, b) => a + b,
      subtract: (a, b) => a - b,
      json: (context) => JSON.stringify(context, null, 2)
    };
    console.log('Render Data:', renderData);

    res.render('search', renderData);
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).render('search', {
      title: 'Search Results',
      searchResults: [],
      searchQuery: query,
      selectedGenres: genres,
      currentPage: 1,
      totalPages: 1,
      startPage: 1,
      endPage: 1,
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

router.get("/category/:type", async (req, res) => {
  const { type } = req.params;

  const dataMap = {
    games: {
      title: "Games",
      type: "games",
      hero: {
        cta: "Discover Exciting Games",
        banner: "/images/Banner games.webp",
        shortDescription: "Explore a curated list of top games"
      }
    },
    books: {
      title: "Books",
      type: "books",
      hero: {
        cta: "Explore Great Reads",
        banner: "/images/BookBanner.jpg",
        shortDescription: "Browse a hand-picked list of top books"
      }
    },
    movies: {
      title: "Movies",
      type: "movies",
      hero: {
        cta: "Watch Blockbuster Films",
        banner: "/images/MovieBanner2.jpg",
        shortDescription: "Check out the most loved movies"
      }
    }
  };

  const pageData = dataMap[type];
  if (!pageData) {
    return res.status(404).send("Category not found");
  }

  try {
    const items = await getCategoryContent(type);
    console.log(`Items for category "${type}":`, items);

    if (!items || items.length === 0) {
      return res.status(404).send("No items found for this category.");
    }

    res.render("category", {
      title: pageData.title,
      type: pageData.type,
      hero: pageData.hero,
      items
    });
  } catch (err) {
    console.error("Error fetching category content:", err);
    res.status(500).send("Error fetching category content");
  }
});
  
 // Detail page route
router.get("/category/:type/:id", async function (req, res) {
  const { type, id } = req.params;
  const from = type || "category";
  const normalizedType = type.toLowerCase();
  console.log(`Detail page request: type=${type}, id=${id}, from=${from}, normalizedType=${normalizedType}`);

  try {
    if (!['books', 'movies', 'games'].includes(normalizedType)) {
      console.error(`Invalid type: ${normalizedType}`);
      return res.status(400).render('error', { title: 'Invalid Type', error: 'Invalid content type' });
    }

    const itemData = await getContentByTypeAndId(normalizedType, parseInt(id));
    console.log(`Item data: ${JSON.stringify(itemData)}`);

    if (!itemData) {
      console.error(`Item not found: type=${normalizedType}, id=${id}`);
      return res.status(404).render('error', { title: 'Item Not Found', error: 'Item not found' });
    }

    res.render("content-detail", {
      item: {
        name: itemData.Title,
        description: itemData.Description,
        image: itemData.Image || "/images/placeholder.jpg",
        releaseDate: itemData.ReleaseDate
      },
      title: itemData.Title,
      type: normalizedType,
      from
    });
  } catch (error) {
    console.error(`Detail page error: type=${type}, id=${id}, error=${error.message}`);
    res.status(500).render('error', { title: 'Server Error', error: 'Error retrieving item detail' });
  }
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


router.get('/community', async function (req, res) {
  try {
    const communities = await getCommunities();
    res.render('community', {
      title: 'Community',
      communities // gebruik met {{#each communities}} in hbs
    });
  } catch (error) {
    console.error("❌ Community load error:", error);
    res.render('community', {
      title: 'Community',
      error: 'Veriler yüklenemedi.',
      communities: []
    });
  }
});

// GET: form
router.get('/create-community', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  res.render('create-community', {
    title: 'Create Community',
    active: 'create-community',
    error: null
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
//check login
  if (!req.session.user) {
    return res.redirect('/login');
  }
  const RoomID = req.query.RoomID;
  if (!RoomID) {
    return res.status(400).send('Community Not Exists (ㄒoㄒ)');
  }
  try {
    const pool = await poolPromise;
//get Room info
    const roomResult = await pool.request().input('RoomID', sql.Int, RoomID).query('SELECT * FROM Communities WHERE RoomID = @RoomID');
    const room = roomResult.recordset[0];
    if(!room) {
      return res.status(404).send('Community Not Found (ㄒoㄒ)');
    }
    const membersResult = await pool.request().input('RoomID', sql.Int, RoomID).query(`SELECT u.Username, u.Image FROM Favorites f JOIN Users u ON f.UserID = u.UserID WHERE f.RoomID = @RoomID`);
//get his msg
    const messagesResult = await pool.request().input('RoomID', sql.Int, RoomID).query(`SELECT Messages.Content, Messages.Time, Users.Username, Users.Image FROM Messages JOIN Users ON Messages.FromUser = Users.UserID WHERE RoomID = @RoomID ORDER BY Messages.MessageID ASC`);
//get fav-room-list
    const userCommunitiesResult = await pool.request().input('UserID', sql.Int, req.session.user.UserID).query(`SELECT c.RoomID, c.ChatName, c.Image FROM Communities c JOIN Favorites f ON c.RoomID = f.RoomID WHERE f.UserID = @UserID`);
  res.render("chatroom", {
    user: req.session.user,
    currentRoom: {
      room: roomResult.recordset[0],
      members: membersResult.recordset
    },
    rooms: userCommunitiesResult.recordset,
    messages: messagesResult.recordset
  });
} catch (err) {
  console.error('Error loading chatroom', err);
  res.status(500).send('Server Error (ㄒoㄒ)')
}
});
/*Get test chatroom*/
router.get("/testroom", function(req,res){
  res.render("testroom", {  });
});




module.exports = router;
// module.exports = {sql, poolPromise};