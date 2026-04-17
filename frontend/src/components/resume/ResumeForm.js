import React, { useMemo, useRef, useState } from 'react';
import { FiPlus, FiTrash2, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useResume } from '../../context/ResumeContext';
import api from '../../utils/api';
import { clampValue, getErrorMessage, RESUME_LIMITS } from '../../utils/validation';

const tabs = ['personal', 'experience', 'education', 'skills', 'projects'];

export default function ResumeForm({ activeTab, setActiveTab, errors, showErrors }) {
  const { currentResume, updateCurrentResume } = useResume();
  const [aiLoading, setAiLoading] = useState({});
  const [touched, setTouched] = useState({});
  const aiLocks = useRef({});

  const visibleError = (path) => ((showErrors || touched[path]) ? getErrorMessage(errors, path) : '');
  const visibleGroupError = (prefix) => {
    if (!showErrors && !Object.keys(touched).some((path) => path.startsWith(prefix))) {
      return '';
    }

    const match = Object.entries(errors || {}).find(([path]) => path.startsWith(prefix));
    return match ? match[1] : '';
  };

  const markTouched = (path) => setTouched((previous) => ({ ...previous, [path]: true }));
  const setAI = (key, value) => setAiLoading((previous) => ({ ...previous, [key]: value }));

  const withAiGuard = async (key, callback) => {
    if (aiLocks.current[key]) {
      return;
    }

    aiLocks.current[key] = true;
    setTimeout(() => {
      delete aiLocks.current[key];
    }, 1200);

    await callback();
  };

  const updatePersonal = (field, value) =>
    updateCurrentResume({
      personalInfo: {
        ...currentResume.personalInfo,
        [field]: value,
      },
    });

  const updateListItem = (key, index, field, value) => {
    const list = [...(currentResume[key] || [])];
    list[index] = { ...list[index], [field]: value };
    updateCurrentResume({ [key]: list });
  };

  const removeListItem = (key, index) => {
    const list = [...(currentResume[key] || [])];
    list.splice(index, 1);
    updateCurrentResume({ [key]: list });
  };

  const totalSkills = useMemo(() => (currentResume.skills || []).length, [currentResume.skills]);

  const handleGenerateSummary = async () => {
    await withAiGuard('summary', async () => {
      setAI('summary', true);

      try {
        const skillsList = currentResume.skills || [];
        const experience = (currentResume.experience || []).map((item) => `${item.position} at ${item.company}`).join(', ');
        const education = (currentResume.education || []).map((item) => `${item.degree} from ${item.school}`).join(', ');
        const { data } = await api.post('/ai/summary', {
          name: currentResume.personalInfo?.fullName,
          title: currentResume.experience?.[0]?.position || 'Professional',
          skills: skillsList,
          experience,
          education,
        });
        updatePersonal('summary', clampValue(data.summary, RESUME_LIMITS.summary));
        toast.success('Summary generated.');
      } catch (error) {
        toast.error('AI summary is unavailable right now.');
      } finally {
        setAI('summary', false);
      }
    });
  };

  const handleImproveDescription = async (index) => {
    const experience = currentResume.experience?.[index];

    if (!experience?.description) {
      toast.error('Add a description first.');
      return;
    }

    await withAiGuard(`exp-${index}`, async () => {
      setAI(`exp-${index}`, true);

      try {
        const { data } = await api.post('/ai/improve-description', {
          description: experience.description,
          position: experience.position,
          company: experience.company,
        });
        updateListItem('experience', index, 'description', clampValue(data.improved, RESUME_LIMITS.description));
        toast.success('Description improved.');
      } catch (error) {
        toast.error('AI improvement is unavailable right now.');
      } finally {
        setAI(`exp-${index}`, false);
      }
    });
  };

  const handleSuggestSkills = async () => {
    await withAiGuard('skills', async () => {
      setAI('skills', true);

      try {
        const role = currentResume.experience?.[0]?.position || 'Software Developer';
        const existingSkills = currentResume.skills || [];
        const { data } = await api.post('/ai/suggest-skills', { role, existingSkills });
        const availableSlots = Math.max(20 - totalSkills, 0);
        const nextSkills = data.skills.slice(0, availableSlots).map((skill) => clampValue(skill, RESUME_LIMITS.skill));

        if (nextSkills.length === 0) {
          toast.error('Skill limit reached. Remove a few skills first.');
          return;
        }

        updateCurrentResume({
          skills: [...(currentResume.skills || []), ...nextSkills],
        });
        toast.success(`${nextSkills.length} skills suggested.`);
      } catch (error) {
        toast.error('AI skill suggestions are unavailable right now.');
      } finally {
        setAI('skills', false);
      }
    });
  };

  const renderInput = ({ label, value, onChange, path, placeholder, maxLength, className = '', type = 'text', errorOverride }) => (
    <div className={className}>
      <label className="mb-1 block text-xs text-gray-500">{label}</label>
      <input
        type={type}
        className={`input-field text-sm ${(errorOverride || visibleError(path)) ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/20' : ''}`}
        placeholder={placeholder || label}
        value={value || ''}
        maxLength={maxLength}
        onBlur={() => markTouched(path)}
        onChange={onChange}
      />
      {(errorOverride || visibleError(path)) ? <p className="mt-1 text-xs text-red-400">{errorOverride || visibleError(path)}</p> : null}
    </div>
  );

  const renderTextarea = ({ label, value, onChange, path, placeholder, maxLength, rows = 4 }) => (
    <div>
      {label ? <label className="mb-1 block text-xs text-gray-500">{label}</label> : null}
      <textarea
        rows={rows}
        className={`input-field text-sm resize-none ${visibleError(path) ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/20' : ''}`}
        placeholder={placeholder || label}
        value={value || ''}
        maxLength={maxLength}
        onBlur={() => markTouched(path)}
        onChange={onChange}
      />
      <div className="mt-1 flex items-center justify-between gap-3">
        <p className="text-xs text-gray-500">{(value || '').length}/{maxLength}</p>
        {visibleError(path) ? <p className="text-xs text-red-400">{visibleError(path)}</p> : null}
      </div>
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 overflow-x-auto border-b border-border px-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium capitalize transition-colors ${
              activeTab === tab ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-6">
        {activeTab === 'personal' ? (
          <>
            <p className="section-label">Personal Information</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {renderInput({
                label: 'Full Name',
                value: currentResume.personalInfo?.fullName,
                path: 'personalInfo.fullName',
                maxLength: RESUME_LIMITS.fullName,
                className: 'md:col-span-2',
                onChange: (event) => updatePersonal('fullName', clampValue(event.target.value, RESUME_LIMITS.fullName)),
              })}
              {renderInput({
                label: 'Email',
                value: currentResume.personalInfo?.email,
                path: 'personalInfo.email',
                maxLength: RESUME_LIMITS.email,
                type: 'email',
                onChange: (event) => updatePersonal('email', clampValue(event.target.value, RESUME_LIMITS.email)),
              })}
              {renderInput({
                label: 'Phone',
                value: currentResume.personalInfo?.phone,
                path: 'personalInfo.phone',
                maxLength: RESUME_LIMITS.phone,
                onChange: (event) => updatePersonal('phone', event.target.value.replace(/\D/g, '').slice(0, RESUME_LIMITS.phone)),
              })}
              {renderInput({
                label: 'Location',
                value: currentResume.personalInfo?.location,
                path: 'personalInfo.location',
                maxLength: RESUME_LIMITS.location,
                className: 'md:col-span-2',
                onChange: (event) => updatePersonal('location', clampValue(event.target.value, RESUME_LIMITS.location)),
              })}
              {renderInput({
                label: 'LinkedIn',
                value: currentResume.personalInfo?.linkedin,
                path: 'personalInfo.linkedin',
                maxLength: RESUME_LIMITS.link,
                onChange: (event) => updatePersonal('linkedin', clampValue(event.target.value, RESUME_LIMITS.link)),
              })}
              {renderInput({
                label: 'GitHub',
                value: currentResume.personalInfo?.github,
                path: 'personalInfo.github',
                maxLength: RESUME_LIMITS.link,
                onChange: (event) => updatePersonal('github', clampValue(event.target.value, RESUME_LIMITS.link)),
              })}
              {renderInput({
                label: 'Website',
                value: currentResume.personalInfo?.website,
                path: 'personalInfo.website',
                maxLength: RESUME_LIMITS.link,
                className: 'md:col-span-2',
                onChange: (event) => updatePersonal('website', clampValue(event.target.value, RESUME_LIMITS.link)),
              })}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs text-gray-500">Professional Summary</label>
                <button
                  onClick={handleGenerateSummary}
                  disabled={aiLoading.summary}
                  className="flex items-center gap-1 text-xs text-primary-500 transition-colors hover:text-primary-400 disabled:opacity-50"
                >
                  <FiZap size={11} /> {aiLoading.summary ? 'Generating...' : 'AI Generate'}
                </button>
              </div>
              {renderTextarea({
                label: '',
                value: currentResume.personalInfo?.summary,
                path: 'personalInfo.summary',
                maxLength: RESUME_LIMITS.summary,
                rows: 5,
                placeholder: 'A short summary about your experience and strengths.',
                onChange: (event) => updatePersonal('summary', clampValue(event.target.value, RESUME_LIMITS.summary)),
              })}
            </div>
          </>
        ) : null}

        {activeTab === 'experience' ? (
          <>
            <div className="flex items-center justify-between">
              <p className="section-label mb-0">Work Experience</p>
              <button
                onClick={() => updateCurrentResume({
                  experience: [
                    ...(currentResume.experience || []),
                    { company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '' },
                  ],
                })}
                className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-400"
              >
                <FiPlus size={12} /> Add
              </button>
            </div>

            {(currentResume.experience || []).map((item, index) => (
              <div key={index} className="space-y-3 rounded-lg border border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <span className="text-safe text-sm font-medium text-gray-300">{item.position || `Experience ${index + 1}`}</span>
                  <button onClick={() => removeListItem('experience', index)} className="text-gray-600 transition-colors hover:text-red-400">
                    <FiTrash2 size={13} />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {renderInput({
                    label: 'Job Title',
                    value: item.position,
                    path: `experience.${index}.position`,
                    maxLength: RESUME_LIMITS.position,
                    onChange: (event) => updateListItem('experience', index, 'position', clampValue(event.target.value, RESUME_LIMITS.position)),
                  })}
                  {renderInput({
                    label: 'Company',
                    value: item.company,
                    path: `experience.${index}.company`,
                    maxLength: RESUME_LIMITS.company,
                    onChange: (event) => updateListItem('experience', index, 'company', clampValue(event.target.value, RESUME_LIMITS.company)),
                  })}
                  {renderInput({
                    label: 'Location',
                    value: item.location,
                    path: `experience.${index}.location`,
                    maxLength: RESUME_LIMITS.location,
                    onChange: (event) => updateListItem('experience', index, 'location', clampValue(event.target.value, RESUME_LIMITS.location)),
                  })}
                  {renderInput({
                    label: 'Start Date',
                    value: item.startDate,
                    path: `experience.${index}.startDate`,
                    maxLength: 30,
                    onChange: (event) => updateListItem('experience', index, 'startDate', clampValue(event.target.value, 30)),
                  })}
                  {renderInput({
                    label: 'End Date',
                    value: item.endDate,
                    path: `experience.${index}.endDate`,
                    maxLength: 30,
                    onChange: (event) => updateListItem('experience', index, 'endDate', clampValue(event.target.value, 30)),
                  })}
                </div>

                <label className="flex items-center gap-2 pt-1 text-xs text-gray-400">
                  <input
                    type="checkbox"
                    checked={item.current || false}
                    onChange={(event) => updateListItem('experience', index, 'current', event.target.checked)}
                    className="accent-primary-500"
                  />
                  Currently working here
                </label>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs text-gray-500">Description</label>
                    <button
                      onClick={() => handleImproveDescription(index)}
                      disabled={aiLoading[`exp-${index}`]}
                      className="flex items-center gap-1 text-xs text-primary-500 transition-colors hover:text-primary-400 disabled:opacity-50"
                    >
                      <FiZap size={11} /> {aiLoading[`exp-${index}`] ? 'Improving...' : 'AI Improve'}
                    </button>
                  </div>
                  {renderTextarea({
                    label: '',
                    value: item.description,
                    path: `experience.${index}.description`,
                    maxLength: RESUME_LIMITS.description,
                    placeholder: 'Describe your responsibilities and achievements.',
                    onChange: (event) => updateListItem('experience', index, 'description', clampValue(event.target.value, RESUME_LIMITS.description)),
                  })}
                </div>
              </div>
            ))}

            {(currentResume.experience || []).length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-600">No experience added yet.</p>
            ) : null}
          </>
        ) : null}

        {activeTab === 'education' ? (
          <>
            <div className="flex items-center justify-between">
              <p className="section-label mb-0">Education</p>
              <button
                onClick={() => updateCurrentResume({
                  education: [
                    ...(currentResume.education || []),
                    { school: '', degree: '', field: '', startYear: '', endYear: '', gpa: '' },
                  ],
                })}
                className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-400"
              >
                <FiPlus size={12} /> Add
              </button>
            </div>

            {(currentResume.education || []).map((item, index) => (
              <div key={index} className="space-y-3 rounded-lg border border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <span className="text-safe text-sm font-medium text-gray-300">{item.school || `Education ${index + 1}`}</span>
                  <button onClick={() => removeListItem('education', index)} className="text-gray-600 transition-colors hover:text-red-400">
                    <FiTrash2 size={13} />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {renderInput({
                    label: 'School',
                    value: item.school,
                    path: `education.${index}.school`,
                    maxLength: RESUME_LIMITS.school,
                    className: 'md:col-span-2',
                    onChange: (event) => updateListItem('education', index, 'school', clampValue(event.target.value, RESUME_LIMITS.school)),
                  })}
                  {renderInput({
                    label: 'Degree',
                    value: item.degree,
                    path: `education.${index}.degree`,
                    maxLength: RESUME_LIMITS.degree,
                    onChange: (event) => updateListItem('education', index, 'degree', clampValue(event.target.value, RESUME_LIMITS.degree)),
                  })}
                  {renderInput({
                    label: 'Field of Study',
                    value: item.field,
                    path: `education.${index}.field`,
                    maxLength: RESUME_LIMITS.field,
                    onChange: (event) => updateListItem('education', index, 'field', clampValue(event.target.value, RESUME_LIMITS.field)),
                  })}
                  {renderInput({
                    label: 'Start Year',
                    value: item.startYear,
                    path: `education.${index}.startYear`,
                    maxLength: RESUME_LIMITS.year,
                    onChange: (event) => updateListItem('education', index, 'startYear', event.target.value.replace(/\D/g, '').slice(0, RESUME_LIMITS.year)),
                  })}
                  {renderInput({
                    label: 'End Year',
                    value: item.endYear,
                    path: `education.${index}.endYear`,
                    maxLength: RESUME_LIMITS.year,
                    onChange: (event) => updateListItem('education', index, 'endYear', event.target.value.replace(/\D/g, '').slice(0, RESUME_LIMITS.year)),
                  })}
                  {renderInput({
                    label: 'GPA',
                    value: item.gpa,
                    path: `education.${index}.gpa`,
                    maxLength: RESUME_LIMITS.gpa,
                    onChange: (event) => updateListItem('education', index, 'gpa', clampValue(event.target.value, RESUME_LIMITS.gpa)),
                  })}
                </div>
              </div>
            ))}

            {(currentResume.education || []).length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-600">No education added yet.</p>
            ) : null}
          </>
        ) : null}

        {activeTab === 'skills' ? (
          <>
            <div className="flex items-center justify-between">
              <p className="section-label mb-0">Skills</p>
              <button
                onClick={handleSuggestSkills}
                disabled={aiLoading.skills}
                className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-400 disabled:opacity-50"
              >
                <FiZap size={11} /> {aiLoading.skills ? 'Suggesting...' : 'AI Suggest'}
              </button>
            </div>

            {visibleError('skills') ? <p className="text-xs text-red-400">{visibleError('skills')}</p> : null}

            {renderInput({
              label: 'Skills (comma-separated)',
              value: (currentResume.skills || []).join(', '),
              path: 'skills.0',
              errorOverride: visibleGroupError('skills'),
              maxLength: 500,
              onChange: (event) => updateCurrentResume({
                skills: event.target.value
                  .split(',')
                  .map((skill) => clampValue(skill.trim(), RESUME_LIMITS.skill))
                  .filter(Boolean)
                  .slice(0, 20),
              }),
            })}
          </>
        ) : null}

        {activeTab === 'projects' ? (
          <>
            <div className="flex items-center justify-between">
              <p className="section-label mb-0">Projects</p>
              <button
                onClick={() => updateCurrentResume({
                  projects: [
                    ...(currentResume.projects || []),
                    { title: '', description: '', link: '' },
                  ],
                })}
                className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-400"
              >
                <FiPlus size={12} /> Add
              </button>
            </div>

            {(currentResume.projects || []).map((item, index) => (
              <div key={index} className="space-y-3 rounded-lg border border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <span className="text-safe text-sm font-medium text-gray-300">{item.title || `Project ${index + 1}`}</span>
                  <button onClick={() => removeListItem('projects', index)} className="text-gray-600 transition-colors hover:text-red-400">
                    <FiTrash2 size={13} />
                  </button>
                </div>

                {renderInput({
                  label: 'Project Title',
                  value: item.title,
                  path: `projects.${index}.title`,
                  maxLength: RESUME_LIMITS.projectName,
                  onChange: (event) => updateListItem('projects', index, 'title', clampValue(event.target.value, RESUME_LIMITS.projectName)),
                })}

                {renderInput({
                  label: 'Project URL',
                  value: item.link,
                  path: `projects.${index}.link`,
                  maxLength: RESUME_LIMITS.link,
                  onChange: (event) => updateListItem('projects', index, 'link', clampValue(event.target.value, RESUME_LIMITS.link)),
                })}

                {renderTextarea({
                  label: 'Description',
                  value: item.description,
                  path: `projects.${index}.description`,
                  maxLength: RESUME_LIMITS.projectDescription,
                  rows: 3,
                  onChange: (event) => updateListItem('projects', index, 'description', clampValue(event.target.value, RESUME_LIMITS.projectDescription)),
                })}
              </div>
            ))}

            {(currentResume.projects || []).length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-600">No projects added yet.</p>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
