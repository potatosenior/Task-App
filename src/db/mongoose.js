const mongoose = require('mongoose');

const connection_url = process.env.MONGODB_URL;

mongoose.connect(connection_url, { 
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
}).then(() => console.log("Banco de dados conectado!"))