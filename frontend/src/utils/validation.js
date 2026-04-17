export const AUTH_LIMITS = {
  name: 50,
  email: 100,
  password: 20,
};

export const RESUME_LIMITS = {
  title: 60,
  fullName: 50,
  email: 100,
  phone: 10,
  location: 100,
  summary: 300,
  link: 200,
  company: 100,
  position: 100,
  school: 100,
  degree: 100,
  field: 100,
  gpa: 20,
  year: 4,
  description: 500,
  projectDescription: 400,
  skill: 40,
  projectName: 100,
  certification: 100,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{6,20}$/;
const phonePattern = /^\d{10}$/;
const urlPattern = /^https?:\/\/[\w.-]+(?:\.[\w.-]+)+(?:[/?#][^\s]*)?$/i;
const yearPattern = /^(19|20)\d{2}$/;
const gpaPattern = /^(10(\.0{1,2})?|[0-9](\.\d{1,2})?)$/;

export const clampValue = (value, max) => String(value || '').slice(0, max);

export const getErrorMessage = (errors, path) => errors?.[path] || '';

const addError = (errors, path, message) => {
  if (!errors[path]) {
    errors[path] = message;
  }
};

const validateUrlField = (errors, path, value) => {
  if (value && !urlPattern.test(value)) {
    addError(errors, path, 'Enter a valid URL starting with http:// or https://.');
  }
};

export const validateAuthForm = (form, mode = 'login') => {
  const errors = {};

  if (mode === 'register') {
    const name = (form.name || '').trim();
    if (!name) {
      addError(errors, 'name', 'Name is required.');
    } else if (name.length < 2) {
      addError(errors, 'name', 'Name must be at least 2 characters.');
    } else if (name.length > AUTH_LIMITS.name) {
      addError(errors, 'name', `Name must be at most ${AUTH_LIMITS.name} characters.`);
    }
  }

  const email = (form.email || '').trim();
  if (!email) {
    addError(errors, 'email', 'Email is required.');
  } else if (!emailPattern.test(email)) {
    addError(errors, 'email', 'Enter a valid email address.');
  }

  const password = (form.password || '').trim();
  if (!password) {
    addError(errors, 'password', 'Password is required.');
  } else if (mode === 'register' && !passwordPattern.test(password)) {
    addError(errors, 'password', 'Password must be 6-20 characters and include at least one letter and one number.');
  }

  return errors;
};

export const validateResume = (resume) => {
  const errors = {};
  const personal = resume?.personalInfo || {};

  if ((resume?.title || '').length > RESUME_LIMITS.title) {
    addError(errors, 'title', `Title must be at most ${RESUME_LIMITS.title} characters.`);
  }

  if ((personal.fullName || '').length > RESUME_LIMITS.fullName) {
    addError(errors, 'personalInfo.fullName', `Full name must be at most ${RESUME_LIMITS.fullName} characters.`);
  }

  if (personal.email && !emailPattern.test(personal.email)) {
    addError(errors, 'personalInfo.email', 'Enter a valid email address.');
  }

  if (personal.phone && !phonePattern.test(personal.phone)) {
    addError(errors, 'personalInfo.phone', 'Phone number must contain exactly 10 digits.');
  }

  if ((personal.location || '').length > RESUME_LIMITS.location) {
    addError(errors, 'personalInfo.location', `Location must be at most ${RESUME_LIMITS.location} characters.`);
  }

  if ((personal.summary || '').length > RESUME_LIMITS.summary) {
    addError(errors, 'personalInfo.summary', `Summary must be at most ${RESUME_LIMITS.summary} characters.`);
  }

  validateUrlField(errors, 'personalInfo.linkedin', personal.linkedin);
  validateUrlField(errors, 'personalInfo.github', personal.github);
  validateUrlField(errors, 'personalInfo.website', personal.website);

  (resume?.experience || []).forEach((item, index) => {
    if ((item.company || '').length > RESUME_LIMITS.company) {
      addError(errors, `experience.${index}.company`, `Company must be at most ${RESUME_LIMITS.company} characters.`);
    }
    if ((item.position || '').length > RESUME_LIMITS.position) {
      addError(errors, `experience.${index}.position`, `Position must be at most ${RESUME_LIMITS.position} characters.`);
    }
    if ((item.location || '').length > RESUME_LIMITS.location) {
      addError(errors, `experience.${index}.location`, `Location must be at most ${RESUME_LIMITS.location} characters.`);
    }
    if ((item.description || '').length > RESUME_LIMITS.description) {
      addError(errors, `experience.${index}.description`, `Description must be at most ${RESUME_LIMITS.description} characters.`);
    }
  });

  (resume?.education || []).forEach((item, index) => {
    if ((item.school || '').length > RESUME_LIMITS.school) {
      addError(errors, `education.${index}.school`, `School must be at most ${RESUME_LIMITS.school} characters.`);
    }
    if ((item.degree || '').length > RESUME_LIMITS.degree) {
      addError(errors, `education.${index}.degree`, `Degree must be at most ${RESUME_LIMITS.degree} characters.`);
    }
    if ((item.field || '').length > RESUME_LIMITS.field) {
      addError(errors, `education.${index}.field`, `Field of study must be at most ${RESUME_LIMITS.field} characters.`);
    }
    if (item.startYear && !yearPattern.test(item.startYear)) {
      addError(errors, `education.${index}.startYear`, 'Start year must be a valid 4-digit year.');
    }
    if (item.endYear && !yearPattern.test(item.endYear)) {
      addError(errors, `education.${index}.endYear`, 'End year must be a valid 4-digit year.');
    }
    if (item.startYear && item.endYear && Number(item.endYear) < Number(item.startYear)) {
      addError(errors, `education.${index}.endYear`, 'End year must be greater than or equal to start year.');
    }
    if (item.gpa && !gpaPattern.test(item.gpa)) {
      addError(errors, `education.${index}.gpa`, 'GPA must be between 0 and 10 with up to 2 decimal places.');
    }
  });

  (resume?.skills || []).forEach((skill, index) => {
    if ((skill || '').length > RESUME_LIMITS.skill) {
      addError(errors, `skills.${index}`, `Skill must be at most ${RESUME_LIMITS.skill} characters.`);
    }
  });

  if ((resume?.skills || []).length > 20) {
    addError(errors, 'skills', 'Skills can include at most 20 items total.');
  }

  (resume?.projects || []).forEach((item, index) => {
    if ((item.title || '').length > RESUME_LIMITS.projectName) {
      addError(errors, `projects.${index}.title`, `Project title must be at most ${RESUME_LIMITS.projectName} characters.`);
    }
    if ((item.description || '').length > RESUME_LIMITS.projectDescription) {
      addError(errors, `projects.${index}.description`, `Project description must be at most ${RESUME_LIMITS.projectDescription} characters.`);
    }
    validateUrlField(errors, `projects.${index}.link`, item.link);
  });

  return errors;
};

export const hasResumeContent = (resume) => {
  const personal = resume?.personalInfo || {};

  return Boolean(
    (resume?.title || '').trim() ||
    (personal.fullName || '').trim() ||
    (personal.summary || '').trim() ||
    (resume?.experience || []).some((item) => Object.values(item || {}).some((value) => String(value || '').trim())) ||
    (resume?.education || []).some((item) => Object.values(item || {}).some((value) => String(value || '').trim())) ||
    (resume?.skills || []).some((item) => String(item || '').trim()) ||
    (resume?.projects || []).some((item) => Object.values(item || {}).some((value) => String(value || '').trim()))
  );
};
