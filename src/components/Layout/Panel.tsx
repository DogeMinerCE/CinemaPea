import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  area?: string;
}

export const Panel: React.FC<PanelProps> = ({ title, children, className, area }) => {
  return (
    <div 
      className={cn(
        "panel overflow-hidden h-full w-full",
        area,
        className
      )}
    >
      <div className="panel-header bg-[#323232] h-7 flex items-center px-3 border-b border-black">
        <div className="tab active text-[10px] font-bold text-[#E0E0E0] h-full flex items-center border-b-2 border-[#1473E6]">
          {title.toUpperCase()}
        </div>
      </div>
      <div className="panel-content flex-1 overflow-auto bg-[#1D1D1D] relative">
        {children}
      </div>
    </div>
  );
};
