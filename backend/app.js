const express = require("express");
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const userRoutes = require('./api/userRoutes');
const postRoutes = require('./api/postRoutes');
const chatRoutes = require('./api/chatRoutes');
const http = require('http');
const { Server } = require('socket.io');

require('dotenv').config();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect('mongodb://127.0.0.1:27017/SocialApp')
    .then(() => {
        console.log('db connected successfully');
    })
    .catch(() => {
        console.log('sorry some error occurred');
    });

app.use(userRoutes);
app.use(postRoutes);
app.use(chatRoutes);
app.get('/', (req, res) => {
    res.send("maksad maat bhulna");
});

const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ["GET", "POST"]
    }
});


io.on('connection', (socket) => {
    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
    })
    socket.on('sendMessage', (message, roomId) => {
        io.to(roomId).emit('receiveMessage', message)
    })

});


server.listen(8080, () => {
    console.log("server connected at port 8080");
});
