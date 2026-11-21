import React, { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon,
    type = 'text',
    className = '',
    containerClassName = '',
    required = false,
    id,
    ...props
  },
  ref
) {
  const inputId = id || props.name || Math.random().toString(36).substring(7);

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative rounded-xl shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-5 h-5" />
          </div>
        )}

        <input
          id={inputId}
          ref={ref}
          type={type}
          required={required}
          className={`block w-full rounded-xl border text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-slate-50 disabled:text-slate-500 ${
            Icon ? 'pl-10 pr-3.5' : 'px-3.5'
          } py-2.5 ${
            error
              ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-400 bg-red-50/20'
              : 'border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-indigo-400 bg-white'
          } ${className}`}
          {...props}
        />
      </div>

      {error ? (
        <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Input;
