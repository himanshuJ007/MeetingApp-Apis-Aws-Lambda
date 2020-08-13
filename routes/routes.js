'use strict';
const jwt = require("jsonwebtoken");
const Login = require('../model/login');
const Location = require('../model/location');
const Meetings = require('../model/meetings');
const UserPreference = require('../model/userPreference');
const connectDB = require("../model/connection");
connectDB();

async function verifyToken (event) {
  const bearerHeader = event.headers["Authorization"];

  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    return bearerToken;
    // event.token = bearerToken;
    // console.log("I am here")
  } else {
    return{
      sendStatus:403
    }
  }
}



// ==================================================     Login APIs
module.exports.GetLoginNames = async (event) => {
  let token= verifyToken(event);
  jwt.verify(token, "secretkey",async (err, authData) => {
    if (err) {
      return{
        sendStatus:403
      }
    } else {
      console.log("success")
      var loginNames = []
      let logins = await Login.find({})
      logins.forEach(function show(login) {
     loginNames.push(login.LoginName)
    })
    console.log(loginNames)
    console.log(authData)
  return {
    statusCode: 200,
    body: JSON.stringify(loginNames),
    authdata: JSON.stringify(authData)
  }
    }
  });

  
}
module.exports.GetLoginPassword = async (event) => {
  var password = []
  let logins= await Login.find({ LoginName: event.pathParameters.name })
  logins.forEach(function (login) {
    password.push(login.Password)
  })
  return {
    statusCode: 200,
    body: JSON.stringify(password)
  }
}

module.exports.RegisterUser = async (event) => {
  let body = JSON.parse(event.body);
  var registerData = {
    LoginName: body.LoginName,
    Password: body.Password
  };
  let res;
  console.log(registerData)
  await Login.create(registerData, async function (error, register) {
    if (error) {
      console.log("There is error")
      return {
        statusCode: err.statusCode,
        body: JSON.stringify(err)
      };
    } else {

      jwt.sign({ register }, "secretkey", (err, token) => {
        console.log(token)
        res.json({
          Message: "Welcome",
          token: token,
          user: user,
        });
      });

      console.log(register)
      res = await register;
      
    }
  });

  return {
    statusCode: 200,
    body:JSON.stringify(registerData)
  }
}

module.exports.ResetPassword = async (event) => {
  const LoginName = event.pathParameters.name;
  let body = JSON.parse(event.body);
  const updates = body;
  const options = { new: true };
  const response = await Login.findOneAndUpdate({LoginName:LoginName}, updates, options);
  return {
    statusCode: 200,
    body: JSON.stringify(response)
  }
  
}

// ================================================                Meetings APIs

// ==============  // View Meetings  
module.exports.GetMeetings = async (event) => {
    var meetings = await Login.find({}).populate("Meetings");
    return {
      statusCode: 200,
      body: JSON.stringify(meetings)
    }
}

// =================// Request/ Create  meeting

module.exports.CreateMeetings = async (event) => {
  var uname =event.pathParameters.Uname;
  let body = JSON.parse(event.body);
  var location = await Location.find({Location: body.Location});


  if(location.length>0 && location[0].Availability){

    var meetingData={
    Date : new Date(),
    Location : body.Location

    }

    Login.find({LoginName:uname})
    .exec(async function(err,logins){
        if(err){
            console.error(err);
            return err;
        }
        //prints details of current logged in user 
        console.log(logins);

        // Contains details of current logged in user
        var cur_Uid = logins[0]._id

        // creating new meeting and storing it to variable meeting 
        var meeting = await Meetings.createMeeting(meetingData);

        //  Attaching Participants to Meeting we created above 
        var participants = body.Participants
        participants.forEach(async function(participant){
          meeting = await Meetings.createParticipant(meeting._id,participant);

        })  


        // Attaching new meeting id with  currently logged in user
        await Login.findByIdAndUpdate(cur_Uid,
            { $push: { 
            Meetings: meeting._id 
            }
            },
            { new: true, useFindAndModify: false }
        );
        //Updating Location Availability
        await Location.findOneAndUpdate({Location: body.Location},{Availability: false},{ new: true});
        // Returning Meeting That we create
        //console.log("Meetings=================",meeting)
        
        });

        return {
          statusCode: 200,
          body: JSON.stringify(body)
        }

    }else{
      return {
        statusCode: 200,
        body: JSON.stringify("Location Doesn't Exist OR Not Avilable")
      }
        
    }

}

