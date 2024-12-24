const express = require('express');
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const router = express.Router();

router.post('/chat', async (req, res) => {
    const { user1Id, user2Id } = req.body;

    try {
        let chatRoom = await ChatRoom.findOne({
            participants: { $all: [user1Id, user2Id] },
        });

        if (!chatRoom) {
            chatRoom = new ChatRoom({ participants: [user1Id, user2Id] });
            await chatRoom.save();
        }

        res.status(200).json({ chatRoomId: chatRoom._id });
    } catch (error) {
        res.status(500).json({ error: 'Error creating or retrieving chatroom' });
    }
});
router.get('/getMessages/:roomId', async (req, res) => {
    const { roomId } = req.params;

    try {

        const messages = await Message.find({ roomId: roomId }).sort({ createdAt: 1 });
        res.status(200).json({ success: true, messages: messages });
    } catch (error) {

        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/sendMessage', async (req, res) => {
    const { roomId, sender, receiver, messageBody } = req.body;

    try {

        let message = new Message({ roomId, sender, receiver, messageBody });
        await message.save();
        res.status(201).json({ success: true, message: message });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
