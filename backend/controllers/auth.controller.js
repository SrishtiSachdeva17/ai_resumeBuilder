const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.register = async (req, res) => {
  const { name, email, password } = req.validated.body;

  try {
    const normalizedEmail = email.toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const user = await User.create({ name, email: normalizedEmail, password });
    const token = signToken(user._id);

    return res.status(201).json({ token, user });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to register right now.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.validated.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ error: 'No account found with this email.' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    const token = signToken(user._id);

    return res.json({ token, user: user.toJSON() });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to log in right now.' });
  }
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};
