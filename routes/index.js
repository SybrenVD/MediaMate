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


module.exports = router;