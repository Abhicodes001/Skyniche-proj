const Users = require('../models/users');
const Login = require('../models/login');
const bcrypt = require('bcryptjs');
const { JWT_SECRET } = require("../constants/constant");
const jwt = require("jsonwebtoken");

const invalidatedTokens = new Set();

const signupUser = async (req, res) => {
  try {
    const { name, email, password, role, user_type, profile_pic } = req.body;

    if (!email || !password || !name) {
      return res.status(400).send({ status: 0, message: "Name, email and password are required" });
    }

    const preUser = await Users.getUserByEmail(email);
    if (preUser) {
      return res.status(409).send({ status: 0, message: "User with this email already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const userData = {
      name,
      email,
      password: hashedPassword,
      profile_pic: profile_pic || 'https://example.com/default-avatar.jpg',
      role: role || 'user',
      user_type: user_type || (role === 'admin' ? 1 : 3),
      status: 1,
      timestamp: Math.floor(Date.now() / 1000),
      added_by: 1,
      updated_on: Math.floor(Date.now() / 1000),
    };

    const newUser = await Users.addUser(userData);

    if (newUser) {
      const createdUser = {
        id: newUser,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        user_type: userData.user_type
      };
      res.send({ status: 1, message: 'Registration successful', user: createdUser });
    } else {
      res.status(400).send({ status: 0, message: 'Failed to add user to database' });
    }

  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).send({ status: 0, message: 'Server error during signup' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({ error: 'Email and password are required' });
    }

    const user = await Login.userLogin(email);

    if (!user) {
      return res.status(401).send({ error: 'Invalid email or password' });
    }

    // Verify password with bcryptjs (with fallback to plain text if needed for initial seed)
    let verified = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')) {
      const formattedHash = user.password.replace('$2y$', '$2b$');
      verified = bcrypt.compareSync(password, formattedHash);
    } else {
      verified = (password === user.password);
    }

    if (!verified) {
      return res.status(401).send({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.user_id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    const userData = await Users.getUserById(user.user_id);

    const userResponse = {
      id: user.user_id,
      name: userData ? userData.name : user.name,
      email: userData ? userData.email : user.email,
      role: (userData && userData.role) || user.role || (user.user_type === 1 ? 'admin' : 'user'),
      user_type: (userData && userData.user_type) || user.user_type
    };

    res.status(200).send({
      status: 1,
      message: 'Login successful',
      user: userResponse,
      token
    });

  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).send({ error: 'Server error during authentication' });
  }
};

const authMe = async (req, res) => {
  try {
    const token = req.cookies.accessToken;

    if (!token || invalidatedTokens.has(token)) {
      return res.status(401).send({ message: 'No token provided or token invalidated' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userData = await Users.getUserById(decoded.userId);

    if (!userData) {
      return res.status(404).send({ message: 'User not found' });
    }

    res.send({ user: userData });

  } catch (err) {
    console.error('Auth Me Error:', err);
    res.status(500).send({ message: 'Server error' });
  }
};

const logOut = async (req, res) => {
  try {
    const token = req.cookies.accessToken;

    if (token) {
      invalidatedTokens.add(token);
    }

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      path: '/',
    });

    res.send({ status: 1, message: 'Logout successfully' });

  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).send({ message: 'Server error' });
  }
};

module.exports = {
  signupUser,
  loginUser,
  authMe,
  logOut,
};