import React from 'react';
import { LicenseStatus } from '../types';
import { CheckCircle2, Clock, AlertTriangle, ArrowRightLeft } from 'lucide-react';

interface StatusBadgeProps {
  status: LicenseStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const norm = (status || '').toUpperCase();

  const sizeClasses = {
    sm: 'text-xs gap-1.5',
    md: 'text-xs gap-1.5',
    lg: 'text-sm gap-2 font-semibold'
  }[size];

  const iconSizes = {
    sm: 13,
    md: 14,
    lg: 16
  }[size];

  if (norm === 'ACTIVE') {
    return (
      <span className={`inline-flex items-center text-emerald-700 font-semibold ${sizeClasses}`}>
        <CheckCircle2 size={iconSizes} className="text-emerald-600 shrink-0" />
        <span>ACTIVE</span>
      </span>
    );
  }

  if (norm === 'EXPIRED') {
    return (
      <span className={`inline-flex items-center text-amber-700 font-semibold ${sizeClasses}`}>
        <Clock size={iconSizes} className="text-amber-600 shrink-0" />
        <span>EXPIRED</span>
      </span>
    );
  }

  if (norm === 'REVOKED') {
    return (
      <span className={`inline-flex items-center text-rose-700 font-semibold ${sizeClasses}`}>
        <AlertTriangle size={iconSizes} className="text-rose-600 shrink-0" />
        <span>REVOKED</span>
      </span>
    );
  }

  if (norm === 'TRANSFERRED') {
    return (
      <span className={`inline-flex items-center text-blue-700 font-semibold ${sizeClasses}`}>
        <ArrowRightLeft size={iconSizes} className="text-blue-600 shrink-0" />
        <span>TRANSFERRED</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center text-slate-600 font-medium ${sizeClasses}`}>
      <span>{norm || 'UNKNOWN'}</span>
    </span>
  );
};
