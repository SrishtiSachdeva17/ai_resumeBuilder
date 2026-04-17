import React, { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api, { getApiError } from '../utils/api';

const ResumeContext = createContext(null);

export const defaultResume = {
  title: 'My Resume',
  template: 'modern',
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
    summary: '',
  },
  education: [],
  experience: [],
  skills: [],
  projects: [],
  certifications: [],
};

const cloneDefaultResume = () => JSON.parse(JSON.stringify(defaultResume));

export const ResumeProvider = ({ children }) => {
  const [resumes, setResumes] = useState([]);
  const [currentResume, setCurrentResume] = useState(cloneDefaultResume());
  const [saving, setSaving] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(false);

  const upsertResume = useCallback((resume) => {
    setResumes((previous) => {
      const existing = previous.some((item) => item._id === resume._id);

      if (!existing) {
        return [resume, ...previous];
      }

      return previous
        .map((item) => (item._id === resume._id ? resume : item))
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    });
  }, []);

  const fetchResumes = useCallback(async () => {
    setLoadingResumes(true);

    try {
      const { data } = await api.get('/resumes');
      setResumes(data.resumes);
      return data.resumes;
    } finally {
      setLoadingResumes(false);
    }
  }, []);

  const fetchResume = useCallback(async (id) => {
    const { data } = await api.get(`/resumes/${id}`);
    setCurrentResume(data.resume);
    upsertResume(data.resume);
    return data.resume;
  }, [upsertResume]);

  const saveResume = useCallback(async (resumeData) => {
    if (saving) {
      return currentResume;
    }

    setSaving(true);

    try {
      console.log('FORM DATA:', resumeData);
      const response = resumeData._id
        ? await api.put(`/resumes/${resumeData._id}`, resumeData)
        : await api.post('/resumes', resumeData);

      const savedResume = response.data.resume;
      upsertResume(savedResume);
      setCurrentResume(savedResume);
      await fetchResumes();
      toast.success(resumeData._id ? 'Resume updated.' : 'Resume created.');
      return savedResume;
    } catch (error) {
      const parsed = getApiError(error, 'Failed to save resume.');
      toast.error(parsed.message);
      throw parsed;
    } finally {
      setSaving(false);
    }
  }, [currentResume, fetchResumes, saving, upsertResume]);

  const deleteResume = useCallback(async (id) => {
    await api.delete(`/resumes/${id}`);
    setResumes((previous) => previous.filter((resume) => resume._id !== id));
    toast.success('Resume deleted.');
  }, []);

  const updateCurrentResume = useCallback((updates) => {
    setCurrentResume((previous) => ({ ...previous, ...updates }));
  }, []);

  const resetCurrentResume = useCallback(() => {
    setCurrentResume(cloneDefaultResume());
  }, []);

  return (
    <ResumeContext.Provider
      value={{
        resumes,
        currentResume,
        saving,
        loadingResumes,
        fetchResumes,
        fetchResume,
        saveResume,
        deleteResume,
        updateCurrentResume,
        setCurrentResume,
        resetCurrentResume,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = () => {
  const ctx = useContext(ResumeContext);
  if (!ctx) {
    throw new Error('useResume must be used within ResumeProvider');
  }
  return ctx;
};