// ==== cancel meeting 

module.exports.CancelMeetings = async (event) => {
  var meetings = await Login.find({LoginName: event.pathParameters.Uname}).populate("Meetings");
  console.log(meetings)
  var id= meetings[0].Meetings[event.pathParameters.Mid]._id;
  let previousLocation =meetings[0].Meetings[event.pathParameters.Mid].Location;
  var cur_Uid= meetings[0]._id;

  Meetings.deleteOne({ _id: id})
  .then(result => console.log(`Deleted ${result.deletedCount} item.`))
  .catch(err => console.error(`Delete failed with error: ${err}`))

    await Login.findByIdAndUpdate(cur_Uid,
      { $pull: { 
        Meetings:  { _id :cur_Uid}
        }
      },
      {multi: true}
    );
    meetings = await Login.find({LoginName: event.pathParameters.Uname}).populate("Meetings");

    //Updating Location
    var updatedLocation={
      Location : previousLocation,
      Availability : true
    }
    
    await Location.findOneAndUpdate({Location: previousLocation},updatedLocation,options);
    console.log("successessfully Updated location")

    return {
      statusCode: 200,
      body: JSON.stringify(meetings)
    }
}



// ====  update meeting 

module.exports.UpdateMeetings = async (event) => {
  let body = JSON.parse(event.body)
  var location = await Location.find({Location: body.Location});
  console.log(location)  
    var meetings = await Login.find({LoginName: event.pathParameters.Uname}).populate("Meetings");
    console.log(meetings)
    var id= meetings[0].Meetings[event.pathParameters.Mid]._id;
    let previousLocation =meetings[0].Meetings[event.pathParameters.Mid].Location;
    if(location[0].Availability || previousLocation==location[0]){
      const updates = {
          Participants: body.Participants,
          Date : new Date(),
          Location : body.Location 
      };
      const options = {new:true};

      //Updating Availibility of Previous Location if new Location is selected
      if( previousLocation !=location[0]){ 
      var updatedLocation={
          Location : previousLocation,
          Availability : true
      }
      await Location.findOneAndUpdate({Location: previousLocation},updatedLocation,options);
      console.log("successessfully updated previous location")
    }
      
      const response = await Meetings.findByIdAndUpdate(id , updates, options);
      console.log("successessfully updated Meeting")


      return {
        statusCode: 200,
        body: JSON.stringify(response)
      }
      

  }else{
    return {
        statusCode: 200,
        body: JSON.stringify(" Location Doesn't Exist Or NotAvailable")
      }
     
  }

}

//  =======================================================         Location APIs

// =================// Add New Location

module.exports.AddLocation = async (event) => {

  let body = JSON.parse(event.body);
  var location = await Location.find({Location: body.Location});
  console.log(location.length)

  if(location.length==0){
      var LocationData = {
      Location : body.Location,
      Equipment :body.Equipment,
      Availability : true
      };
      await Location.create(LocationData, function (error, location) {
      if (error) {
        console.log("Fail")
         // return next(error);
      } else {
        console.log("success")
         // return res.json(location);
         return {
          statusCode: 200,
          body:JSON.stringify(LocationData)
        }
      }
      });

      return {
        statusCode: 200,
        body:JSON.stringify(LocationData)
      }
  }else{
    return {
      statusCode: 200,
      body:JSON.stringify("Location Already Exist")
    }
  }

  }

// =================// View All Locations

module.exports.GetLocation = async (event) => {
    let locations = await Location.find({})
    return {
      statusCode: 200,
      body:JSON.stringify(locations)
    }
    
}

// =================// Update Locations

