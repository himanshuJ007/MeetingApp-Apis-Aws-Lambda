"use strict"
//require mongooes
var mongoose = require('mongoose');


var UserPreferenceSchema = new mongoose.Schema({
    
    Name :{ 
        type: String
    },
    AvailableDate:{
        type :Date
    },
    Preferences : {
        type : String
    } 
});


UserPreferenceSchema.statics.createPreference = function(preference) {
    return UserPreference.create(preference)
    .then(async (docPreference) => {
     // console.log("\n>> Created Preference:\n", docPreference);
      return docPreference;
    }).catch((message)=>{
      console.log("Error Message"+message );
  })
};

var UserPreference = mongoose.model('UserPreference', UserPreferenceSchema);
module.exports = UserPreference;