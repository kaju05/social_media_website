const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    comment:{
        type:String,
        require:true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    sentAt: { type: Date, default: Date.now },

});

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
