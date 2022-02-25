const mongoose = require('mongoose');
const msgSchema = new mongoose.Schema(  {
    userId:[], 
    recieverId: {type:String},
     chats:[{
        roomId:{type:String},
        name: {type:String},
        message:{type:String},
    }],
    

  })

  const userSchema=new mongoose.Schema({
    userName:{type:String},
    email:{type:String},
    phoneNo:{type:String},
    chartId:{type:String},
    roomId:[]
  })

const Msg = mongoose.model('msg', msgSchema);
const User=mongoose.model('user',userSchema)
module.exports = {Msg,User}; 