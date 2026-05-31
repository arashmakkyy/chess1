/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface PlayerAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  name,
  size = 'md',
  className = ''
}) => {
  // Map player names to specific pieces, colors, and gradients
  const getAvatarConfig = (playerName: string) => {
    const cleanName = playerName.trim();
    if (cleanName.includes('آرش')) {
      return {
        // King
        icon: (
          <path
            d="M24 6l2 4h-4l2-4zm0 4v20M14 34h20M16 16c0-5 8-8 8-8s8 3 8 8M18 22h12M15 28h18"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ),
        gradient: 'from-amber-400 to-orange-600',
        glow: 'shadow-amber-500/20 shadow-lg border-amber-500/30',
        textColor: 'text-amber-400',
        title: 'شاه'
      };
    } else if (cleanName.includes('علیرضا')) {
      return {
        // Knight
        icon: (
          <path
            d="M30 34c0-4-3-8-8-8H16s-2-2-4-5 1-8 5-8h1s-1-2 2-4 5-1 7 1c0 0 2-4 5-3s2 5 1 7c2 1 4 4 3 8l3 4"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ),
        gradient: 'from-cyan-400 to-indigo-600',
        glow: 'shadow-cyan-500/20 shadow-lg border-cyan-500/30',
        textColor: 'text-cyan-400',
        title: 'اسب'
      };
    } else if (cleanName.includes('محمد')) {
      return {
        // Rook
        icon: (
          <path
            d="M16 10h4v4h4v-4h4v4h4v-4h4M17 14h14v6H17zm2 6l-1 10h14l-1-10M14 34h20"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ),
        gradient: 'from-emerald-400 to-teal-600',
        glow: 'shadow-emerald-500/20 shadow-lg border-emerald-500/30',
        textColor: 'text-emerald-400',
        title: 'رخ'
      };
    } else {
      return {
        // Bishop
        icon: (
          <path
            d="M24 6v4M22 8h4M16 22c0-5 8-12 8-12s8 7 8 12c0 4-3 6-8 6s-8-2-8-6zm0 12h16M19 28h10"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ),
        gradient: 'from-fuchsia-400 to-pink-600',
        glow: 'shadow-fuchsia-500/20 shadow-lg border-fuchsia-500/30',
        textColor: 'text-fuchsia-400',
        title: 'فیل'
      };
    }
  };

  const { icon, gradient, glow, textColor, title } = getAvatarConfig(name);

  const sizeClasses = {
    sm: 'w-10 h-10 text-xs border',
    md: 'w-14 h-14 text-sm border-2',
    lg: 'w-20 h-20 text-base border-2',
    xl: 'w-28 h-28 text-lg border-3'
  };

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Glow aura */}
      <div className={`flex items-center justify-center rounded-2xl bg-gradient-to-tr ${gradient} ${sizeClasses[size]} ${glow} overflow-hidden bg-zinc-950/95`}>
        <div className={`absolute inset-[2px] rounded-[14px] bg-zinc-950 flex items-center justify-center ${textColor}`}>
          <svg
            viewBox="0 0 48 48"
            className="w-2/3 h-2/3 filter drop-shadow-[0_0_6px_rgba(currentColor,0.4)]"
            xmlns="http://www.w3.org/2000/svg"
          >
            {icon}
          </svg>
        </div>
      </div>
      
      {/* Piece Tag for Gen-Z flavor */}
      <span className="absolute -bottom-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-zinc-900 border border-zinc-800 text-zinc-400 tracking-wider">
        {title}
      </span>
    </div>
  );
};
