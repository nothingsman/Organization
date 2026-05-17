import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface PerformanceChartProps {
  data: number[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const chartData = data.map((val, i) => ({
    name: `Term ${i + 1}`,
    value: val
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DBD9E1" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 700, fill: '#1A237E', opacity: 0.4 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 700, fill: '#1A237E', opacity: 0.4 }}
          />
          <Tooltip 
            cursor={{ fill: '#F5F2FB' }}
            contentStyle={{ 
              borderRadius: '8px', 
              border: '1px solid #DBD9E1',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              padding: '12px'
            }}
            labelStyle={{ fontWeight: 700, marginBottom: '4px', fontSize: '12px' }}
            itemStyle={{ fontSize: '14px', fontWeight: 600, color: '#1A237E' }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index === chartData.length - 1 ? '#1A237E' : '#1A237E40'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
