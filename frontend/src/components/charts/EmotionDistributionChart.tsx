import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAiInsightStore } from '@/stores/ai-insight.store';
import { Loader } from '@/components/Loader';
import type { Period } from '@/types/Period.type';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF69B4', '#8A2BE2'];

const EmotionDistributionChart = () => {
    const [period, setPeriod] = useState<Period>('month');
    const { emotionDistribution, isEmotionDistributionLoading, fetchEmotionDistribution } = useAiInsightStore();

    useEffect(() => {
        fetchEmotionDistribution(period);
    }, [period, fetchEmotionDistribution]);

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
            {isEmotionDistributionLoading ? (
                <Loader className="h-64" />
            ) : emotionDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={500}>
                    <PieChart>
                        <Pie
                            data={emotionDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="emotion"
                        >
                            {emotionDistribution.map((_, index) => (
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
            ) : (
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">No emotion data available for this period.</p>
                </div>
            )}
        </div>
    );
};

export default EmotionDistributionChart;