'use strict'

const LocalStrategy = require('passport-local').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const TwitterStrategy = require('passport-twitter').Strategy

const User = require('../model/user')

module.exports = function(passport) {
  passport.serializeUser(function(user, done) {
    done(null, user.id)
  })
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user)
    })
  })

  /***** Signups *****/
  // Local
  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
    session: false
  },
  function(req, email, password, done) {
    process.nextTick(function() {
      User.findOne({ 'local.email': email }, function(err, user) {
        if (err) return done(err)
        if (user) return done(null, false, { message: 'User already exists!' })
        else {
          let newUser = new User()
          newUser.local.email = email
          newUser.local.password = newUser.generateHash(password)
          newUser.save(function(err) {
            if (err) throw err;
            return done(null, newUser)
          })
        }
      })
    })
  }))


  /***** Log In *****/
  // Local
  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
    session: false
  },
  function(req, email, password, done) {
    User.findOne({ 'local.email': email }, function(err, user) {
      if (err) return done(err)
      if (!user)
        return done(null, false, { message: 'User doesnt exist!' })
      if (!user.validatePassword(password))
        return done(null, false, { message: 'Wrong password!' })
      else return done(null, user)
    })
  }))
}