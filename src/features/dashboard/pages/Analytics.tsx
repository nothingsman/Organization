'use client';

import React, { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import Layout from '../components/Layout';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Users, GraduationCap, UserRoundCheck, HeartHandshake } from 'lucide-react';
import { motion } from 'motion/react';
import { useOrganizationContext } from '@/context/OrganizationContext';
import { analyticsApi } from '@/lib/services/analyticsApi';
import type { OrganizationAnalyticsResponse, OrganizationAnalyticsYearPoint } from '@/lib/types/analytics';

function formatChartData(points: OrganizationAnalyticsYearPoint[]) {
  return [...points]
    .sort((left, right) => left.year - right.year)
    .map((point) => ({
      year: String(point.year),
      count: point.count,
    }));
}

export default function Analytics() {
  const { organization, loading: organizationLoading } = useOrganizationContext();
  const [analytics, setAnalytics] = useState<OrganizationAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (organizationLoading || !organization) {
      return;
    }

    const organizationId = organization.id;
    let cancelled = false;

    async function fetchAnalytics() {
      try {
        setLoading(true);
        setError(null);
        const response = await analyticsApi.getOrganizationAnalytics(organizationId);

        if (!cancelled) {
          setAnalytics(response);
        }
      } catch (err) {
        if (!cancelled) {
          setAnalytics(null);
          setError(err instanceof Error ? err.message : 'Failed to fetch analytics.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchAnalytics();

    return () => {
      cancelled = true;
    };
  }, [organization, organizationLoading, refreshKey]);

  const studentGrowthData = formatChartData(analytics?.student_enrollment_growth ?? []);
  const parentEngagementData = formatChartData(analytics?.parent_engagement ?? []);

  if (organizationLoading || loading) {
    return (
      <Layout title="Organization Analytics">
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-navy/20 border-t-primary-navy" />
        </div>
      </Layout>
    );
  }

  if (!organization) {
    return (
      <Layout title="Organization Analytics">
        <div className="p-4 lg:p-8">
          <div className="rounded-2xl border border-outline-variant bg-white p-6 text-center">
            <p className="text-primary-navy/70">No organization selected.</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Organization Analytics">
        <div className="p-4 lg:p-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="mb-4 text-red-800">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                setAnalytics(null);
                setRefreshKey((current) => current + 1);
              }}
              className="text-sm font-medium text-primary-navy hover:underline"
            >
              Refresh
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Organization Analytics">
      <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatCard label="Total Students" value={analytics?.totals.students ?? 0} icon={GraduationCap} />
          <StatCard label="Branch Admins" value={analytics?.totals.branch_admins ?? 0} icon={UserRoundCheck} />
          <StatCard label="Teachers" value={analytics?.totals.teachers ?? 0} icon={Users} />
          <StatCard label="Parents" value={analytics?.totals.parents ?? 0} icon={HeartHandshake} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 lg:p-8 rounded-xl border border-outline-variant shadow-sm"
          >
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary-navy mb-6 lg:mb-8">Student Enrollment Growth</h3>
            <div className="h-64 lg:h-80">
              {studentGrowthData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={studentGrowthData}>
                    <defs>
                      <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1A237E" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#1A237E" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DBD9E1" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#1A237E40', fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#1A237E40', fontWeight: 700 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#1A237E" fillOpacity={1} fill="url(#colorStudents)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-outline-variant bg-surface text-sm text-primary-navy/50">
                  No enrollment growth data available.
                </div>
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 lg:p-8 rounded-xl border border-outline-variant shadow-sm"
          >
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary-navy mb-6 lg:mb-8">Parent Engagement</h3>
            <div className="h-64 lg:h-80">
              {parentEngagementData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={parentEngagementData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DBD9E1" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#1A237E40', fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#1A237E40', fontWeight: 700 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={3} dot={{ r: 6, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-outline-variant bg-surface text-sm text-primary-navy/50">
                  No parent engagement data available.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
