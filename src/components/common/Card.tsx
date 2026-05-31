/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'flat' | 'glass' | 'neon' | 'glow-gold';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'glass',
  padding = 'md',
  className = '',
  ...props
}) => {
  const baseStyle = 'rounded-2xl transition-all duration-300 overflow-hidden';
  
  const variants = {
    flat: 'bg-white/5 border border-white/5 backdrop-blur-md',
    glass: 'bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg',
    neon: 'bg-white/10 border border-blue-500/20 backdrop-blur-xl shadow-[0_0_20px_-3px_rgba(59,130,246,0.15)]',
    'glow-gold': 'bg-white/10 border border-amber-500/20 backdrop-blur-xl shadow-[0_0_20px_-3px_rgba(245,158,11,0.15)]'
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div
      className={`${baseStyle} ${variants[variant]} ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
