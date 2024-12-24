const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    time: {
        type: Date,
        default: Date.now
    },
    likes: {
        type: Number,
        default: 0
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    img: {
        type: String,
        required: true
    },
    caption: {
        type: String,
        required: false
    }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;