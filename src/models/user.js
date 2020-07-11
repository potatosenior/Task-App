const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Task = require('../models/task');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate(value){
      if (!validator.isEmail(value)){
        throw new Error("Email inválido!")
      }
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
    validate(value){
      if (value.toLowerCase().includes("password")){
        throw new Error("Senha inválida!")
      }
      if (value.length < 6){
        throw new Error("Senha muito curta!")
      }
    },
  },
  tokens: [
    {
      token: {
        type: String,
        required: true
      }
    }
  ],
  avatar: {
    type: Buffer
  }
}, {
  timestamps: true
});

userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  return userObject;
}

userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)

  user.tokens = user.tokens.concat({token});
  await user.save();

  return token;
}

// procura o usuario
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({email});
  if (!user) {
    throw new Error('Nao foi possivel fazer o login.');
  }
  
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Nao foi possivel fazer o login.');
  }
  
  return user;
}

// Deletar as tarefas do usuario quando for removido
userSchema.pre('remove', async function (next) {
  const user = this;

  await Task.deleteMany({owner: user._id});

  next();
})

// hash the password before saving
userSchema.pre('save', async function (next){
  const user = this;

  //verifica se a senha foi modificada
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }

  next();
})
const User = mongoose.model('User', userSchema);

module.exports = User;