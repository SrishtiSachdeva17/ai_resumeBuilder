const toTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '');

const normalizeEducation = (item = {}) => ({
  school: toTrimmedString(item.school || item.institution),
  degree: toTrimmedString(item.degree),
  field: toTrimmedString(item.field),
  startYear: toTrimmedString(item.startYear || item.startDate),
  endYear: toTrimmedString(item.endYear || item.endDate),
  gpa: toTrimmedString(item.gpa),
});

const normalizeProject = (item = {}) => ({
  title: toTrimmedString(item.title || item.name),
  description: toTrimmedString(item.description),
  link: toTrimmedString(item.link),
});

const normalizeSkills = (skills = []) => {
  if (!Array.isArray(skills)) {
    return [];
  }

  if (skills.every((item) => typeof item === 'string')) {
    return skills.map(toTrimmedString).filter(Boolean);
  }

  return skills
    .flatMap((item) => (Array.isArray(item?.items) ? item.items : []))
    .map(toTrimmedString)
    .filter(Boolean);
};

const normalizeResumePayload = (payload = {}) => ({
  ...payload,
  education: Array.isArray(payload.education) ? payload.education.map(normalizeEducation) : [],
  skills: normalizeSkills(payload.skills),
  projects: Array.isArray(payload.projects) ? payload.projects.map(normalizeProject) : [],
});

module.exports = {
  normalizeResumePayload,
};
