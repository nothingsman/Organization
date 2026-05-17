'use client';

import Link from 'next/link';
import { School } from '../types';
import { MapPin, Users, GraduationCap, ChevronRight } from 'lucide-react';

interface SchoolCardProps {
  school: School;
}

export default function SchoolCard({ school }: SchoolCardProps) {
  return (
    <Link 
      href={`/school/${school.id}`}
      className="group bg-white border border-outline-variant rounded-xl overflow-hidden hover:border-primary-navy/40 transition-all duration-300 flex flex-col"
    >
      <div className="aspect-video w-full overflow-hidden relative">
        <img 
          src={school.logo} 
          alt={school.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(school.name)}&background=020617&color=fff&size=512`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <span className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1">
            View details <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="font-bold text-lg leading-tight group-hover:text-primary-navy transition-colors">{school.name}</h3>
          <span className="bg-surface-container px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-primary-navy whitespace-nowrap">
            ID: {school.id}
          </span>
        </div>
        
        <div className="space-y-3 mt-auto">
          <div className="flex items-center gap-2 text-sm text-primary-navy/60">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">{school.location}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline-variant">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/40">Students</span>
              <div className="flex items-center gap-2 mt-1">
                <GraduationCap className="w-4 h-4 text-primary-navy" />
                <span className="font-bold text-sm tracking-tight">{school.studentCount.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/40">Staff</span>
              <div className="flex items-center gap-2 mt-1">
                <Users className="w-4 h-4 text-primary-navy" />
                <span className="font-bold text-sm tracking-tight">{school.staffCount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