// while Updating check availability 
module.exports.UpdateLocation = async (event) => {
  let location = await Location.find({Location: event.pathParameters.Lname});
  let body = JSON.parse(event.body);
  if(location.length>0){
    console.log(location[0].Availability)

      if(location[0].Availability){
          const options = {new:true};
          var updatedLocation={
              Location : body.Location,
              Equipment :body.Equipment,
              Availability : body.Availability
          }
          var result = await Location.findOneAndUpdate({Location: event.pathParameters.Lname},updatedLocation,options);
          console.log("success",result)
          return {
            statusCode: 200,
            body:JSON.stringify(result)
          }
      }else{
        return {
          statusCode: 200,
          body:JSON.stringify("This Location Can't Update Right Now, It is Not Available ")
        }
      }    
  }else{
    return {
      statusCode: 200,
      body:JSON.stringify("No Such Location There ")
    }
  }
}

// =================// Delete Locations

module.exports.DeleteLocation = async (event) => {
  var location = await Location.find({Location: event.pathParameters.Lname});

  if(location.length>0){
    if(location[0].Availability){
    await Location.deleteOne({Location: event.pathParameters.Lname})
    .then(result => console.log(`Deleted ${result.deletedCount} item.`))
    .catch(err => console.error(`Delete failed with error: ${err}`))
    return {
      statusCode: 200,
      body:JSON.stringify(" SuccessFully Deleted ")
    }
    }else{
      return {
      statusCode: 200,
      body:JSON.stringify("This Location Can't Update Right Now, It is Not Available ")
          } 
    }    
  }else{
    return{
      statusCode: 200,
      body:JSON.stringify("No Such Location There ")
    }
  }
}

//  ========================================================         UsePreference APIs


// ===== create preference 

module.exports.CreatePreference = async (event) => {

  var uname =event.pathParameters.Uname;
  let body = JSON.parse(event.body);


      var preferenceData={
          Name : body.Name,
          AvailableDate:body.AvailableDate,
          Preferences : body.Preferences

      }

      Login.find({LoginName:uname})
      .exec(async function(err,logins){
          if(err){
              console.error(err);
              return err;
          }
          //prints details of current logged in user 
          console.log(logins);

          // Contains details of current logged in user
          var cur_Uid = logins[0]._id

          // creating new meeting and storing it to variable meeting 
          var preference = await UserPreference.createPreference(preferenceData);


          // Attaching new meeting id with  currently logged in user
          await Login.findByIdAndUpdate(cur_Uid,
              { $push: { 
              Preference: preference._id 
              }
              },
              { new: true, useFindAndModify: false }
          );

          // Returning Prefrence That we create
          console.log(preference)
          //return res.json(preference);
          });

          return {
            statusCode: 200,
            body:JSON.stringify(preferenceData)
          }
}

// ===== View Preference 

module.exports.GetPreference = async (event) => {

    var preference = await Login.find({LoginName:event.pathParameters.Uname}).populate("Preference").populate("Meetings");
    return {
      statusCode: 200,
      body:JSON.stringify(preference)
    }
}

// ===== Update preference

module.exports.UpdatePreference = async (event) => {
    let body =JSON.parse(event.body);
    var preference = await Login.find({LoginName: event.pathParameters.Uname}).populate("Preference").populate("Meetings");
    //console.log(preference)
    var id= preference[0].Preference[0]._id;

    const updates = {
        Name :body.Name,
        AvailableDate: body.AvailableDate,
        Preferences : body.Preferences
    };
    const options = {new:true};
    const result = await UserPreference.findByIdAndUpdate(id , updates, options);

    return {
      statusCode:200,
      body:JSON.stringify(result)
    } 

}

// ===== Delete Preference 

module.exports.DeletePreference = async (event) => {
    var preference = await Login.find({LoginName: event.pathParameters.Uname}).populate("Preference").populate("Meetings");
        console.log(preference)
        var id= preference[0].Preference[0]._id;
        var cur_Uid= preference[0]._id;


     UserPreference.deleteOne({ _id: id})
    .then(result => console.log(`Deleted ${result.deletedCount} item.`))
    .catch(err => console.error(`Delete failed with error: ${err}`))


      await Login.findByIdAndUpdate(cur_Uid,
        { $pull: { 
        Preference: { _id :cur_Uid}
        }
        },
        {multi: true}
    );
      preference = await Login.find({LoginName: event.pathParameters.Uname}).populate("Preference").populate("Meetings");
      console.log("After===============",preference)
     return {
       statusCode :200,
       body:JSON.stringify(preference)
     }
}