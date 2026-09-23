const express = require('express');
const menu = require('../data/menu');

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json(menu);
});

module.exports = router;