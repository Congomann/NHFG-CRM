import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Agent } from '../types';

interface ChartData extends Agent {
    totalPremium: number;
    overrideEarned: number;
}

interface AgentPerformanceChartProps {
  data: ChartData[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const AgentPerformanceChart: React.FC<AgentPerformanceChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart
        data={data}
        margin={{
          top: 5, right: 20, left: 20, bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis 
            yAxisId="left" 
            orientation="left" 
            stroke="#0284c7" 
            label={{ value: 'Total AP Sold', angle: -90, position: 'insideLeft' }} 
            tickFormatter={(value) => formatCurrency(Number(value))} 
        />
        <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#16a34a" 
            label={{ value: 'Override Earned', angle: 90, position: 'insideRight' }} 
            tickFormatter={(value) => formatCurrency(Number(value))} 
        />
        <Tooltip formatter={(value: number, name: string) => [formatCurrency(value), name === 'totalPremium' ? 'Total AP Sold' : 'Override Earned']} />
        <Legend />
        <Bar yAxisId="left" dataKey="totalPremium" name="Total AP Sold" fill="#0284c7" />
        <Line yAxisId="right" type="monotone" dataKey="overrideEarned" name="Override Earned" stroke="#16a34a" strokeWidth={2} />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default AgentPerformanceChart;
