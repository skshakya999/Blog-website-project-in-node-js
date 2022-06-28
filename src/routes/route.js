const express = require('express');
const router = express.Router();
const Authorize = require('../middleware/auth')

const authorController= require("../controllers/authorController")
const blogController= require("../controllers/blogController")

router.post("/authors", authorController.createAuthor)
router.post("/login", authorController.loginAuthor)


router.post("/blogs",Authorize.authorise,blogController.createBlog)
router.put("/blogs/:blogId",Authorize.authorise, blogController.updateBlog)
router.delete("/blogs/:blogId",Authorize.authorise, blogController.deletePost)
router.delete("/blogs",Authorize.authorise, blogController.deletePostQuery)
router.get("/blogs",Authorize.authorise,blogController.getBlogs)


module.exports = router;