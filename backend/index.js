let express = require('express');
let app = express();
const mongoose = require('mongoose');

var cors = require('cors');
app.use(express.json())
app.use(cors("*"))

let http = require('http');
let server = http.Server(app);

let socketIO = require('socket.io');
let io = socketIO(server);

let {
    Msg,
    User
} = require('./model/chat')
const port = process.env.PORT || 3000;

mongoose.connect('mongodb+srv://databaseuserpallavi:pallavi@democluster.z9lev.mongodb.net/app?authSource=admin&replicaSet=atlas-shqqei-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
    console.log("Connected successfully");
});
io.on('connection', (socket) => {
    socket.on('join', (data) => {
        socket.join(data.room);
        socket.broadcast.to(data.room).emit('user joined');
    });

    socket.on('message', async (data) => {
        io.in(data.room).emit('new message', {
            name: data.name,
            message: data.message
        });
    });
});
app.get('/chat/:userId', async (req, res, next) => {
    try {
        const user = await Msg.findOne({_id:req.params.userId})
        res.status(200).json({
            error: false,
            message: "chat data fecthed Successfully",
            response: user
        })
    } catch (err) {
        next(err)
    }
})
app.post('/add-chat', async (req, res, next) => {
    let {
        userId,
        chats
    } = req.body
    try {
        const userCheck = await Msg.findOne({
            userId: userId
        });
        if (userCheck) {
       let    updateChat = await Msg.findOneAndUpdate({
            userId: userId,
        },  { $push: { chats: chats }},{
            new: true
        })
                res.status(200).json({
                    error: false,
                    message: "chats updated Successfully",
                    response: updateChat
                })
        } else {
            const user = await Msg.create({
                userId,
                chats,
            });

            userId.forEach( async(ele)=>{
              await  User.updateOne({_id:ele},{$set:{
                chartId:user._id
                }})
            })
           

            res.status(200).json({
                error: false,
                message: "chats Added Successfully",
                response: user
            })
        }
    } catch (err) {
        next(err)
    }
})

app.get('/get-user', async (req, res, next) => {
    try {
        const user = await User.find()
        res.status(200).json({
            error: false,
            message: "user data fetched Successfully",
            response: user
        })
    } catch (err) {
        next(err)
    }
})
app.post('/add-user', async (req, res, next) => {
    let {
        userName,
        email,
        phoneNo,
        roomId
    } = req.body
    try {
        const userInfo = await User.insertMany({
            userName,
            email,
            phoneNo,
            roomId
        })
        res.status(200).json({
            error: false,
            message: "user data Added Successfully",
            response: userInfo
        })
    } catch (err) {
        next(err)
    }
});
const addRoom = (roomid, ids) => {
    return new Promise((resolve, reject) => {
        var updataData = []
        ids.forEach(async (element, i) => {
            const userInfo = await User.findByIdAndUpdate({
                _id: element
            }, {
                 $addToSet: { roomId: { $each:[roomid]}}
            }, {
                new: true
            });
            updataData.push(userInfo);
            if (ids.length - 1 == i) {
              resolve(updataData) 
            }
        });


    })
}
app.put('/update-user', async (req, res, next) => {
    try {
        const {
            roomid,
            ids
        } = req.body;
        try {
            let data = await addRoom(roomid, ids);
            res.status(200).json({
                error: false,
                message: "user data Updated Successfully",
                response: data
            })
        } catch (err) {
            next(err)
        }
    } catch (err) {
        next(err)
    }
})
server.listen(port, () => {
    console.log(`started on port: ${port}`);
});