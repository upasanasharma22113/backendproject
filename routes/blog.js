const {Router} = require('express');
const multer = require('multer');
const path = require('path');

const Blog = require('../models/blog');
const Comment = require('../models/comment');

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads/`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage })


router.get('/add-new', (req, res) => {
  return res.render('addBlog', {
    user: req.user,
    });
});

router.post('/search', async(req, res) => {
  const blogs = await Blog.find({title: new RegExp(req.body.search, 'i')});
  return res.render('search', {
    user: req.user,
    blogs,
  });
});

router.post('/filter', async (req, res) => {
  const { category } = req.body;
  const blogs = await Blog.find({ category: category });
  return res.render('filteredBlogs', {
    user: req.user,
    blogs,
  });
});

router.get('/myblog', async (req, res) => {
  try {
    const blogs = await Blog.find({ createdBy: req.user._id });
    return res.render('myBlogs', {
      user: req.user,
      blogs,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
});


router.get('/edit/:id', async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return res.status(404).send('Blog not found');
  }
  return res.render('editBlog', {
    user: req.user,
    blog,
  });
});

router.post('/edit/:id', upload.single('coverImage'), async (req, res) => {
  const { title, body, category } = req.body;
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return res.status(404).send('Blog not found');
  }

  blog.title = title;
  blog.body = body;
  blog.category = category;

  if (req.file) {
    blog.coverImageURL = `/uploads/${req.file.filename}`;
  }

  await blog.save();

  return res.redirect(`/blog/${blog._id}`);
});

router.get('/delete/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await Blog.findByIdAndDelete(id);
    return res.redirect('/');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
});


router.get('/:id', async(req, res) => {
  const blog = await Blog.findById(req.params.id).populate('createdBy');
  const comments = await Comment.find({blogId: req.params.id }).populate('createdBy');
  console.log(blog.createdBy);
  
  
  return res.render('blog', {
    user: req.user,
    blog,
    comments,
  });
})

router.post('/comment/:blogId', async(req, res) => {
  
  const comment = await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});



router.post('/', upload.single('coverImage'), async(req, res) => {
  const {title, body, category} = req.body;
  const blog = await Blog.create({
    body,
    title,
    category,
    createdBy: req.user._id,
    coverImageURL: `/uploads/${req.file.filename}`,
  })

  return res.redirect(`/blog/${blog._id}`);
});





module.exports = router;