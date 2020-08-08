const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const token = req.session.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({_id: decoded._id, 'tokens.token': token})

    if (!user) {
      throw new Error;
    } 
    req.session.user = user
    next()
  } catch (error) {
    res.render('error', {
      code: 401,
      title: 'Acesso negado! Por favor, faça login!'
    });
    // res.status(401).send({error: "Por favor, faça login!"});
  }
}

module.exports = auth;