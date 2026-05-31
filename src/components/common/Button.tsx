/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'glow' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium transition-all duration-300 rounded-xl focus:outline-none cursor-pointer active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none';
  
  const variants = {
    primary: 'bg-white hover:bg-slate-100 text-slate-950 font-bold border border-white/20 shadow-lg shadow-white/5',
    secondary: 'bg-white/10 hover:bg-white/20 text-slate-100 border border-white/10 font-bold',
    danger: 'bg-rose-500/20 hover:bg-rose-500/40 text-rose-200 border border-rose-500/30',
    glow: 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold hover:from-blue-600 hover:to-purple-650 transition-all border border-white/20 shadow-lg shadow-indigo-500/20',
    outline: 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base md:text-lg'
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
