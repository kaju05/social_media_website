const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateToken, verifyToken } = require('../utilis/jwtUtils');
const authenticate = require('../authapi/authenticate')
router.get('/:id/followstatus', authenticate, async (req, res) => {
    try {
        const userId = req.params.id;
        const loginId = req.headers['x-login-id'];

        const user = await User.findById(userId).populate('followers following', 'username');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }


        const isFollowing = user.followers.some(follower => follower._id.toString() === loginId);

        // console.log('hi');
        res.status(200).json({ ...user.toObject(), isFollowing });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post('/profile/:id/follow', authenticate, async (req, res) => {
    try {
        // console.log(req.headers['x-login-id']);
        const loginId = req.headers['x-login-id'];
        const userIdToFollow = req.params.id;
        // console.log(userIdToFollow);

        const userToFollow = await User.findById(userIdToFollow);
        const loggedUser = await User.findById(loginId);

        if (!userToFollow || !loggedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        userToFollow.followers.push(loggedUser._id);
        loggedUser.following.push(userToFollow._id);

        await userToFollow.save();
        await loggedUser.save();

        res.status(200).json({ isFollowing: true, message: "Followed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
router.post('/profile/:id/unfollow', authenticate, async (req, res) => {
    try {
        // console.log('hi');
        const loginId = req.headers['x-login-id'];
        const userIdToUnfollow = req.params.id;

        const userToUnfollow = await User.findById(userIdToUnfollow);
        const loggedUser = await User.findById(loginId);

        if (!userToUnfollow || !loggedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Remove the logged-in user from the followers array of the user to unfollow
        userToUnfollow.followers = userToUnfollow.followers.filter(
            followerId => followerId.toString() !== loggedUser._id.toString()
        );

        // Remove the user to unfollow from the following array of the logged-in user
        loggedUser.following = loggedUser.following.filter(
            followingId => followingId.toString() !== userToUnfollow._id.toString()
        );

        await userToUnfollow.save();
        await loggedUser.save();

        res.status(200).json({ isFollowing: false, message: "Unfollowed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


router.get('/profile/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    // console.log('hi');
    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).send('Server error');
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // console.log(user)
        let token = req.headers.authorization?.split(' ')[1];
        if (token) {
            res.send({ token, userId: user._id });
        }
        token = generateToken(user);
        // console.log(token);
        res.send({ token, userId: user._id });
    } catch (err) {
        res.status(500).json({ message: 'Error logging in' });
    }
});
router.get('/followers', authenticate, async (req, res) => {
    try {
        const loginId = req.headers['x-login-id'];
        const user = await User.findById(loginId).populate('followers', 'username _id');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user.followers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching followers' });
    }
});
router.get('/following', authenticate, async (req, res) => {
    try {
        const loginId = req.headers['x-login-id'];
        const user = await User.findById(loginId).populate('following', 'username _id');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user.following);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching followers' });
    }
});
router.get('/allusers', authenticate, async (req, res) => {
    const users = await User.find({});
    // console.log(users)
    res.json(users)
})
router.post('/newuser', async (req, res) => {
    // console.log(req.body);
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'credentials are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email: email, password: hashedPassword });
        await newUser.save();
        // console.log('sorry');
        res.status(201).json({ message: 'User registered' });
    } catch (err) {
        res.status(500).json({ message: 'Error registering user' });
    }
});

module.exports = router;
