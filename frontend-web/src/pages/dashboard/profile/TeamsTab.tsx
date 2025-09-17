import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal } from '@components/ui';
import { 
  Users, 
  Plus, 
  Search, 
  Crown, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Trophy, 
  Star,
  Settings,
  UserPlus,
  UserMinus,
  Shield,
  Gamepad2,
  Clock,
  ChevronRight,
  MoreVertical,
  Edit,
  Trash2,
  Share2,
  QrCode
} from 'lucide-react';
import { apiClient } from '@lib/apiClient';
import { toast } from 'react-toastify';

interface TeamsTabProps {
  profile: {
    id: string;
    username: string;
    displayName: string;
  };
}

interface Team {
  id: string;
  name: string;
  sport: string;
  description: string;
  role: 'captain' | 'player' | 'coach';
  joinedAt: string;
  roster: TeamMember[];
  isActive: boolean;
  stats: {
    totalGames: number;
    wins: number;
    winRate: number;
    currentStreak: number;
  };
  nextGame?: {
    id: string;
    date: string;
    time: string;
    location: string;
    opponent?: string;
  };
}

interface TeamMember {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  role: 'captain' | 'player' | 'coach';
  joinedAt: string;
  stats: {
    gamesPlayed: number;
    rating: number;
  };
}

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  onInviteSent: (invite: any) => void;
}

