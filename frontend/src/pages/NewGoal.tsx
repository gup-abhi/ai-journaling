import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useGoalStore } from '@/stores/goal.store';


export function NewGoal() {
  const [goalName, setGoalName] = useState('');
  const [progress, setProgress] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();
  const addGoal = useGoalStore((state) => state.addGoal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addGoal({ name: goalName, progress, description });
    navigate('/goals');
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <CardTitle className="text-2xl font-bold">New Goal</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="goalName">Goal Name</Label>
              <Input
                id="goalName"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="progress">Progress</Label>
              <Select onValueChange={setProgress} value={progress}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <Button type="submit" className="w-full">Save Goal</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}