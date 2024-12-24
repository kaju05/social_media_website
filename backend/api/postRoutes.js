const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const upload = require('../uploads');
const { generateToken, verifyToken } = require('../utilis/jwtUtils');
const authenticate = require('../authapi/authenticate')
router.get('/comments/:postId', async (req, res) => {
    try {
        const { postId } = req.params;
        console.log(`Fetching comments for postId: ${postId}`);

       
        const comments = await Comment.find({ postId: postId })
            .populate({
                path: 'userId',
                select: 'username', 
            });

        console.log(comments);
        res.status(200).json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching comments' });
    }
});


router.post('/addComment', async (req, res) => {
    const { newComment, loginId, postId } = req.body;
    if (!newComment || !loginId || !postId) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    try {
        const addComment = new Comment({
            comment: newComment,
            userId: loginId,
            postId
        });
        await addComment.save();
        res.status(201).json(addComment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});
router.get('/feed', authenticate, async (req, res) => {
    try {
        const loginId = req.headers['x-login-id'];
        const loggedUser = await User.findById(loginId);
        const following = loggedUser.following;
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        const posts = await Post.find({
            userId: { $in: following }
            // ,time: { $lte: twoDaysAgo }
        }).sort({ time: -1 })
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/:id/allposts', async (req, res) => {
    try {
        const Id = req.params.id;
        const posts = await Post.find({ userId: Id });

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error });
    }
});
router.post('/newpost', authenticate, upload.single('img'), async (req, res) => {
    try {
        const { caption, userId } = req.body;
        const imgPath = req.file ? `../uploads/${req.file.filename}` : null;
        const newPost = new Post({
            img: imgPath,
            caption,
            userId,
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create post' });
    }
});
module.exports = router;