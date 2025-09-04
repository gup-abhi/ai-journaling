import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Loader } from '@/components/Loader'; // Assuming Loader is in the same directory or a sibling directory

interface EmotionData {
  emotion: string;
  count: number;
}

interface EmotionDistributionChartProps {
  period: 'day' | 'week' | 'month' | 'year';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF69B4', '#8A2BE2'];

const EmotionDistributionChart: React.FC<EmotionDistributionChartProps> = ({ period }) => {
  const [data, setData] = useState<EmotionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmotionData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/api/v1/ai-insights/emotion-distribution/period/${period}`);
        setData(response.data.emotionDistribution);
      } catch (err) {
        console.error('Error fetching emotion distribution:', err);
        setError('Failed to load emotion data.');
        toast.error('Failed to load emotion data.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmotionData();
  }, [period]);

  if (loading) {
    return <Loader className="h-64" />;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  if (data.length === 0) {
    return <div className="text-center py-4 text-gray-500">No emotion data available for this period.</div>;
  }

  return (
    <div className="w-full h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
            nameKey="emotion"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--primary)",
              borderRadius: "8px",
              color: "var(--primary)"
            }}
            itemStyle={{ color: "var(--accent)" }}
            labelStyle={{ color: "var(--primary)" }}
          />
          <Legend wrapperStyle={{ color: 'var(--accent)' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmotionDistributionChart;
