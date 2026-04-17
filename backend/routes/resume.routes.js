const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middlewares/validation');
const { resumeSchema } = require('../validators/resume.validator');
const { normalizeResumePayload } = require('../utils/resume');
const {
  getResumes,
  getResume,
  createResume,
  updateResume,
  deleteResume,
} = require('../controllers/resume.controller');

const router = express.Router();

router.use(protect);

router.route('/').get(getResumes).post(validate(resumeSchema), createResume);
router.route('/:id').get(getResume).put(validate(resumeSchema), updateResume).delete(deleteResume);

module.exports = router;
