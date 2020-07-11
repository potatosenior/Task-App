const mongoose = require('mongoose');

const connection_url = process.env.MONGODB_URL;
// const database_name = 'task-manager';

mongoose.connect(connection_url, { 
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});