const bcrypt = require('bcryptjs');

const func = async () => {
  const pass = 'joao123';
  const hashed = await bcrypt.hash(pass, 8);

  console.log(pass);
  console.log(hashed);

  const isMatch = await bcrypt.compare('joao123', hashed);
  console.log(isMatch);
}

func();