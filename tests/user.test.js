const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const app = require("../src/app");
const User = require("../src/models/user");

const userOneID = new mongoose.Types.ObjectId()
const userOne = {
  _id: userOneID,
  name: "Test",
  email: "user@test.com",
  password: "test123",
  tokens: [{
    token: jwt.sign({_id: userOneID}, process.env.JWT_SECRET)
  }]
}

beforeEach(async () => {
  await User.deleteMany();
  await new User(userOne).save();
});

test('Should singup a new user', async () => {
  const response = await request(app).post('/users')
  .send({
    name: "Test",
    email: "user2@test.com",
    password: "test321"
  })
  .expect(201);

  const user = User.findById(response.body.user._id);
  expect(user).not.toBeNull();
});

test('Should login existing user', async () => {
  await request(app).post('/users/login')
    .send({
      email: userOne.email,
      password: userOne.password
    }).expect(200);
})

test('Should not login nonexisting user', async () => {
  await request(app).post('/users/login')
  .send({
    email: "notauser@hotmail.com",
    password: "nonexist"
  })
  .expect(400);
});

test('Should get user profile', async () => {
  await request(app).get('/users/me')
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should not get user profile', async () => {
  await request(app).get('/users/me')
    .send()
    .expect(401)
});

test('Should delete user profile', async () => {
  await request(app).delete('/users/me')
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should not delete user profile', async () => {
  await request(app).delete('/users/me')
    .send()
    .expect(401)
});

test('Should upload avatar image', async () => {
  await request(app).post('/users/me/avatar')
  .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
  .attach('avatar', 'tests/fixtures/profile-pic.jpg')
  .expect(200)
  
  const user = await User.findById(userOneID);
  expect(user.avatar).toEqual(expect.any(Buffer));
})