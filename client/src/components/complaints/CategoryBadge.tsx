import React from 'react';
import { ComplaintCategory } from '../../types';
import {
  Wifi,
  Home,
  GraduationCap,
  Wrench,
  Utensils,
  BookOpen,
  Bus,
  Trophy,
  HelpCircle,
} from 'lucide-react';

export const CategoryBadge: React.FC<{ category: ComplaintCategory; size?: 'sm' | 'md' }> = ({
  category,
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  let Icon = HelpCircle;
  let color = 'text-slate-300 bg-slate-800/80 border-slate-700';

  switch (category) {
    case 'IT/Wi-Fi':
      Icon = Wifi;
      color = 'text-cyan-300 bg-cyan-950/50 border-cyan-700/40';
      break;
    case 'Hostel':
      Icon = Home;
      color = 'text-indigo-300 bg-indigo-950/50 border-indigo-700/40';
      break;
    case 'Academic':
      Icon = GraduationCap;
      color = 'text-purple-300 bg-purple-950/50 border-purple-700/40';
      break;
    case 'Infrastructure':
      Icon = Wrench;
      color = 'text-amber-300 bg-amber-950/50 border-amber-700/40';
      break;
    case 'Mess/Canteen':
      Icon = Utensils;
      color = 'text-emerald-300 bg-emerald-950/50 border-emerald-700/40';
      break;
    case 'Library':
      Icon = BookOpen;
      color = 'text-blue-300 bg-blue-950/50 border-blue-700/40';
      break;
    case 'Transport':
      Icon = Bus;
      color = 'text-orange-300 bg-orange-950/50 border-orange-700/40';
      break;
    case 'Sports':
      Icon = Trophy;
      color = 'text-rose-300 bg-rose-950/50 border-rose-700/40';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border font-medium ${color} ${sizeClasses}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {category}
    </span>
  );
};
