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

  // initialize filter from query before render
  const queryParams = new URLSearchParams(location.search);
  const initialFilter = queryParams.get("filter") || "all";
  const [filter, setFilter] = useState<string>(initialFilter);

  // fetch whenever filter changes
  useEffect(() => {
    fetchGoals(filter);
  }, [fetchGoals, filter]);

  // update url + state when user changes filter
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
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My Goals</h1>
        <div className="flex items-center gap-4">
          <Select onValueChange={handleFilterChange} value={filter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Not Started">Not Started</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="On Hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => navigate("/goals/new")} className="mr-4">
            Add Goal
          </Button>
          <Button onClick={() => navigate("/dashboard")} variant="outline">
            Go back to dashboard
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
          <Card key={goal._id}>
            <CardHeader>
              <CardTitle>{goal.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {getProgressIcon(goal.progress)}
                <p className="text-sm text-muted-foreground">{goal.progress}</p>
              </div>
              <p>{goal.description}</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/goals/${goal._id}/update`)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Update
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteGoal(goal._id)}
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
