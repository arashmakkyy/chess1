/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface PlayerAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showPieceTag?: boolean;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  name,
  size = 'md',
  className = '',
  showPieceTag = true
}) => {
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
    } else if (cleanName.includes('مهدیار')) {
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
    } else if (cleanName.includes('ادیبی')) {
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
    } else if (cleanName.includes('خوش لفظ')) {
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
    } else if (cleanName.includes('رشیدی')) {
      return {
        // Queen
        icon: (
          <path
            d="M12 34h24M14 28h20M12 18l4 10h16l4-10-7 4-5-8-5 8-7-4zM24 6a2 2 0 100 4 2 2 0 000-4z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ),
        gradient: 'from-rose-400 to-red-600',
        glow: 'shadow-rose-500/20 shadow-lg border-rose-500/30',
        textColor: 'text-rose-400',
        title: 'وزیر'
      };
    } else if (cleanName.includes('حیدری')) {
      return {
        // Knight / Eagle
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
        gradient: 'from-sky-400 to-blue-600',
        glow: 'shadow-sky-500/20 shadow-lg border-sky-500/30',
        textColor: 'text-sky-400',
        title: 'اسب'
      };
    } else if (cleanName.includes('خدابین')) {
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
        gradient: 'from-indigo-400 to-violet-600',
        glow: 'shadow-indigo-500/20 shadow-lg border-indigo-500/30',
        textColor: 'text-indigo-400',
        title: 'رخ'
      };
    } else if (cleanName.includes('اسمائیلی') || cleanName.includes('اسماعیلی')) {
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
        gradient: 'from-orange-400 to-amber-600',
        glow: 'shadow-orange-500/20 shadow-lg border-orange-500/30',
        textColor: 'text-orange-400',
        title: 'فیل'
      };
    } else if (cleanName.includes('قنبری')) {
      return {
        // Queen / Knight
        icon: (
          <path
            d="M12 34h24M14 28h20M12 18l4 10h16l4-10-7 4-5-8-5 8-7-4zM24 6a2 2 0 100 4 2 2 0 000-4z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ),
        gradient: 'from-violet-400 to-purple-600',
        glow: 'shadow-violet-500/20 shadow-lg border-violet-500/30',
        textColor: 'text-violet-400',
        title: 'وزیر'
      };
    } else if (cleanName.includes('توکلی')) {
      return {
        // Pawn / Champion
        icon: (
          <path
            d="M24 6a5 5 0 100 10 5 5 0 000-10zm-6 16c0-3 3-5 6-5s6 2 6 5v6H18v-6zm-4 12h20M16 28h16"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ),
        gradient: 'from-lime-400 to-emerald-600',
        glow: 'shadow-lime-500/20 shadow-lg border-lime-500/30',
        textColor: 'text-lime-400',
        title: 'سرباز'
      };
    } else {
      return {
        icon: (
          <path
            d="M24 6a5 5 0 100 10 5 5 0 000-10zm-6 16c0-3 3-5 6-5s6 2 6 5v6H18v-6zm-4 12h20M16 28h16"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ),
        gradient: 'from-blue-400 to-indigo-600',
        glow: 'shadow-blue-500/20 shadow-lg border-blue-500/30',
        textColor: 'text-blue-400',
        title: 'مهره'
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
      <div
        className={`flex items-center justify-center rounded-2xl bg-gradient-to-tr ${gradient} ${sizeClasses[size]} ${glow} overflow-hidden bg-zinc-950/95`}
      >
        <div
          className={`absolute inset-[2px] rounded-[14px] bg-zinc-950 flex items-center justify-center ${textColor}`}
        >
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
      {showPieceTag && (
        <span className="absolute -bottom-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-zinc-900 border border-zinc-800 text-zinc-400 tracking-wider">
          {title}
        </span>
      )}
    </div>
  );
};
