import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { rtdb } from '../firebase';
import { ref, set, get, push, query, orderByChild, equalTo, update } from 'firebase/database';
import { Team, UserAccount } from '../types';
import { Plus, Loader2, Users, Send } from 'lucide-react';
import InviteMemberModal from '../components/InviteMemberModal';

const Teams = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState('');
  const [message, setMessage] = useState('');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const teamsRef = ref(rtdb, 'teams');
        const q = query(teamsRef, orderByChild(`members/${user.uid}/uid`), equalTo(user.uid));
        const snapshot = await get(q);
        if (snapshot.exists()) {
          const teamsData: Team[] = Object.values(snapshot.val());
          setTeams(teamsData);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
        setMessage('Failed to load teams.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [user]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !teamName.trim()) return;

    const newTeamRef = push(ref(rtdb, 'teams'));
    const newTeam: Team = {
      id: newTeamRef.key!,
      name: teamName,
      ownerId: user.uid,
      members: {
        [user.uid]: {
          uid: user.uid,
          email: user.email!,
          role: 'owner',
        },
      },
      createdAt: Date.now(),
    };

    try {
      await set(newTeamRef, newTeam);
      setTeams([...teams, newTeam]);
      setTeamName('');
      setMessage('Team created successfully!');
    } catch (error) {
      console.error('Error creating team:', error);
      setMessage('Failed to create team.');
    }
  };

  const handleInvite = async (email: string) => {
    if (!selectedTeam || !user) return;

    try {
      // Find user by email
      const accountsRef = ref(rtdb, 'accounts');
      const q = query(accountsRef, orderByChild('email'), equalTo(email));
      const snapshot = await get(q);

      if (snapshot.exists()) {
        const accounts = snapshot.val();
        const invitedUserId = Object.keys(accounts)[0];
        const invitedUserAccount = accounts[invitedUserId] as UserAccount;

        if (selectedTeam.members[invitedUserId]) {
          setMessage('User is already a member of this team.');
          return;
        }

        const teamRef = ref(rtdb, `teams/${selectedTeam.id}/members/${invitedUserId}`);
        await set(teamRef, {
          uid: invitedUserAccount.uid,
          email: invitedUserAccount.email,
          role: 'member',
        });

        // Update local state
        const updatedTeams = teams.map(team => {
          if (team.id === selectedTeam.id) {
            return {
              ...team,
              members: {
                ...team.members,
                [invitedUserId]: {
                  uid: invitedUserAccount.uid,
                  email: invitedUserAccount.email,
                  role: 'member',
                }
              }
            }
          }
          return team;
        });
        setTeams(updatedTeams);

        setMessage('Invitation sent successfully!');
        setInviteModalOpen(false);
      } else {
        setMessage('User with this email does not exist.');
      }
    } catch (error) {
      console.error('Error inviting member:', error);
      setMessage('Failed to send invitation.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Team Management</h1>
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Create a New Team</h2>
        <form onSubmit={handleCreateTeam} className="flex items-center gap-4">
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Enter team name"
            className="flex-grow bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" /> Create Team
          </button>
        </form>
        {message && <p className="text-emerald-500 mt-4">{message}</p>}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Your Teams</h2>
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : teams.length > 0 ? (
          <div className="space-y-4">
            {teams.map((team) => (
              <div key={team.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold">{team.name}</h3>
                  <p className="text-zinc-500">{Object.keys(team.members).length} members</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase bg-zinc-800 px-2 py-1 rounded-md">{team.members[user!.uid]?.role}</span>
                  {team.members[user!.uid]?.role === 'owner' && (
                    <button 
                      onClick={() => {
                        setSelectedTeam(team);
                        setInviteModalOpen(true);
                      }}
                      className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all"
                    >
                      <Send className="w-4 h-4" /> Invite
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-2xl">
            <Users className="w-12 h-12 mx-auto text-zinc-700 mb-4" />
            <p className="text-zinc-500">You are not part of any teams yet.</p>
          </div>
        )}
      </div>
      {inviteModalOpen && (
        <InviteMemberModal 
          onClose={() => setInviteModalOpen(false)} 
          onInvite={handleInvite} 
        />
      )}
    </div>
  );
};

export default Teams;
