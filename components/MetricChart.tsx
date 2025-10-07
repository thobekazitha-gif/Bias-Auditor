import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { FairnessMetricScore } from '../types';

interface MetricChartProps {
    data: FairnessMetricScore[];
    color?: string;
}

const MetricChart: React.FC<MetricChartProps> = ({ data, color = '#ef4444' }) => {
    const chartData = data.map(item => ({ name: item.group, value: item.score }));
    
    return (
        <div style={{ width: '100%', height: 150 }}>
            <ResponsiveContainer>
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <XAxis type="number" domain={[0, 1]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#9ca3af' }} width={60} />
                    <Tooltip 
                        cursor={{ fill: 'rgba(239, 68, 68, 0.1)' }}
                        contentStyle={{ 
                            background: '#1f2937', 
                            border: '1px solid #374151', 
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            color: '#e5e7eb'
                        }} 
                    />
                    <Bar dataKey="value" barSize={20}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MetricChart;