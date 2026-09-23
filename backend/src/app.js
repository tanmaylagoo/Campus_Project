const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth.routes.js'); 

const app = express();
const menuRouter = require('./routes/menuRouter');

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

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Canteen APP is running'
    });
});


app.use('/api/auth', authRoutes);

app.use('/api/menu', menuRouter);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API route not found'
    });
});





module.exports = app;