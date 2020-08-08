const express = require('express');
const path = require('path');
const hbs = require('hbs');
const auth = require("./middleware/auth");
const isLogged = require("./middleware/logged_in");
const session = require('cookie-session')
require('./db/mongoose');

const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');
// require('../helpers/handlebars');

const app = express();
const public_dir = path.join(__dirname, '../public');

// Diretorio estatico
app.use(express.static(public_dir));
app.use(express.json());
app.use(session({
  name: "token",
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000*60*60*24*365 } // milisec / 1 ano
}))

// routers
app.use(userRouter);
app.use(taskRouter);

// set views path (default = views)
const viewsPath = path.join(__dirname, '../templates/views');
const partialsPath = path.join(__dirname, '../templates/partials');

// handlebars engine e local das views, partials
app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath);

app.use("", (req, res, next) => {
  req.logged = !!req.session.user;
  next();
});

app.get('/', isLogged, (req, res) => {
  res.render('index', {
    logged: req.logged
  });
});

app.get('/login', isLogged, (req, res) => {
  res.render('login', {
    logged: req.logged,
    login: true
  });
});

app.get('/register', isLogged, (req, res) => {
  res.render('register', {
    logged: req.logged
  });
});

app.get('/about', (req, res) => {
  res.render('about', {
    logged: req.logged
  });
});

app.get('/account', auth, (req, res) => {
  let user = req.session.user;
  //formata a data para DD/MM/YY
  let date = new Date(user.createdAt);
  let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
  let month = date.getMonth() < 10 ? "0" + date.getMonth() : date.getMonth();

  res.render('account', {
    logged: req.logged,
    user,
    created: day + "/" + month + "/" + date.getFullYear()
  });
});

app.get('/home', auth, async (req, res) => {
  await req.session.user.populate({
    path: 'tasks'
  }).execPopulate();
  // formata a data pra usar no card
  req.session.user.tasks.forEach(task => {
    let date = new Date(task.createdAt);

    let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    let month = date.getMonth() < 10 ? "0" + date.getMonth() : date.getMonth();
    
    task.created = day + "/" + month;
  });

  res.render('home', {
    tasks: req.session.user.tasks,
    logged: req.logged
  });
})

app.get('*', (req, res) => {
  res.render('error', {
    code: 404,
    logged: req.logged,
    title: 'Página não encontrada!'
  });
});

module.exports = app