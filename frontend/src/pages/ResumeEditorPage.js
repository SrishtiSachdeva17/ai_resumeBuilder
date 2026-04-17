import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiEye, FiEyeOff, FiSave } from 'react-icons/fi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import ResumeForm from '../components/resume/ResumeForm';
import ResumePreview from '../components/resume/ResumePreview';
import { useResume } from '../context/ResumeContext';
import { clampValue, getErrorMessage, hasResumeContent, validateResume, RESUME_LIMITS } from '../utils/validation';

export default function ResumeEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentResume,
    fetchResume,
    saveResume,
    updateCurrentResume,
    saving,
    resetCurrentResume,
  } = useResume();
  const [loading, setLoading] = useState(Boolean(id));
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [downloading, setDownloading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  const clientErrors = useMemo(() => validateResume(currentResume), [currentResume]);
  const combinedErrors = { ...serverErrors, ...clientErrors };
  const canDownload = hasResumeContent(currentResume);

  useEffect(() => {
    if (!id) {
      resetCurrentResume();
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchResume(id)
      .catch(() => {
        toast.error('Resume not found.');
        navigate('/dashboard');
      })
      .finally(() => setLoading(false));
  }, [fetchResume, id, navigate, resetCurrentResume]);

  useEffect(() => {
    if (showErrors && Object.keys(serverErrors).length > 0) {
      setServerErrors({});
    }
  }, [currentResume, serverErrors, showErrors]);

  const handleSave = async () => {
    setShowErrors(true);
    setServerErrors({});

    if (Object.keys(clientErrors).length > 0) {
      toast.error('Please fix the highlighted fields before saving.');
      return;
    }

    try {
      const savedResume = await saveResume(currentResume);
      if (!id) {
        navigate(`/resume/${savedResume._id}`, { replace: true });
      }
    } catch (error) {
      if (error?.fields) {
        setServerErrors(error.fields);
      }
    }
  };

  const handleDownloadPDF = async () => {
    if (!canDownload) {
      toast.error('Add resume details before downloading the PDF.');
      return;
    }

    const element = document.getElementById('resume-preview-print');
    if (!element) {
      toast.error('Preview is not ready yet.');
      return;
    }

    setDownloading(true);
    const toastId = toast.loading('Generating PDF...');

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();

      if (pdfHeight <= pageHeight) {
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      } else {
        let yOffset = 0;
        let remainingHeight = pdfHeight;

        while (remainingHeight > 0) {
          pdf.addImage(imgData, 'JPEG', 0, -yOffset, pdfWidth, pdfHeight);
          remainingHeight -= pageHeight;
          yOffset += pageHeight;
          if (remainingHeight > 0) {
            pdf.addPage();
          }
        }
      }

      const filenameBase = clampValue(currentResume.personalInfo?.fullName || currentResume.title || 'Resume', 40) || 'Resume';
      pdf.save(`${filenameBase}.pdf`);
      toast.success('PDF downloaded.', { id: toastId });
    } catch (error) {
      toast.error('PDF generation failed.', { id: toastId });
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="no-print shrink-0 border-b border-border px-4 py-3 md:px-6 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-4">
          <Link to="/dashboard" className="text-gray-500 transition-colors hover:text-white">
            <FiArrowLeft size={18} />
          </Link>
          <div className="min-w-0">
            <input
              value={currentResume.title || ''}
              onChange={(event) => updateCurrentResume({ title: clampValue(event.target.value, RESUME_LIMITS.title) })}
              className="w-full min-w-0 bg-transparent text-sm font-medium text-white focus:outline-none"
              placeholder="Resume title"
              maxLength={RESUME_LIMITS.title}
            />
            {showErrors ? <p className="mt-1 text-xs text-red-400">{getErrorMessage(combinedErrors, 'title')}</p> : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <select
            value={currentResume.template || 'modern'}
            onChange={(event) => updateCurrentResume({ template: event.target.value })}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-gray-300 focus:border-primary-500 focus:outline-none"
          >
            <option value="modern">Modern</option>
            <option value="classic">Classic</option>
            <option value="minimal">Minimal</option>
            <option value="creative">Creative</option>
          </select>

          <button onClick={() => setShowPreview((value) => !value)} className="btn-secondary lg:hidden flex items-center gap-1.5 text-sm py-2">
            {showPreview ? <FiEyeOff size={14} /> : <FiEye size={14} />}
            {showPreview ? 'Edit' : 'Preview'}
          </button>

          <button onClick={handleSave} disabled={saving} className="btn-secondary flex items-center gap-1.5 text-sm py-2">
            <FiSave size={14} /> {saving ? 'Saving...' : 'Save'}
          </button>

          <button onClick={handleDownloadPDF} disabled={downloading || !canDownload} className="btn-primary flex items-center gap-1.5 text-sm py-2">
            <FiDownload size={14} /> {downloading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className={`w-full lg:w-[45%] overflow-y-auto border-r border-border ${showPreview ? 'hidden lg:block' : ''}`}>
          <ResumeForm
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            errors={combinedErrors}
            showErrors={showErrors}
          />
        </div>

        <div className={`w-full lg:w-[55%] overflow-y-auto bg-gray-900 ${!showPreview ? 'hidden lg:flex' : 'flex'} items-start justify-center p-4 md:p-8`}>
          <div id="resume-preview-print" className="w-full max-w-[794px]">
            <ResumePreview resume={currentResume} />
          </div>
        </div>
      </div>
    </div>
  );
}
