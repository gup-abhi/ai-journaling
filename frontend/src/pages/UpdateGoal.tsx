
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useGoalStore } from '@/stores/goal.store';
import type { Goal } from '@/types/Goal.type';

export function UpdateGoal() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { goals, fetchGoals, updateGoal } = useGoalStore();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [progress, setProgress] = useState('');

  useEffect(() => {
    fetchGoals("");
  }, [fetchGoals]);

  useEffect(() => {
    const goalToUpdate = goals.find((g) => g._id === id);
    if (goalToUpdate) {
      setGoal(goalToUpdate);
      setProgress(goalToUpdate.progress);
    } else {
      // Handle case where goal is not found
      navigate('/goals');
    }
  }, [id, goals, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      await updateGoal(id, progress);
      navigate('/goals');
    }
  };

  if (!goal) {
    return <div>Loading...</div>; // Or some other loading state
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <CardTitle className="text-2xl font-bold">Update Goal</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="goalName">Goal Name</Label>
              <Input
                id="goalName"
                value={goal.name}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="progress">Progress</Label>
              <Select onValueChange={setProgress} value={progress}>
                <SelectTrigger>
                  <SelectValue>{progress || "Select a status"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={goal.description}
                disabled
                className="min-h-[100px]"
              />
            </div>
            <Button type="submit" className="w-full">Update Goal</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
