"use strict"
//require mongooes
var mongoose = require('mongoose');
var LocationSchema = new mongoose.Schema({

    Location:{type : String},
    Equipment:  {type : String},
    Availability: {type : Boolean , default:true}
});


var Location = mongoose.model('Location', LocationSchema);
module.exports = Location;