const mongoose= require("mongoose")

const URI = "mongodb+srv://himanshu:1234@cluster0.vqdei.mongodb.net/<dbname>?retryWrites=true&w=majority";

const connectDB= async()=>{
    await mongoose.connect(URI,{
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        useFindAndModify: true 
    });
    console.log("DB connected !! . . .")

}

module.exports = connectDB;