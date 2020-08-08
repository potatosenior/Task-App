// verifica se o usuario ja esta logado

const isLogged = (req, res, next) => {
  try {
    if (req.session.user){
      return res.redirect('/home');
    }
  } catch (error) {
    res.status(500).send();
  }
  next();
}

module.exports = isLogged;