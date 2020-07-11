const express = require('express');
const path = require('path');
const hbs = require('hbs');

require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');
// require('../helpers/handlebars');

const app = express();
const port = process.env.PORT;
const public_dir = path.join(__dirname, '../public');

/* app.use((req, res, next) => {
  res.status(503).send('Site em manutenção! Por favor tente mais tarde!');

  next();
}); */

// Diretorio statico
app.use(express.static(public_dir));
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

// set views path (default = views)
// const viewsPath = path.join(__dirname, '../templates/views');
// const partialsPath = path.join(__dirname, '../templates/partials');

// handlebars engine e local das views, partials
// app.set('view engine', 'hbs');
// app.set('views', viewsPath);
// hbs.registerPartials(partialsPath);

app.get('', (req, res) => {
  res.render('index', {
    active: 'index'
  });
});

app.get('*', (req, res) => {
  res.send({
    code: 404,
    title: 'Página não encontrada!'
  });
});

app.listen(port, () => {
  console.log(`Server started on ${process.env.PORT}!`);
});