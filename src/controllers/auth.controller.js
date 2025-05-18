import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Assuming your User model is in ../models/User
import asyncHandler from '../middleware/asyncHandler.middleware.js';

const signup = async (req, res) => {
  try {
    const { name, email, password, role, avatarUrl } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'Viewer', // Default role if not provided
      avatarUrl,
    });

    await newUser.save();

    // Return success status
    res.status(201).json({
 type: 'OK',
      message: 'User registered successfully.',
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during signup.' });
  }
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password'); // Select password for comparison

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Update last login time (optional)
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Return user info and token
    res.status(200).json({
      type: 'OK',
      message: 'Logged in successfully.',
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during signin.' });
  }
};
const whoami = async (req, res) => {
  try {

    // User data is attached to the request object by the verifyToken middleware
    res.status(200).json(req.user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during whoami.' });
  }
};

const signupHandler = asyncHandler(signup);
const signinHandler = asyncHandler(signin);
const whoamiHandler = asyncHandler(whoami);

export { signupHandler as signup, signinHandler as signin, whoamiHandler as whoami };