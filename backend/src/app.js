const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const authRoutes = require('./routes/auth.routes.js'); 
const menuRouter = require('./routes/menuRouter');
const orderRoutes = require('./routes/order.routes');
const salesRoutes = require('./routes/sales.routes');
const chatbotRoutes = require('./routes/chatbot.routes');
const paymentRoutes = require('./routes/payment.routes');

const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());

// Serve static images
app.use('/imgs', express.static(path.join(__dirname, 'imgs')));

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Canteen APP is running'
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRouter);
app.use('/api/orders', orderRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/chat', chatbotRoutes);
app.use('/api/payment', paymentRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API route not found'
    });
});

module.exports = app;
