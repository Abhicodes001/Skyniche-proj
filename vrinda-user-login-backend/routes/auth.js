const { signupUser, loginUser, logOut, authMe } = require('../controllers/authController');

const authRoutes = [
  {
    method: "POST",
    url: "/signup",
    handler: signupUser,
  },
  {
    method: "POST",
    url: "/login",
    handler: loginUser
  },
  {
    method: "POST",
    url: "/logout",
    handler: logOut
  },
  {
    method: "GET",
    url: '/auth/me',
    handler: authMe
  },
];

module.exports = authRoutes;