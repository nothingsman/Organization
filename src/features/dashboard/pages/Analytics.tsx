import React from 'react';
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
import { TrendingUp, Users, GraduationCap, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';

const growthData = [
  { name: 'Jan', students: 4000, revenue: 2400 },
  { name: 'Feb', students: 4500, revenue: 2800 },
  { name: 'Mar', students: 4200, revenue: 3200 },
  { name: 'Apr', students: 5000, revenue: 3900 },
  { name: 'May', students: 5800, revenue: 4800 },
  { name: 'Jun', students: 6200, revenue: 5200 },
];

export default function Analytics() {
  return (
    <Layout title="Organization Analytics">
      <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatCard label="Total Students" value="12,482" icon={GraduationCap} trend={{ value: 12, isPositive: true }} />
          <StatCard label="Total Staff" value="842" icon={Users} trend={{ value: 3.4, isPositive: true }} />
          <StatCard label="Active Sessions" value="48" icon={TrendingUp} />
          <StatCard label="Monthly Revenue" value="$42,800" icon={DollarSign} trend={{ value: 8.2, isPositive: true }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 lg:p-8 rounded-xl border border-outline-variant shadow-sm"
          >
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary-navy mb-6 lg:mb-8">Student Enrollment Growth</h3>
            <div className="h-64 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1A237E" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#1A237E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DBD9E1" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#1A237E40', fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#1A237E40', fontWeight: 700 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="students" stroke="#1A237E" fillOpacity={1} fill="url(#colorStudents)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 lg:p-8 rounded-xl border border-outline-variant shadow-sm"
          >
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary-navy mb-6 lg:mb-8">Revenue Analytics (USD)</h3>
            <div className="h-64 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DBD9E1" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#1A237E40', fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#1A237E40', fontWeight: 700 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} dot={{ r: 6, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
