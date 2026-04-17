const { Joi } = require('../middlewares/validation');

const optionalUrl = Joi.string().trim().uri({ allowRelative: false }).max(200).allow('').messages({
  'string.uri': 'Enter a valid URL.',
});

const limitedText = (label, max) =>
  Joi.string().trim().max(max).allow('').messages({
    'string.max': `${label} must be at most ${max} characters.`,
  });

const yearSchema = Joi.string().trim().pattern(/^(19|20)\d{2}$/).allow('').messages({
  'string.pattern.base': 'Year must be a valid 4-digit year.',
});

const gpaSchema = Joi.string().trim().pattern(/^(10(\.0{1,2})?|[0-9](\.\d{1,2})?)$/).allow('').messages({
  'string.pattern.base': 'GPA must be between 0 and 10 with up to 2 decimal places.',
});

const experienceSchema = Joi.object({
  company: limitedText('Company', 100),
  position: limitedText('Position', 100),
  location: limitedText('Experience location', 100),
  startDate: limitedText('Start date', 30),
  endDate: limitedText('End date', 30),
  current: Joi.boolean().default(false),
  description: limitedText('Experience description', 500),
});

const educationSchema = Joi.object({
  school: limitedText('School', 100),
  degree: limitedText('Degree', 100),
  field: limitedText('Field of study', 100),
  startYear: yearSchema,
  endYear: yearSchema,
  gpa: gpaSchema,
}).custom((value, helpers) => {
  if (value.startYear && value.endYear && Number(value.endYear) < Number(value.startYear)) {
    return helpers.error('any.custom', { message: 'End year must be greater than or equal to start year.' });
  }

  return value;
}, 'education year validation').messages({
  'any.custom': '{{#message}}',
});

const projectSchema = Joi.object({
  title: limitedText('Project title', 100),
  description: limitedText('Project description', 400),
  link: optionalUrl,
});

const certificationSchema = Joi.object({
  name: limitedText('Certification name', 100),
  issuer: limitedText('Certification issuer', 100),
  date: limitedText('Certification date', 30),
  link: optionalUrl,
});

const resumeSchema = Joi.object({
  title: limitedText('Resume title', 60).default('My Resume'),
  template: Joi.string().valid('modern', 'classic', 'minimal', 'creative').default('modern'),
  personalInfo: Joi.object({
    fullName: Joi.string().trim().max(50).allow('').messages({
      'string.max': 'Full name must be at most 50 characters.',
    }),
    email: Joi.string().trim().email({ tlds: { allow: false } }).max(100).allow('').messages({
      'string.email': 'Enter a valid email address.',
    }),
    phone: Joi.string().trim().pattern(/^\d{10}$/).allow('').messages({
      'string.pattern.base': 'Phone number must contain exactly 10 digits.',
    }),
    location: Joi.string().trim().max(100).allow('').messages({
      'string.max': 'Location must be at most 100 characters.',
    }),
    linkedin: optionalUrl,
    github: optionalUrl,
    website: optionalUrl,
    summary: Joi.string().trim().max(300).allow('').messages({
      'string.max': 'Summary must be at most 300 characters.',
    }),
  }).default({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
    summary: '',
  }),
  education: Joi.array().items(educationSchema).max(10).default([]),
  experience: Joi.array().items(experienceSchema).max(10).default([]),
  skills: Joi.array().items(limitedText('Skill', 40)).max(20).default([]),
  projects: Joi.array().items(projectSchema).max(10).default([]),
  certifications: Joi.array().items(certificationSchema).max(10).default([]),
});

module.exports = {
  resumeSchema,
};
