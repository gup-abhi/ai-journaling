import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAiInsightStore } from '@/stores/ai-insight.store';
import { Loader } from '@/components/Loader';
import type { Period } from '@/types/Period.type';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TopStressorsChart = () => {
    const [period, setPeriod] = useState<Period>('month');
    const [limit, setLimit] = useState(10);
    const { topStressors, isTopStressorsLoading, fetchTopStressors } = useAiInsightStore();

    useEffect(() => {
        fetchTopStressors(period, limit);
    }, [period, limit, fetchTopStressors]);

    const chartHeight = Math.max(400, topStressors.length * 40);

    return (
        <div>
            <div className="flex justify-end gap-4 mb-4">
                <Select value={String(limit)} onValueChange={(value) => setLimit(Number(value))}>
                    <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Limit" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="15">15</SelectItem>
                    </SelectContent>
                </Select>
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
            {isTopStressorsLoading ? (
                <Loader className="h-64" />
            ) : topStressors.length > 0 ? (
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
            ) : (
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">No stressor data available for this period.</p>
                </div>
            )}
        </div>
    );
};

export default TopStressorsChart;