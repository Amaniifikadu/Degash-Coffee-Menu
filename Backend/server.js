const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');

const connectDB = require('./config/db');
const socket = require('./socket');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const menuitemRoutes = require('./routes/menuitemRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const server = http.createServer(app);

const CLIENT_URL = [
  'http://localhost:5173',
  'https://degash-coffee-menu.vercel.app'
];

// Middleware
app.use(cors({
   origin: CLIENT_URL,
  credentials: true
  }));
app.use(express.json());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Initialize socket.io on top of the same HTTP server
socket.init(server, CLIENT_URL);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/menu-items', menuitemRoutes);
app.use('/api/orders', orderRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Serve React build in production (see client/vite.config.js output -> client/dist)
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
});