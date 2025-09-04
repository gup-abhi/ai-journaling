import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Loader } from '@/components/Loader';

interface ThematicSentimentData {
  theme: string;
  positive: number;
  negative: number;
  neutral: number;
  mixed: number;
  total_count: number;
}

interface ThematicSentimentChartProps {
  period: 'day' | 'week' | 'month' | 'year';
}

const ThematicSentimentChart: React.FC<ThematicSentimentChartProps> = ({ period }) => {
  const [data, setData] = useState<ThematicSentimentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThematicSentimentData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/api/v1/ai-insights/thematic-sentiment/period/${period}`);
        setData(response.data.thematicSentiment);
      } catch (err) {
        console.error('Error fetching thematic sentiment data:', err);
        setError('Failed to load thematic sentiment data.');
        toast.error('Failed to load thematic sentiment data.');
      } finally {
        setLoading(false);
      }
    };

    fetchThematicSentimentData();
  }, [period]);

  if (loading) {
    return <Loader className="h-64" />;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  if (data.length === 0) {
    return <div className="text-center py-4 text-gray-500">No thematic sentiment data available for this period.</div>;
  }

  return (
    <div className="w-full h-[600px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 40,
            right: 30,
            left: 20,
            bottom: 80, // Increased bottom margin for rotated labels
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="theme" angle={-45} textAnchor="end" interval={0} height={80} tick={{ fontSize: 12 }} />
          <YAxis />
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
          <Legend verticalAlign="top" align="right" />
          <Bar dataKey="positive" stackId="a" fill="#82ca9d" name="Positive" />
          <Bar dataKey="negative" stackId="a" fill="#ffc658" name="Negative" />
          <Bar dataKey="neutral" stackId="a" fill="#8884d8" name="Neutral" />
          <Bar dataKey="mixed" stackId="a" fill="#ff7300" name="Mixed" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ThematicSentimentChart;
