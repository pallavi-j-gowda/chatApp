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
        socket.join(data.fromUserId);
        socket.broadcast.to(data.fromUserId).emit('user joined');
    });

    socket.on('message', async (data) => {
        io.emit('new message', {
            message: data.message,toUserId:data.toUserId
        });
    });
});
app.post('/chat', async (req, res, next) => {
    try {
        const {fromUserId,toUserId }= req.body;
    const data = {
        '$or' : [
            { '$and': [
                {
                    'toUserId': toUserId
                },{
                    'fromUserId': fromUserId
                }
            ]
        },{
            '$and': [
                {
                    'toUserId': fromUserId
                }, {
                    'fromUserId': toUserId
                }
            ]
        },
    ]
};
        const user = await Msg.find(data)
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
        fromUserId,
        message,
        toUserId
    } = req.body
    try {
        const userCheck = await Msg.create({
            fromUserId: fromUserId,
            message:message,
            toUserId:toUserId
        });
        res.status(200).json({
            error: false,
            message: "chats Added Successfully",
            response: userCheck
        })
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
        password,
        online,
        socketId
    } = req.body
    try {
            const userInfo = await User.create({
                userName,
            password,
            online,
            socketId
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


server.listen(port, () => {
    console.log(`started on port: ${port}`);
});