import React, { useState, useEffect } from 'react';
import { collaborationService } from '../../services/collaborationService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatTimeAgo } from '../../utils/dateUtils';
import { 
  MessagesSquare, 
  Plus, 
  Pin, 
  MessageCircle, 
  Activity, 
  Sparkles, 
  FileText, 
  Clock, 
  CheckCircle2,
  Send
} from 'lucide-react';

export function CollaborationPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [discussions, setDiscussions] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // New discussion modal
  const [modalOpen, setModalOpen] = useState(false);
  const [discTitle, setDiscTitle] = useState('');
  const [discCategory, setDiscCategory] = useState('Architecture');
  const [discContent, setDiscContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dList, aList] = await Promise.all([
        collaborationService.getDiscussions(),
        collaborationService.getActivityTimeline()
      ]);
      setDiscussions(dList || []);
      setActivity(aList || []);
    } catch (err) {
      error(err.message || 'Failed to load collaboration feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    if (!discTitle.trim() || !discContent.trim()) {
      error('Title and message content are required');
      return;
    }

    try {
      setSubmitting(true);
      const created = await collaborationService.postDiscussion(
        { title: discTitle, category: discCategory, content: discContent },
        user
      );
      setDiscussions(prev => [created, ...prev]);
      success('Discussion posted successfully');
      setModalOpen(false);
      setDiscTitle('');
      setDiscContent('');
    } catch (err) {
      error(err.message || 'Failed to post discussion');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Connecting to collaboration channel..." />;
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <MessagesSquare className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>Team Collaboration Hub</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Async team syncs, architectural discussions, release announcements, and audit events.
          </p>
        </div>
        <Button variant="pulse" leftIcon={Plus} onClick={() => setModalOpen(true)}>
          New Announcement
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Discussions Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Active Threads &amp; Announcements
          </h2>

          {discussions.map(disc => (
            <div
              key={disc.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={disc.author?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(disc.author?.name || 'A')}`}
                    alt={disc.author?.name}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-brand-500/20"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {disc.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span>{disc.author?.name}</span>
                      <span>&bull;</span>
                      <span>{formatTimeAgo(disc.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {disc.pinned && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-brand-600 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded-md">
                      <Pin className="w-3 h-3" /> Pinned
                    </span>
                  )}
                  <Badge variant="default" size="sm">
                    {disc.category}
                  </Badge>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {disc.content}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <button
                  onClick={() => success('Discussion reply thread opened.')}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 font-semibold transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{disc.repliesCount || 0} Replies</span>
                </button>

                <button
                  onClick={() => success('Subscribed to thread updates.')}
                  className="text-brand-600 dark:text-brand-400 hover:underline font-semibold"
                >
                  Reply to thread &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Live Event Audit Timeline */}
        <div>
          <Card
            title="Realtime Activity Stream"
            subtitle="Recent actions across projects & tasks"
          >
            <div className="space-y-4">
              {activity.map(act => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <img
                    src={act.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(act.user?.name || 'U')}`}
                    alt={act.user?.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700 flex-shrink-0 mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-800 dark:text-slate-200 font-medium">
                      <strong>{act.user?.name}</strong> {act.detail}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                      <span>{act.target}</span>
                      <span>&bull;</span>
                      <span>{formatTimeAgo(act.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* New Discussion Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Post New Announcement / Discussion"
        subtitle="Share important architectural updates or team-wide notices"
      >
        <form onSubmit={handleCreateDiscussion} className="space-y-4">
          <Input
            label="Thread Subject / Title"
            required
            value={discTitle}
            onChange={e => setDiscTitle(e.target.value)}
            placeholder="e.g. Migration Freeze Window & Staging Rollout Plan"
          />

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Category
            </label>
            <select
              value={discCategory}
              onChange={e => setDiscCategory(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              <option value="Architecture">Architecture</option>
              <option value="QA & Testing">QA & Testing</option>
              <option value="Release Management">Release Management</option>
              <option value="General">General</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Message Content
            </label>
            <textarea
              rows={4}
              value={discContent}
              onChange={e => setDiscContent(e.target.value)}
              placeholder="Provide all context, links to docs, and action items..."
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Publish Announcement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
