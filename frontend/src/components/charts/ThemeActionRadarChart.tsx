import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useAiInsightStore } from '@/stores/ai-insight.store';
import { Loader } from '@/components/Loader';
import type { Period } from '@/types/Period.type';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ThemeActionRadarChart: React.FC = () => {
  const [period, setPeriod] = useState<Period>('month');
  const { themeActionRadarData, isThemeActionLoading, fetchThemeActionRadarData } = useAiInsightStore();

  useEffect(() => {
    fetchThemeActionRadarData(period);
  }, [period, fetchThemeActionRadarData]);

  if (isThemeActionLoading) {
    return <Loader className="h-64" />;
  }

  if (themeActionRadarData.length === 0) {
    return <div className="text-center py-4 text-gray-500">No theme action data available for this period.</div>;
  }

  // Calculate max action count for PolarRadiusAxis domain
  const maxActionCount = Math.max(...themeActionRadarData.map(item => item.action_count));

  return (
    <div>
        <div className="flex justify-end mb-4">
            <Select value={period} onValueChange={(value: Period) => setPeriod(value)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="week">Weekly</SelectItem>
                    <SelectItem value="month">Monthly</SelectItem>
                    <SelectItem value="year">Yearly</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={themeActionRadarData}>
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
    </div>
  );
};

export default ThemeActionRadarChart;