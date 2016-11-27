'use strict'

const uuid = require('uuid')

module.exports = {
  'secret': uuid.v4(),
  'db': 'mongodb://fancifier:password@ds019836.mlab.com:19836/bryandb'
}