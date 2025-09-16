import React from 'react';
import { Button, Card, Badge } from '@components/ui';
import { 
  Users,
  Crown,
  User,
  Plus,
  Settings
} from 'lucide-react';
import { UserProfile } from '../types';

const TeamsTab: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'captain':
        return <Crown className="w-4 h-4" />;
      case 'coach':
        return <Settings className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'captain':
        return 'bg-yellow-100 text-yellow-700';
      case 'coach':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-[var(--text)]">{profile.teams.length}</div>
          <div className="text-sm text-[var(--text-muted)]">Teams Joined</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-[var(--text)]">
            {profile.teams.filter(team => team.role === 'captain').length}
          </div>
          <div className="text-sm text-[var(--text-muted)]">Teams Captained</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-[var(--text)]">
            {profile.teams.filter(team => team.role === 'player').length}
          </div>
          <div className="text-sm text-[var(--text-muted)]">Teams as Player</div>
        </Card>
      </div>

      {/* Teams List */}
      <div className="space-y-4">
        {profile.teams.length > 0 ? (
          profile.teams.map((team) => (
            <Card key={team.id} className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] rounded-full flex items-center justify-center text-white font-bold">
                    {team.name[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text)]">{team.name}</h3>
                    <p className="text-sm text-[var(--text-muted)]">{team.sport}</p>
                  </div>
                </div>
                <Badge 
                  variant="default" 
                  className={`${getRoleColor(team.role)} border-0`}
                >
                  <div className="flex items-center gap-1">
                    {getRoleIcon(team.role)}
                    <span className="capitalize">{team.role}</span>
                  </div>
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="text-sm text-[var(--text-muted)]">{team.members.length} members</span>
                </div>
                <div className="text-sm text-[var(--text-muted)]">
                  Joined {new Date(team.joinedAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  View Team
                </Button>
                {team.role === 'captain' && (
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-1" />
                    Manage
                  </Button>
                )}
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)] opacity-50" />
            <h3 className="font-semibold text-[var(--text)] mb-2">No Teams Yet</h3>
            <p className="text-[var(--text-muted)] mb-4">
              Join a team or create your own to start playing with others
            </p>
            <div className="flex gap-2 justify-center">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Create Team
              </Button>
              <Button variant="outline" size="sm">
                Find Teams
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Team Actions */}
      <Card className="p-4">
        <h3 className="font-semibold text-[var(--text)] mb-4">Team Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="outline" className="justify-start">
            <Plus className="w-4 h-4 mr-2" />
            Create New Team
          </Button>
          <Button variant="outline" className="justify-start">
            <Users className="w-4 h-4 mr-2" />
            Find Teams to Join
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TeamsTab;
