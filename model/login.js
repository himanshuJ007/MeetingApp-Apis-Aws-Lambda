var mongoose = require('mongoose');
var Meetings = require('../model/meetings');
var UserPreference= require('../model/userPreference');
var LoginSchema = new mongoose.Schema({
  
  LoginName: {
    type: String
  },  
  Password: {
      type: String
  },
  Meetings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Meetings
      }
    ],

  Preference: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: UserPreference
    }
  ]

});

var Login = mongoose.model('Login', LoginSchema);
module.exports = Login;