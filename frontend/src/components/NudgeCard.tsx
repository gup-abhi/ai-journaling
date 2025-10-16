import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Info, CheckCircle, Edit3, Calendar, Heart, Star, Clock, ArrowRight } from 'lucide-react';
import type { Nudge } from '@/types/Nudge.type';

interface NudgeCardProps {
  nudge: Nudge;
}

const NudgeCard: React.FC<NudgeCardProps> = ({ nudge }) => {
  const navigate = useNavigate();

  const getPriorityData = () => {
    switch (nudge.priority) {
      case 'high':
        return { icon: AlertCircle, color: 'text-red-500', label: 'High' };
      case 'medium':
        return { icon: Info, color: 'text-yellow-500', label: 'Medium' };
      case 'low':
        return { icon: CheckCircle, color: 'text-green-500', label: 'Low' };
      default:
        return { icon: Info, color: 'text-gray-500', label: 'Info' };
    }
  };

  const getActionData = () => {
    switch (nudge.action) {
      case 'journal_now':
        return { icon: Edit3, label: 'Start Journaling' };
      case 'plan_activity':
        return { icon: Calendar, label: 'Plan Activity' };
      case 'self_care':
        return { icon: Heart, label: 'Practice Self-Care' };
      case 'celebrate':
        return { icon: Star, label: 'Celebrate a Win' };
      case 'plan_weekend':
        return { icon: Calendar, label: 'Plan Your Weekend' };
      case 'optimize_timing':
        return { icon: Clock, label: 'Optimize Your Timing' };
      default:
        return { icon: ArrowRight, label: 'Learn More' };
    }
  };

  const handleActionClick = () => {
    switch (nudge.action) {
      case 'journal_now':
        navigate('/journal/new');
        break;
      case 'plan_activity':
        navigate('/goals/new');
        break;
      case 'self_care':
        navigate('/trends');
        break;
      default:
        // For other actions, you might want a generic page or no navigation
        break;
    }
  };

  const { icon: PriorityIcon, color: priorityColor, label: priorityLabel } = getPriorityData();
  const { icon: ActionIcon, label: actionLabel } = getActionData();

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PriorityIcon className={`h-5 w-5 ${priorityColor}`} />
            <span className={`font-semibold ${priorityColor}`}>{priorityLabel}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(nudge.generatedAt).toLocaleDateString()}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-foreground">{nudge.title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{nudge.message}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleActionClick} variant="outline" size="sm">
          <ActionIcon className="h-4 w-4 mr-2" />
          {actionLabel}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NudgeCard;
