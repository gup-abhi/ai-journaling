import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useGoalStore } from "@/stores/goal.store";
import { Trash2, Pencil, CheckCircle, Hourglass, XCircle, PauseCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function Goals() {
  const navigate = useNavigate();
  const location = useLocation();
  const { goals, fetchGoals, deleteGoal } = useGoalStore();

  const queryParams = new URLSearchParams(location.search);
  const initialFilter = queryParams.get("filter") || "all";
  const [filter, setFilter] = useState<string>(initialFilter);

  useEffect(() => {
    fetchGoals(filter);
  }, [fetchGoals, filter]);

  const handleFilterChange = (value: string) => {
    setFilter(value);
    const queryParams = new URLSearchParams(location.search);
    if (value === "all") {
      queryParams.delete("filter");
    } else {
      queryParams.set("filter", value);
    }
    navigate({ search: queryParams.toString() }, { replace: true });
  };

  const getProgressIcon = (progress: string) => {
    switch (progress) {
      case "not-started":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case "in-progress":
        return <Hourglass className="h-4 w-4 text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "on-hold":
        return <PauseCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      {/* Header with responsive layout */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
        <h1 className="text-xl sm:text-2xl font-bold">My Goals</h1>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <Select onValueChange={handleFilterChange} value={filter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="not-started">Not Started</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => navigate("/goals/new")} className="w-full sm:w-auto">
            Add Goal
          </Button>

          <Button 
            onClick={() => navigate("/dashboard")} 
            variant="outline" 
            className="w-full sm:w-auto"
          >
            Go back
          </Button>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
          <Card key={goal._id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">{goal.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getProgressIcon(goal.progress)}
                <p className="text-sm text-muted-foreground">{goal.progress}</p>
              </div>
              <p className="text-sm sm:text-base">{goal.description}</p>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/goals/${goal._id}/update`)}
                className="w-full sm:w-auto"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Update
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteGoal(goal._id)}
                className="w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
