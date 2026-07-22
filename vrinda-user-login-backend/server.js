require('dotenv').config();
const fs = require('fs');
const path = require('path');
const fastify = require("fastify")({ logger: true });
const fastifyCors = require("@fastify/cors");
const multipart = require('@fastify/multipart');
const fastifyCookie = require('@fastify/cookie');
const authRoutes = require("./routes/auth");
const userRoutes = require('./routes/users');

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Allow CORS for dev ports
fastify.register(fastifyCors, {
  origin: true,
  credentials: true,
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS']
});

fastify.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET || 'supersecret',
  parseOptions: {}
});

fastify.register(require('@fastify/formbody'));
fastify.register(multipart, { attachFieldsToBody: true });

// Route for serving 'index.html' for paths starting with '/app/'
fastify.get('/app/*', function (req, reply) {
  reply.sendFile("index.html");
});

// Serve static files from 'uploads'
fastify.register(require('@fastify/static'), {
  root: uploadsDir,
  prefix: '/uploads',
  index: false,
  list: true
});

authRoutes.forEach((route) => fastify.route(route));
userRoutes.forEach((route) => fastify.route(route));

// Health check endpoint
fastify.get('/api/health', async (req, reply) => {
  return { status: "ok", message: "Backend API active" };
});

// Port
const PORT = process.env.PORT || 4000;

// Running server
fastify.listen(PORT, "0.0.0.0", (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server is running on port ${PORT}`);
});
