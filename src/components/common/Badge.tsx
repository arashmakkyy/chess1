/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'amber' | 'indigo' | 'emerald' | 'gray' | 'rose' | 'cyber';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gray',
  className = ''
}) => {
  const baseStyle = 'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wider';
  
  const variants = {
    amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    gray: 'bg-zinc-800/80 text-zinc-400 border border-zinc-700/50',
    cyber: 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 shadow-[0_0_8px_rgba(217,70,239,0.1)]'
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
