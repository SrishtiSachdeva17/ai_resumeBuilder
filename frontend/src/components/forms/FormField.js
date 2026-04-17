import React from 'react';

export function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-xs text-red-400">{message}</p>;
}

export default function FormField({
  label,
  error,
  maxLength,
  hint,
  className = '',
  as = 'input',
  ...props
}) {
  const Component = as;

  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm text-gray-400">{label}</span>
      <Component
        maxLength={maxLength}
        className={`input-field ${error ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/20' : ''}`}
        {...props}
      />
      {hint ? <span className="mt-1 block text-xs text-gray-500">{hint}</span> : null}
      <FieldError message={error} />
    </label>
  );
}
