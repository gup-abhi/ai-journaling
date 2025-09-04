import { useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAiInsightStore } from '@/stores/ai-insight.store';
import { Loader } from '@/components/Loader';
import type { Period } from '@/types/Period.type';

const CognitivePatternFrequencyChart = ({ period, limit }: { period: Period, limit: number }) => {
  const { cognitivePatternFrequency, isCognitivePatternLoading, fetchCognitivePatternFrequency } = useAiInsightStore();

  useEffect(() => {
    fetchCognitivePatternFrequency(period, limit);
  }, [period, limit, fetchCognitivePatternFrequency]);

  if (isCognitivePatternLoading) {
    return <Loader className="h-64" />;
  }

  if (cognitivePatternFrequency.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No cognitive pattern data available for this period.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart layout="vertical" data={cognitivePatternFrequency}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="pattern" width={150} tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--background)",
            border: "1px solid var(--primary)",
            borderRadius: "8px",
            color: "var(--accent)"
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

export default CognitivePatternFrequencyChart;