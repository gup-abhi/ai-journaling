import { useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAiInsightStore } from '@/stores/ai-insight.store';
import { Loader } from '@/components/Loader';
import type { Period } from '@/types/Period.type';

const TopStressorsChart = ({ period, limit }: { period: Period, limit: number }) => {
  const { topStressors, isTopStressorsLoading, fetchTopStressors } = useAiInsightStore();

  useEffect(() => {
    fetchTopStressors(period, limit);
  }, [period, limit, fetchTopStressors]);

  if (isTopStressorsLoading) {
    return <Loader className="h-64" />;
  }

  if (topStressors.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No stressor data available for this period.</p>
      </div>
    );
  }

  const chartHeight = Math.max(400, topStressors.length * 40);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart layout="vertical" data={topStressors} barCategoryGap={10}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="trigger" width={150} tick={{ fontSize: 12 }} interval={0} />
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
        <Legend />
        <Bar dataKey="frequency" fill="var(--primary)" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TopStressorsChart;
