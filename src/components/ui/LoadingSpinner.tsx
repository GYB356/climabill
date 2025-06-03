"use client";

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
  fullscreen?: boolean;
  label?: string;
}

export default function LoadingSpinner({
  size = 'medium',
  color = 'primary',
  className = '',
  fullscreen = false,
  label = 'Loading...'
}: LoadingSpinnerProps) {
  // Size mapping
  const sizeMap = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4'
  };
  
  // Color mapping
  const colorMap = {
    primary: 'border-blue-500 border-t-transparent',
    secondary: 'border-gray-500 border-t-transparent',
    white: 'border-white border-t-transparent'
  };
  
  const spinnerClasses = `
    inline-block rounded-full animate-spin ${sizeMap[size]} ${colorMap[color]} ${className}
  `;
  
  // Render fullscreen spinner
  if (fullscreen) {
    return (
      <div 
        className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50"
        role="alert"
        aria-busy="true"
        aria-label={label}
      >
        <div className="bg-white p-5 rounded-lg shadow-lg flex flex-col items-center">
          <div className={spinnerClasses}></div>
          {label && <p className="mt-2 text-gray-700">{label}</p>}
        </div>
      </div>
    );
  }
  
  // Render inline spinner
  return (
    <div 
      className="inline-flex items-center"
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      <div className={spinnerClasses}></div>
      {label && <span className="ml-2">{label}</span>}
    </div>
  );
}
