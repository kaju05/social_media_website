
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    messageBody: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
