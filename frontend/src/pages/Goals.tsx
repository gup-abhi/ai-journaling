import { useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useGoalStore } from "@/stores/goal.store";
import { Trash2, Pencil } from 'lucide-react';

export function Goals() {
  const navigate = useNavigate();
  const { goals, fetchGoals, deleteGoal } = useGoalStore();

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My Goals</h1>
        <div>
          <Button onClick={() => navigate("/goals/new")} className="mr-4">Add Goal</Button>
          <Button onClick={() => navigate("/dashboard")} variant="outline">Go back to dashboard</Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
          <Card key={goal._id}>
            <CardHeader>
              <CardTitle>{goal.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{goal.progress}</p>
              <p>{goal.description}</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate(`/goals/${goal._id}/update`)}>
                <Pencil className="h-4 w-4 mr-2" />
                Update
              </Button>
              <Button variant="destructive" size="sm" onClick={() => deleteGoal(goal._id)}>
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