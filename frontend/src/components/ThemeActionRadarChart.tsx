import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Loader } from './Loader';

interface ThemeActionData {
  theme: string;
  action_count: number;
}

interface ThemeActionRadarChartProps {
  period: 'day' | 'week' | 'month' | 'year';
}

const ThemeActionRadarChart: React.FC<ThemeActionRadarChartProps> = ({ period }) => {
  const [data, setData] = useState<ThemeActionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThemeActionData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/api/v1/ai-insights/theme-action-radar/period/${period}`);
        setData(response.data.themeActionData);
      } catch (err) {
        console.error('Error fetching theme action radar data:', err);
        setError('Failed to load theme action data.');
        toast.error('Failed to load theme action data.');
      } finally {
        setLoading(false);
      }
    };

    fetchThemeActionData();
  }, [period]);

  if (loading) {
    return <Loader className="h-64" />;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  if (data.length === 0) {
    return <div className="text-center py-4 text-gray-500">No theme action data available for this period.</div>;
  }

  // Calculate max action count for PolarRadiusAxis domain
  const maxActionCount = Math.max(...data.map(item => item.action_count));

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="theme" />
          <PolarRadiusAxis domain={[0, maxActionCount + 1]} /> {/* Adjust domain based on max action count */}
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
          <Radar name="Action Count" dataKey="action_count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ThemeActionRadarChart;
