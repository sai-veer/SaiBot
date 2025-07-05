import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import ChatSession from '../models/ChatSession.js';
import jwt from 'jsonwebtoken';
import authMiddleware from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });


const router = express.Router();

router.post('/register', upload.single('avatarImage'), async (req, res) => {
  try {
    const { username, password, avatarEmoji } = req.body;
  const avatarType = req.file ? 'image' : 'emoji';
  const avatarUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ error: 'Username already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashed, theme: 'dark', avatarType,
    avatarEmoji,
    avatarUrl });

    // create default session
    const session = await ChatSession.create({ userId: user._id, name: 'Chat 1' });

    // generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(201).json({
      userId: user._id,
      token,
      defaultSessionId: session._id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // ✅ Fetch the user's default session (first created one)
    const defaultSession = await ChatSession.findOne({ userId: user._id });

    res.status(200).json({
      userId: user._id,
      token,
      defaultSessionId: defaultSession?._id,
      theme: user.theme,
      avatarType: user.avatarType,
  avatarUrl: user.avatarUrl,
  avatarEmoji: user.avatarEmoji
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/username', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
     res.json({
      username: user.username,
      avatarEmoji: user.avatarEmoji || null,
      avatarUrl: user.avatarUrl || null // ✅ return the correct field
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch username' });
  }
});

router.put('/theme', authMiddleware, async (req, res) => {
  try {
    const { theme } = req.body;
    if (!['light', 'dark'].includes(theme)) {
      return res.status(400).json({ error: 'Invalid theme value' });
    }

    await User.findByIdAndUpdate(req.userId, { theme });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update theme' });
  }
});


export default router;
