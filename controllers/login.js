const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')
const config = require('../utils/config')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body
  // Check for missing or empty fields
  if (!username || !password || username.trim() === '' || password.trim() === '') {
    return response.status(400).json({ error: 'Missing or empty username or password' });
  }
  const user = await User.findOne({ username })
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.password)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({ error: 'Invalid username or password' })
  }

  const userDTO = {
    username: user.username,
    id: user._id,
  }

  const token = jwt.sign(userDTO, config.JWT_SECRET, { expiresIn: 60 * 60 })
  response.json({ token, username: user.username, name: user.name })
})

module.exports = loginRouter
