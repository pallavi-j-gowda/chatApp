const mongoose = require('mongoose');
const msgSchema = new mongoose.Schema(  {
    fromUserId:{type:String},
    message:{type:String},
    toUserId:{type:String} 
    })

  const userSchema=new mongoose.Schema({
    userName:{type:String},
    password:{type:String},
    online:{type:Boolean},
    socketId:{type:String},
  })

const Msg = mongoose.model('msg', msgSchema);
const User=mongoose.model('user',userSchema)
module.exports = {Msg,User}; 