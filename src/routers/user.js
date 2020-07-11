const express = require('express');
const sharp = require('sharp');
const multer = require('multer');
const User = require('../models/user');
const auth = require("../middleware/auth");
const { sendWelcomeEmail, sendCancelationEmail } = require("../emails/account");

const router = new express.Router();

router.post('/users', async (req, res) => {
  const user = new User(req.body);
  
  try {
    await user.save();
    const token = await user.generateAuthToken();
    sendWelcomeEmail(user.email, user.name);
    res.status(201).send({user, token});
  } catch ( error ) {
    res.status(400).send(error.message);
  }
});

router.get('/users/me', auth, async (req, res) => {
  // esa funcao so vai rodar se o user estiver autenticado
  res.send(req.user);
});

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();

    res.send({user, token});

  } catch (error) {
    res.status(400).send();
  }
});

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)

    await req.user.save();

    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

router.post('/users/logoutALL', auth, async (req, res) => {
  try {
    req.user.tokens = []

    await req.user.save();

    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

router.get('/users/:id', async (req, res) => {
  const _id = req.params.id;

  try {
    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).send();
    }

    res.send(user);
  } catch ( error) {
    res.status(500).send();
  }
});

router.patch('/users/me', auth, async (req, res) => {
  const _id = req.params.id;
  const props = Object.keys(req.body);
  const allowedProps = ['name', 'email', 'password', 'age'];
  const isValid = props.every( prop => allowedProps.includes(prop));

  if (!isValid) {
    return res.status(400).send({error: 'Existe propriedade(s) inválida(s)'});
  }

  try {
    const user = req.user;

    props.forEach( prop => user[prop] = req.body[prop]);

    await user.save()

    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

const upload = multer({
  limits: {
    fileSize: 1*1000000 // 1 MB
  },
  fileFilter(req, file, cb) {
    // verifica se o arquivo é uma imagem atraves da extensao
    if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
      return cb(new Error('Arquivo deve ser uma imagem!'));
    }

    cb(undefined, true);
  }
});

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  const buffer = await sharp(req.file.buffer)
    .resize({width: 250, height: 250})
    .png().toBuffer();

  req.user.avatar = buffer;
  await req.user.save();
  res.send();
}, (error, req, res, next) => {
  // gerencia o erro
  res.status(400);
  if (error.message === "File too large") {
    return res.send({error: "Arquivo muito grande! Tamanho máximo: 1MB"});
  }
  res.send({error: error.message});
});

router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

router.delete('/users/me', auth, async (req, res) => {
  const _id = req.user.id;

  try {
    await req.user.remove();
    sendCancelationEmail(req.user.email, req.user.name);
    return res.send(req.user);
  } catch (error) {
    res.status(500).send();
  }
});

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send();
  }
});

module.exports = router;