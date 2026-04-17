import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiEdit2, FiFileText, FiLogOut, FiPlus, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useResume } from '../context/ResumeContext';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const {
    resumes,
    fetchResumes,
    deleteResume,
    resetCurrentResume,
    loadingResumes,
  } = useResume();
  const navigate = useNavigate();

  useEffect(() => {
    fetchResumes().catch(() => toast.error('Failed to load resumes.'));
  }, [fetchResumes]);

  const handleCreateResume = () => {
    resetCurrentResume();
    navigate('/resume/new');
  };

  const handleDelete = async (id, event) => {
    event.stopPropagation();

    if (!window.confirm('Delete this resume?')) {
      return;
    }

    try {
      await deleteResume(id);
    } catch (error) {
      toast.error('Delete failed.');
    }
  };

  const templateColors = {
    modern: 'bg-blue-500',
    classic: 'bg-emerald-500',
    minimal: 'bg-gray-500',
    creative: 'bg-amber-500',
  };

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border px-6 py-4 md:px-8 flex justify-between items-center">
        <span className="font-display text-xl text-white">ResumeAI</span>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm text-safe">Hi, {user?.name}</span>
          <button onClick={logout} className="text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1.5 text-sm">
            <FiLogOut size={14} /> Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 md:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="section-label">Dashboard</p>
            <h1 className="text-2xl font-semibold text-white">My Resumes</h1>
          </div>

          {resumes.length > 0 ? (
            <button onClick={handleCreateResume} className="btn-primary flex items-center gap-2">
              <FiPlus size={16} /> Create Resume
            </button>
          ) : null}
        </div>

        {loadingResumes ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : resumes.length === 0 ? (
          <div className="card py-16 text-center">
            <FiFileText className="mx-auto mb-4 text-4xl text-gray-600" />
            <p className="mb-5 text-gray-400">No resumes yet. Create your first one.</p>
            <button onClick={handleCreateResume} className="btn-primary inline-flex items-center gap-2">
              <FiPlus size={15} /> Create Resume
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => (
              <article
                key={resume._id}
                onClick={() => navigate(`/resume/${resume._id}`)}
                className="card group cursor-pointer transition-all hover:border-primary-500/50"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className={`mt-1 h-2 w-2 rounded-full ${templateColors[resume.template] || 'bg-gray-500'}`} />
                  <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/resume/${resume._id}`);
                      }}
                      className="p-1 text-gray-400 transition-colors hover:text-primary-500"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      onClick={(event) => handleDelete(resume._id, event)}
                      className="p-1 text-gray-400 transition-colors hover:text-red-400"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>

                <h2 className="mb-1 text-safe text-lg font-semibold text-white">
                  {resume.title || 'Untitled Resume'}
                </h2>
                <p className="mb-3 text-safe text-sm text-gray-500">
                  {resume.personalInfo?.fullName || 'No name set'}
                </p>

                <div className="flex items-center justify-between gap-3">
                  <span className="rounded bg-surface px-2 py-0.5 text-xs capitalize text-gray-400">
                    {resume.template}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-600">
                    <FiClock size={10} />
                    {new Date(resume.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
