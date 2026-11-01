const express = require('express');
const router = express.Router();
const { chatWithBot } = require('../controllers/chatbot.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// POST /api/chat — Real AI chatbot with Gemini & live menu knowledge (Authenticated users)
router.post('/', protect, authorize('customer', 'admin'), chatWithBot);

module.exports = router;

