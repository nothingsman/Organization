'use client';

import { useState, useEffect } from 'react';
import { featureFlags } from '@/config/featureFlags';
import { schoolsApi } from '@/lib/services/schoolsApi';
import { branchesApi } from '@/lib/services/branchesApi';
import { MOCK_SCHOOLS, MOCK_BRANCHES, MOCK_ADMINS } from '@/features/dashboard/constants';
import type { School, Branch, Admin } from '@/features/dashboard/types';

export function useBranchDetail(schoolId: string) {
  const [school, setSchool] = useState<School | undefined>(undefined);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);

  useEffect(() => {
    if (!schoolId) return;

    if (!featureFlags.useRealBranches) {
      setSchool(MOCK_SCHOOLS.find((s) => s.id === schoolId));
      setBranches(MOCK_BRANCHES.filter((b) => b.schoolId === schoolId));
      setAdmins(MOCK_ADMINS);
      return;
    }

    let cancelled = false;

    Promise.all([
      schoolsApi.get(schoolId),
      branchesApi.listBySchool(schoolId),
    ]).then(([schoolData, branchData]) => {
      if (cancelled) return;
      setSchool(schoolData);
      setBranches(branchData);

      // Load admins for all branches
      const branchIds = branchData.map((b) => b.id);
      return Promise.all(branchIds.map((id) => branchesApi.listAdmins(id)));
    }).then((adminArrays) => {
      if (cancelled || !adminArrays) return;
      setAdmins(adminArrays.flat());
    }).catch(() => {
      if (cancelled) return;
      // Fallback to mock on error
      setSchool(MOCK_SCHOOLS.find((s) => s.id === schoolId));
      setBranches(MOCK_BRANCHES.filter((b) => b.schoolId === schoolId));
      setAdmins(MOCK_ADMINS);
    });

    return () => { cancelled = true; };
  }, [schoolId]);

  return { school, branches, admins, setAdmins };
}
