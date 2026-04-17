import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import FormField from '../components/forms/FormField';
import { AUTH_LIMITS, validateAuthForm } from '../utils/validation';
import { getApiError } from '../utils/api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const errors = useMemo(() => validateAuthForm(form, 'login'), [form]);

  const updateField = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setServerError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouched({ email: true, password: true });

    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      await login(form.email.trim(), form.password.trim());
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      const parsed = getApiError(error, 'Login failed. Check your credentials.');
      setServerError(parsed.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="font-display text-2xl text-white block text-center mb-8">ResumeAI</Link>

        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-6">Welcome back</h2>

          {serverError ? (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {serverError}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <FormField
              label="Email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              maxLength={AUTH_LIMITS.email}
              error={touched.email ? errors.email : ''}
              onBlur={() => setTouched((previous) => ({ ...previous, email: true }))}
              onChange={(event) => updateField('email', event.target.value)}
            />

            <FormField
              label="Password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              maxLength={AUTH_LIMITS.password}
              error={touched.password ? errors.password : ''}
              onBlur={() => setTouched((previous) => ({ ...previous, password: true }))}
              onChange={(event) => updateField('password', event.target.value)}
            />

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-gray-500 text-sm text-center mt-5">
            Don't have an account? <Link to="/register" className="text-primary-500 hover:underline">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
