import React from 'react';
import { Button, Card } from '@components/ui';
import { 
  Camera,
  Mail,
  Edit3,
  Gamepad2,
  Check
} from 'lucide-react';
import { UserProfile } from './types';

interface ProfileProgressProps {
  completion: UserProfile['completion'];
  onTaskComplete: (task: keyof UserProfile['completion']) => void;
}

const ProfileProgress: React.FC<ProfileProgressProps> = ({ completion, onTaskComplete }) => {
  const tasks = [
    { key: 'hasPhoto', label: 'Add photo', icon: Camera, completed: completion.hasPhoto },
    { key: 'emailVerified', label: 'Verify email', icon: Mail, completed: completion.emailVerified },
    { key: 'hasBio', label: 'Write bio', icon: Edit3, completed: completion.hasBio },
    { key: 'hasPreferredSport', label: 'Pick preferred sport', icon: Gamepad2, completed: completion.hasPreferredSport }
  ];

  const completedCount = tasks.filter(task => task.completed).length;
  const progress = (completedCount / tasks.length) * 100;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[var(--text)]">Profile Completion</h3>
        <span className="text-sm text-[var(--text-muted)]">{completedCount}/{tasks.length} tasks</span>
      </div>
      
      <div className="w-full bg-[var(--bg-muted)] rounded-full h-2 mb-4">
        <div 
          className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {tasks.map((task) => {
          const IconComponent = task.icon;
          return (
            <button
              key={task.key}
              onClick={() => !task.completed && onTaskComplete(task.key as keyof UserProfile['completion'])}
              className={`flex items-center gap-2 p-2 rounded-lg text-sm transition-colors ${
                task.completed 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-[var(--bg-muted)] text-[var(--text-muted)] hover:bg-[var(--brand-primary)]/10'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              <span>{task.label}</span>
              {task.completed && <Check className="w-4 h-4 ml-auto" />}
            </button>
          );
        })}
      </div>
    </Card>
  );
};

export default ProfileProgress;
