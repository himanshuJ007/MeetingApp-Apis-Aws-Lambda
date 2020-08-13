"use strict"
//require mongooes
var mongoose = require('mongoose');
var Meetings = require('../model/meetings');

var MeetingsSchema = new mongoose.Schema({
        

Participants : [],
Date : {type: Date},
Location:{type : String}
    
});

MeetingsSchema.statics.createMeeting = function(meeting) {
    return Meetings.create(meeting)
    .then(async (docMeeting) => {
     // console.log("\n>> Created Meeting:\n", docMeeting);
      return docMeeting;
    }).catch((message)=>{
      console.log("Messacge"+message );
  })
};


MeetingsSchema.statics.createParticipant = function(meetingId, participant) {
    //console.log("\n>> Add Participant:\n", participant);
    return Meetings.findByIdAndUpdate(
      meetingId,
      {
        $push: {
          Participants: participant
        }
      },
      { new: true, useFindAndModify: false }
    ).catch((message)=>{
      console.log("Error Message "+message );
  })
};



var Meetings = mongoose.model('Meeting', MeetingsSchema);
module.exports = Meetings;