const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, teamId, onInviteSent }) => {
  const [inviteMethod, setInviteMethod] = useState<'username' | 'email' | 'phone'>('username');
  const [inviteValue, setInviteValue] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendInvite = async () => {
    if (!inviteValue.trim()) return;

    try {
      setLoading(true);
      const response = await apiClient.post(`/api/v1/teams/${teamId}/invite`, {
        method: inviteMethod,
        value: inviteValue,
        message: message || `Join our ${inviteMethod === 'username' ? 'team' : 'team'}!`
      });

      onInviteSent(response.data);
      toast.success('Invite sent successfully!');
      onClose();
      setInviteValue('');
      setMessage('');
    } catch (error) {
      console.error('Error sending invite:', error);
      toast.error('Failed to send invite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Invite to Team</h2>
          <p className="text-[var(--text-muted)]">Send an invitation to join your team</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Invite Method</label>
            <div className="flex gap-2">
              {[
                { value: 'username', label: 'Username', icon: User },
                { value: 'email', label: 'Email', icon: Mail },
                { value: 'phone', label: 'Phone', icon: Phone }
              ].map((method) => (
                <button
                  key={method.value}
                  onClick={() => setInviteMethod(method.value as any)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    inviteMethod === method.value
                      ? 'bg-[var(--brand-primary)] text-white'
                      : 'bg-[var(--bg-muted)] text-[var(--text-muted)] hover:bg-[var(--bg-contrast)]'
                  }`}
                >
                  <method.icon className="w-4 h-4" />
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {inviteMethod === 'username' ? 'Username' : inviteMethod === 'email' ? 'Email Address' : 'Phone Number'}
            </label>
            <input
              type="text"
              value={inviteValue}
              onChange={(e) => setInviteValue(e.target.value)}
              placeholder={`Enter ${inviteMethod === 'username' ? 'username' : inviteMethod === 'email' ? 'email' : 'phone number'}`}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Personal Message (Optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message to your invitation..."
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg resize-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSendInvite}
            disabled={!inviteValue.trim() || loading}
            className="flex-1"
          >
            {loading ? 'Sending...' : 'Send Invite'}
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default function TeamsTab({ profile }: TeamsTabProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load teams
  useEffect(() => {
    const loadTeams = async () => {
      try {
        setLoading(true);
        
        try {
          // Try real API first
          const response = await apiClient.get('/api/v1/teams/my-teams');
          setTeams(response.data);
        } catch (apiError) {
          console.warn('API call failed, using mock data:', apiError);
          
          // Enhanced Nepal-themed mock teams
          const mockTeams: Team[] = [
            {
              id: '1',
              name: 'Everest Thunders 🏔️',
              sport: 'Basketball',
              description: 'Rise above challenges like Mount Everest - competitive basketball with Gurkha spirit!',
              role: 'captain',
              joinedAt: '2024-01-15',
              isActive: true,
              roster: [
                {
                  id: '1',
                  username: 'player123',
                  displayName: 'राम शेरचन', // Ram Sherchan
                  role: 'captain',
                  joinedAt: '2024-01-15',
                  stats: { gamesPlayed: 25, rating: 4.8 }
                },
                {
                  id: '2',
                  username: 'player456',
                  displayName: 'सीता गुरुङ', // Sita Gurung  
                  role: 'player',
                  joinedAt: '2024-01-20',
                  stats: { gamesPlayed: 20, rating: 4.6 }
                },
                {
                  id: '3',
                  username: 'player789',
                  displayName: 'अर्जुन तामाङ', // Arjun Tamang
                  role: 'player',
                  joinedAt: '2024-02-01',
                  stats: { gamesPlayed: 15, rating: 4.4 }
                },
                {
                  id: '4',
                  username: 'player101',
                  displayName: 'प्रिया न्यौपाने', // Priya Nyaupane
                  role: 'player',
                  joinedAt: '2024-02-05',
                  stats: { gamesPlayed: 18, rating: 4.7 }
                }
              ],
              stats: {
                totalGames: 30,
                wins: 22,
                winRate: 73.3,
                currentStreak: 5
              },
              nextGame: {
                id: 'game1',
                date: '2024-01-25',
                time: '18:00',
                location: 'Durbar Basketball Complex',
                opponent: 'Annapurna Warriors 🏔️'
              }
            },
            {
              id: '2',
              name: 'Kathmandu Futsal FC ⚽',
              sport: 'Futsal',
              description: 'खेल भावना - Play with passion! Community futsal team from the heart of Nepal',
              role: 'player',
              joinedAt: '2024-02-10',
              isActive: true,
              roster: [
                {
                  id: '4',
                  username: 'captain1',
                  displayName: 'लक्ष्मी श्रेष्ठ', // Laxmi Shrestha
                  role: 'captain',
                  joinedAt: '2024-01-01',
                  stats: { gamesPlayed: 40, rating: 4.9 }
                },
                {
                  id: '1',
                  username: 'player123',
                  displayName: 'राम शेरचन',
                  role: 'player',
                  joinedAt: '2024-02-10',
                  stats: { gamesPlayed: 12, rating: 4.5 }
                },
                {
                  id: '5',
                  username: 'player202',
                  displayName: 'बिक्रम राई', // Bikram Rai
                  role: 'player',
                  joinedAt: '2024-02-12',
                  stats: { gamesPlayed: 8, rating: 4.3 }
                }
              ],
              stats: {
                totalGames: 20,
                wins: 12,
                winRate: 60.0,
                currentStreak: 2
              },
              nextGame: {
                id: 'game2',
                date: '2024-01-26',
                time: '19:30',
                location: 'New Road Sports Ground',
                opponent: 'Pokhara Lake FC ⚽'
              }
            },
            {
              id: '3',
              name: 'Rhododendron Volleyball 🌺',
              sport: 'Volleyball',
              description: 'Blooming with teamwork - Nepal\'s national flower inspires our unity and strength',
              role: 'player',
              joinedAt: '2024-01-20',
              isActive: true,
              roster: [
                {
                  id: '6',
                  username: 'captain2',
                  displayName: 'अनिता लामा', // Anita Lama
                  role: 'captain',
                  joinedAt: '2024-01-10',
                  stats: { gamesPlayed: 35, rating: 4.7 }
                },
                {
                  id: '1',
                  username: 'player123',
                  displayName: 'राम शेरचन',
                  role: 'player',
                  joinedAt: '2024-01-20',
                  stats: { gamesPlayed: 8, rating: 4.2 }
                },
                {
                  id: '7',
                  username: 'player303',
                  displayName: 'सुरेश महर्जन', // Suresh Maharjan
                  role: 'player',
                  joinedAt: '2024-01-22',
                  stats: { gamesPlayed: 10, rating: 4.4 }
                }
              ],
              stats: {
                totalGames: 15,
                wins: 9,
                winRate: 60.0,
                currentStreak: 1
              }
            }
          ];
          
          setTeams(mockTeams);
        }
      } catch (error) {
        console.error('Error loading teams:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, []);

  // Filter teams based on search
  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.sport.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle invite
  const handleInvite = (team: Team) => {
    setSelectedTeam(team);
    setShowInviteModal(true);
  };

  // Handle invite sent
  const handleInviteSent = (invite: any) => {
    console.log('Invite sent:', invite);
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'captain': return Crown;
      case 'coach': return Shield;
      default: return User;
    }
  };

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'captain': return 'text-yellow-600';
      case 'coach': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">My Teams</h3>
            <p className="text-[var(--text-muted)]">
              Manage your teams, invite players, and track team performance
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Team
            </Button>
          </div>
        </div>
      </Card>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
          />
        </div>
      </Card>

      {/* Teams List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-[var(--bg-muted)] rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-[var(--bg-muted)] rounded w-1/3"></div>
                  <div className="h-4 bg-[var(--bg-muted)] rounded w-1/2"></div>
                  <div className="h-4 bg-[var(--bg-muted)] rounded w-2/3"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredTeams.length > 0 ? (
        <div className="space-y-4">
          {filteredTeams.map((team) => {
            const RoleIcon = getRoleIcon(team.role);
            const roleColor = getRoleColor(team.role);

            return (
              <Card key={team.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Team Avatar */}
                  <div className="w-16 h-16 bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] rounded-lg flex items-center justify-center text-white text-2xl font-bold">
                    {team.sport === 'Basketball' ? '🏀' : team.sport === 'Futsal' ? '⚽' : '🏐'}
                  </div>

                  {/* Team Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
                          {team.name}
                        </h4>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="default">
                            {team.sport}
                          </Badge>
                          <div className={`flex items-center gap-1 text-sm ${roleColor}`}>
                            <RoleIcon className="w-4 h-4" />
                            <span className="capitalize">{team.role}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleInvite(team)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <UserPlus className="w-4 h-4" />
                          Invite
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-[var(--text-muted)] mb-4">{team.description}</p>

                    {/* Team Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[var(--text-primary)]">
                          {team.stats.totalGames}
                        </div>
                        <div className="text-sm text-[var(--text-muted)]">Games</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-500">
                          {team.stats.winRate}%
                        </div>
                        <div className="text-sm text-[var(--text-muted)]">Win Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-500">
                          {team.stats.currentStreak}
                        </div>
                        <div className="text-sm text-[var(--text-muted)]">Streak</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-500">
                          {team.roster.length}
                        </div>
                        <div className="text-sm text-[var(--text-muted)]">Members</div>
                      </div>
                    </div>

                    {/* Next Game */}
                    {team.nextGame && (
                      <div className="bg-gradient-to-r from-[var(--brand-primary)]/10 to-[var(--brand-secondary)]/10 p-4 rounded-lg mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-[var(--brand-primary)]" />
                          <h5 className="font-semibold text-[var(--text-primary)]">Next Game</h5>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{team.nextGame.date} at {team.nextGame.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{team.nextGame.location}</span>
                          </div>
                          {team.nextGame.opponent && (
                            <div className="flex items-center gap-1">
                              <Trophy className="w-3 h-3" />
                              <span>vs {team.nextGame.opponent}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Roster Preview */}
                    <div>
                      <h5 className="font-semibold text-[var(--text-primary)] mb-2">Team Roster</h5>
                      <div className="flex flex-wrap gap-2">
                        {team.roster.slice(0, 5).map((member) => (
                          <div key={member.id} className="flex items-center gap-2 bg-[var(--bg-muted)] px-3 py-2 rounded-lg">
                            <div className="w-6 h-6 bg-[var(--brand-primary)] rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {member.displayName.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-[var(--text-primary)]">
                                {member.displayName}
                              </div>
                              <div className="text-xs text-[var(--text-muted)]">
                                {member.role} • {member.stats.gamesPlayed} games
                              </div>
                            </div>
                          </div>
                        ))}
                        {team.roster.length > 5 && (
                          <div className="flex items-center gap-2 bg-[var(--bg-muted)] px-3 py-2 rounded-lg">
                            <div className="w-6 h-6 bg-[var(--text-muted)] rounded-full flex items-center justify-center text-white text-xs font-bold">
                              +{team.roster.length - 5}
                            </div>
                            <span className="text-sm text-[var(--text-muted)]">more</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)] opacity-50" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No Teams Found</h3>
          <p className="text-[var(--text-muted)] mb-4">
            {searchQuery ? 'No teams match your search criteria.' : "You haven't joined any teams yet."}
          </p>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Your First Team
          </Button>
        </Card>
      )}

      {/* Invite Modal */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        teamId={selectedTeam?.id || ''}
        onInviteSent={handleInviteSent}
      />
    </div>
  );
}
