const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { generateSummary, improveDescription, suggestSkills } = require('../controllers/ai.controller');

const router = express.Router();

router.use(protect); // All AI routes require auth

router.post('/summary', generateSummary);
router.post('/improve-description', improveDescription);
router.post('/suggest-skills', suggestSkills);

module.exports = router;
