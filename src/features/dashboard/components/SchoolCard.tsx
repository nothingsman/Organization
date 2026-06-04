'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { School } from '../types';
import { MapPin, Users, Building2, ChevronRight, Pencil } from 'lucide-react';
import { getSchoolAvatarUrl } from '@/lib/utils/schoolAvatar';

interface SchoolCardProps {
  school: School;
  branchCount?: number;
  adminCount?: number;
  onEdit?: (school: School) => void;
}

function SchoolCardImage({ src, alt, fallbackSrc }: { src: string; alt: string; fallbackSrc: string }) {
  const [hasError, setHasError] = useState(false);

  return (
    <Image
      src={hasError ? fallbackSrc : src}
      alt={alt}
      fill
      unoptimized
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className="object-cover group-hover:scale-105 transition-transform duration-500"
      onError={() => setHasError(true)}
    />
  );
}

export default function SchoolCard({ school, branchCount = 0, adminCount, onEdit }: SchoolCardProps) {
  const fallbackLogo = getSchoolAvatarUrl(school.name);

  return (
    <div className="group relative rounded-xl border border-outline-variant bg-white overflow-hidden transition-all duration-300 hover:border-primary-navy/40">
      {onEdit ? (
        <button
          type="button"
          onClick={() => onEdit(school)}
          className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-primary-navy shadow-sm ring-1 ring-black/5 transition hover:bg-white"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
      ) : null}

      <Link
        href={`/school/${school.id}`}
        className="flex h-full flex-col"
      >
        <div className="aspect-video w-full overflow-hidden relative">
          <SchoolCardImage
            key={school.logo}
            src={school.logo}
            alt={school.name}
            fallbackSrc={fallbackLogo}
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
          </div>

          <div className="space-y-3 mt-auto">
            <div className="flex items-center gap-2 text-sm text-primary-navy/60">
              <MapPin className="w-4 h-4" />
              <span className="font-medium">{school.location}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline-variant">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/40">Branches</span>
                <div className="flex items-center gap-2 mt-1">
                  <Building2 className="w-4 h-4 text-primary-navy" />
                  <span className="font-bold text-sm tracking-tight">{branchCount}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/40">Admins</span>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="w-4 h-4 text-primary-navy" />
                  <span className="font-bold text-sm tracking-tight">{(adminCount ?? school.staffCount).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
