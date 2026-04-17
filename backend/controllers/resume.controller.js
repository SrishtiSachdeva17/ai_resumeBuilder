const Resume = require('../models/Resume');
const { normalizeResumePayload } = require('../utils/resume');
const normalizeResumeDocument = (resume) => {
  const normalized = normalizeResumePayload(typeof resume.toObject === 'function' ? resume.toObject() : resume);
  normalized._id = resume._id;
  normalized.user = resume.user;
  normalized.template = resume.template;
  normalized.title = resume.title;
  normalized.personalInfo = resume.personalInfo;
  normalized.experience = resume.experience;
  normalized.certifications = resume.certifications;
  normalized.createdAt = resume.createdAt;
  normalized.updatedAt = resume.updatedAt;
  return normalized;
};

exports.getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort('-updatedAt');
    res.json({ resumes: resumes.map(normalizeResumeDocument) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resumes.' });
  }
};

exports.getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found.' });
    }

    return res.json({ resume: normalizeResumeDocument(resume) });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch resume.' });
  }
};

exports.createResume = async (req, res) => {
  try {
    console.log('REQ BODY:', JSON.stringify(req.body, null, 2));
    const normalizedBody = normalizeResumePayload(req.validated.body);
    console.log('NORMALIZED BODY:', JSON.stringify(normalizedBody, null, 2));
    const resume = new Resume({
      ...normalizedBody,
      user: req.user.id,
    });

    await resume.save();
    console.log('SAVED RESUME:', JSON.stringify(resume, null, 2));
    return res.status(201).json({ resume: normalizeResumeDocument(resume) });
  } catch (error) {
    console.error('Create resume error:', error.message);
    return res.status(500).json({ error: 'Failed to create resume.' });
  }
};

exports.updateResume = async (req, res) => {
  try {
    console.log('REQ BODY:', JSON.stringify(req.body, null, 2));
    const normalizedBody = normalizeResumePayload(req.validated.body);
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      normalizedBody,
      { new: true, runValidators: true }
    );

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found.' });
    }

    return res.json({ resume: normalizeResumeDocument(resume) });
  } catch (error) {
    console.error('Update resume error:', error.message);
    return res.status(500).json({ error: 'Failed to update resume.' });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found.' });
    }

    return res.json({ message: 'Resume deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete resume.' });
  }
};
