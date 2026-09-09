const express = require('express');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: name.trim() },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/watchlist', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('watchlist');
    res.json(user?.watchlist || []);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/watchlist/:movieId', authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { watchlist: req.params.movieId } });
    res.json({ message: 'Added to watchlist' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/watchlist/:movieId', authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $pull: { watchlist: req.params.movieId } });
    res.json({ message: 'Removed from watchlist' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;