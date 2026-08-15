/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GroupIdentifier } from '../../types';

interface GroupBadgeProps {
  group: GroupIdentifier;
  className?: string;
  size?: 'sm' | 'md';
}

export const GroupBadge: React.FC<GroupBadgeProps> = ({
  group,
  className = '',
  size = 'sm'
}) => {
  const isA = group === 'A';

  const sizeClass = size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[10px]';

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-lg border ${
        isA
          ? 'bg-blue-500/15 border-blue-500/30 text-blue-300'
          : 'bg-purple-500/15 border-purple-500/30 text-purple-300'
      } ${sizeClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isA ? 'bg-blue-400' : 'bg-purple-400'}`} />
      <span>{isA ? 'گروه الف (A)' : 'گروه ب (B)'}</span>
    </span>
  );
};
