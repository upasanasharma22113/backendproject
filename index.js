const path = require('path');
const express = require('express')
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const Blog = require('./models/blog');

const userRoute = require('./routes/user');
const blogRoute = require('./routes/blog');
const { checkForAuthenticationCookie } = require('./middlewares/authentication');

const app = express();
const PORT = 8000;

mongoose.connect('mongodb://localhost:27017/beelog').then((e) => console.log("MongoDB connected"));

app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(checkForAuthenticationCookie('token'));
app.use(express.static(path.resolve('./public')));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));


app.get("/", async(req, res) => {
    const allBlogs = await Blog.find({});
    res.render('home', {
        user: req.user,
        blogs: allBlogs,
    });
});


app.get('/allblogs', async (req, res) => {
    try {
      const allBlogs = await Blog.find({});
      return res.render('blogs.ejs', {
        user: req.user,
        blogs: allBlogs,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
    }
  });


app.get('/about', (req, res) => {
    res.render('about.ejs', {
        user: req.user,
    });
});


app.use('/user', userRoute);
app.use('/blog', blogRoute);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

