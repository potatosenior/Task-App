const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');

const router = new express.Router();

// GET /tasks:sortBy:createdAt:desc
router.get('/tasks', auth, async (req, res) => {
  const params = req.query;
  const match = {};
  const sort = {};

  if (params.completed) {
    match.completed = req.query.completed === 'true';
  }
  if (params.sortBy) {
    const parts = params.sortBy.split(':');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  }

  const options = {
    limit: parseInt(params.limit) || 10,
    skip: parseInt(params.skip) || 0,
    sort
  };
  
  try {
    // const tasks = await Task.find({owner: req.user._id})
    await req.user.populate({
      path: 'tasks',
      match,
      options
    }).execPopulate();

    res.send(req.user.tasks);
  } catch ( error ) {
    res.status(500).send();
  }
});

router.post('/tasks', auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.session.user._id
  });

  try {
    await task.save();

    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOne({_id, owner: req.user._id});

    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch (error) {
    res.status(500).send();
  }
});

router.patch('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;
  const props = Object.keys(req.body);
  const allowedProps = ['description', 'completed'];
  const isValid = props.every(prop => allowedProps.includes(prop));

  if (!isValid) {
    return res.status(400).send({error: 'Existe propriedade(s) inválida(s)'});
  }

  try {
    // const task = await Task.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true});
    const task = await Task.findOne({_id, owner: req.session.user._id});

    if(!task) {
      return res.status(404).send();
    }

    props.forEach( prop => task[prop] = req.body[prop]);

    await task.save();

    res.send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findByIdAndDelete({_id, owner: req.session.user._id});

    if(!task) {
      return res.status(404).send();
    }

    return res.send(task);
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;