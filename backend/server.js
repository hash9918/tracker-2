require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to MongoDB database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/template', require('./routes/template'));
app.use('/api/daylog', require('./routes/daylog'));
app.use('/api/heatmap', require('./routes/heatmap'));

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'StudyTracker backend is running!' });
});

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
