'use client';

import { useState, useEffect, useCallback } from 'react';
import { featureFlags } from '@/config/featureFlags';
import { schoolsApi } from '@/lib/services/schoolsApi';
import { MOCK_SCHOOLS } from '@/features/dashboard/constants';
import type { School } from '@/features/dashboard/types';

export function useSchools() {
  const [schools, setSchools] = useState<School[]>([]);

  useEffect(() => {
    if (!featureFlags.useRealSchools) {
      setSchools(MOCK_SCHOOLS);
      return;
    }

    let cancelled = false;
    schoolsApi.list().then((data) => {
      if (!cancelled) setSchools(data);
    }).catch(() => {
      if (!cancelled) setSchools(MOCK_SCHOOLS);
    });

    return () => { cancelled = true; };
  }, []);

  const addSchool = useCallback((school: School) => {
    if (!featureFlags.useRealSchools) {
      setSchools((prev) => [school, ...prev]);
      return;
    }

    schoolsApi.create({
      name: school.name,
      location: school.location,
      description: school.description,
      website: school.website,
    }).then((created) => {
      setSchools((prev) => [created, ...prev]);
    }).catch(() => {
      // Optimistic fallback — add locally if API fails
      setSchools((prev) => [school, ...prev]);
    });
  }, []);

  return { schools, setSchools, addSchool };
}
