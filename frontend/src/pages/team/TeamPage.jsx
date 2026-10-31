import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ROLE_LABELS } from '../../utils/formatters';
import { 
  Users, 
  Search, 
  UserPlus, 
  ShieldCheck, 
  Briefcase, 
  UserCheck, 
  Flame, 
  CheckCircle2, 
  AlertCircle,
  FolderKanban
} from 'lucide-react';

export function TeamPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Invite Modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('EMPLOYEE');
  const [inviteTitle, setInviteTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadTeam = async () => {
    try {
      setLoading(true);
      const list = await userService.getAll();
      setMembers(list || []);
    } catch (err) {
      error(err.message || 'Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      error('Name and Email are required');
      return;
    }

    try {
      setSubmitting(true);
      // In demo mode or live, invite adds member
      const newMember = {
        id: Date.now(),
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        role: inviteRole,
        title: inviteTitle.trim() || (inviteRole === 'PROJECT_MANAGER' ? 'Project Manager' : 'Software Engineer'),
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(inviteName)}`,
        assignedTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
        activeWorkload: 'OPTIMAL',
        activeProjects: []
      };
      setMembers(prev => [newMember, ...prev]);
      success(`Invitation sent to ${inviteEmail}`);
      setInviteModalOpen(false);
      setInviteName('');
      setInviteEmail('');
      setInviteTitle('');
    } catch (err) {
      error(err.message || 'Failed to send invitation');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMembers = members.filter(m => {
    if (search) {
      const q = search.toLowerCase();
      const match = m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.title?.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (roleFilter && m.role !== roleFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>Team &amp; Workload Intelligence</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Workload distribution thresholds: <strong>Optimal (1-3 active tasks)</strong>, <strong>Heavy (4-5 tasks)</strong>, <strong>Overloaded (&ge;6 tasks)</strong>.
          </p>
        </div>

        {/* Invite action (for PM & Admin) */}
        {(user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER') && (
          <Button variant="pulse" leftIcon={UserPlus} onClick={() => setInviteModalOpen(true)}>
            Invite Colleague
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or title..."
            className="w-full text-xs pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Administrators</option>
            <option value="PROJECT_MANAGER">Project Managers</option>
            <option value="EMPLOYEE">Team Members</option>
          </select>
        </div>
      </div>

      {/* Members Grid */}
      {loading ? (
        <LoadingSpinner text="Computing team capacity analytics..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map(member => {
            const workload = member.activeWorkload || 'OPTIMAL';
            const isOverloaded = workload === 'OVERLOADED';
            const isHeavy = workload === 'HEAVY';

            return (
              <div
                key={member.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  {/* Top: Avatar, Name, Role */}
                  <div className="flex items-start gap-3.5">
                    <img
                      src={member.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`}
                      alt={member.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-brand-500/20 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {member.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {member.title || ROLE_LABELS[member.role]}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <Badge
                          variant={member.role === 'ADMIN' ? 'accent' : member.role === 'PROJECT_MANAGER' ? 'primary' : 'default'}
                          size="sm"
                        >
                          {ROLE_LABELS[member.role] || member.role}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Workload Metric Gauge */}
                  <div className="mt-6 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
                      <span className="text-slate-500">Active Task Load</span>
                      <span className={isOverloaded ? 'text-rose-600 dark:text-rose-400 font-bold' : isHeavy ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-bold'}>
                        {member.assignedTasks} Active ({workload})
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOverloaded ? 'bg-rose-500' : isHeavy ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, (member.assignedTasks / 6) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Delivery Stats */}
                  <div className="grid grid-cols-2 gap-2 mt-3 text-center text-xs">
                    <div className="p-2 rounded-lg bg-slate-50/60 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Completed</span>
                      <strong className="text-slate-800 dark:text-slate-200">{member.completedTasks}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50/60 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Overdue</span>
                      <strong className={member.overdueTasks > 0 ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}>
                        {member.overdueTasks}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Project Memberships */}
                {member.activeProjects && member.activeProjects.length > 0 && (
                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                    <span className="text-slate-400 block mb-1.5">Projects:</span>
                    <div className="flex flex-wrap gap-1">
                      {member.activeProjects.map((proj, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-medium">
                          {proj}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Invite Colleague Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite New Colleague"
        subtitle="Provision an enterprise access seat in Milesora"
      >
        <form onSubmit={handleInvite} className="space-y-4">
          <Input
            label="Full Name"
            required
            value={inviteName}
            onChange={e => setInviteName(e.target.value)}
            placeholder="e.g. Maya Lin"
          />

          <Input
            label="Work Email"
            type="email"
            required
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="e.g. maya@company.com"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Role"
              required
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value)}
            >
              <option value="EMPLOYEE">Team Member / Engineer</option>
              <option value="PROJECT_MANAGER">Project Manager</option>
              <option value="ADMIN">Administrator</option>
            </Select>

            <Input
              label="Job Title"
              value={inviteTitle}
              onChange={e => setInviteTitle(e.target.value)}
              placeholder="e.g. Senior Security Architect"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
