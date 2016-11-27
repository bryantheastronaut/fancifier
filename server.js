'use strict'

const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const logger = require('morgan')

const app = express()
const PORT = process.env.API_PORT || 8181

const User = require('./model/user')
const config = require('./config/config')

// Configure server
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(logger('dev'))
app.set('secretKey', config.secret)
mongoose.connect(config.db)
require('./config/passport')(passport)
app.use(passport.initialize())

// Routes
let userRoutes = express.Router()

app.get('/', function(req, res) {
  res.json({ message: 'Welcome to the API' })
})
app.post('/signup', passport.authenticate('local-signup', {
  failureRedirect: '/signup'
}),
function(req, res) {
  let token = jwt.sign(req.body.email, app.get('secretKey'))
  res.json({ message: 'Signup was successful!', token: token })
})
app.post('/login', passport.authenticate('local-login', {
  failureRedirect: '/login'
}),
function(req, res) {
  let token = jwt.sign(req.body.email, app.get('secretKey'))
  res.json({ message: 'Login successful!', token: token })
})
// Authenticated Routes
userRoutes.use(function(req, res, next) {
  let token = req.body.token || req.query.token || req.headers['x-access-token']
  if (token) {
    jwt.verify(token, app.get('secretKey'), function(err, decoded) {
      if (err) return res.json({ message: 'Failed to authenticate user' })
      else req.decoded = decoded
      next()
    })
  } else {
    res.status(403).send({ message: 'No token' })
  }
})

app.use('/user', userRoutes)

// Start the server
app.listen(PORT, () => console.log(`Listening on port ${ PORT }`))