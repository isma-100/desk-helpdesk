import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { ticketAPI, commentAPI, userAPI, auditAPI } from 'api';
import { useAuth } from 'context/AuthContext';
import { Modal, StatusBadge, PriorityBadge, CategoryTag, Avatar, UserChip, Spinner, FileIcon, Select, FormField } from 'components/common';
import { SkeletonTicketDetail } from 'components/common/Skeletons';
import { ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { relativeTime, formatDateTime, formatBytes, STATUSES, PRIORITIES } from 'utils/helpers';
import { ChatBubbleLeftIcon, LockClosedIcon, PaperClipIcon } from '@heroicons/react/24/outline';

const CommentItem = ({ comment, canDelete, onDelete }) => (
  <div className={`flex gap-3 ${comment.isInternal ? 'bg-purple-50 rounded-xl p-3 border border-purple-100' : 'py-3 border-b border-slate-50 last:border-0'}`}>
    <Avatar user={comment.author} size="sm" />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <span className="text-xs font-semibold text-slate-700">{comment.author?.name}</span>
        {comment.isInternal && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700">
            <LockClosedIcon className="w-2.5 h-2.5" />Internal Note
          </span>
        )}
        <span className="text-[10px] text-slate-400 font-mono ml-auto">{relativeTime(comment.createdAt)}</span>
        {canDelete && (
          <button onClick={() => onDelete(comment._id)} className="text-[10px] text-red-400 hover:text-red-600">Delete</button>
        )}
      </div>
      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
    </div>
  </div>
);

const AuditEvent = ({ event }) => (
  <div className="flex items-center gap-2 py-2 text-xs text-slate-500">
    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
    <span className="font-mono text-slate-400">{relativeTime(event.createdAt)}</span>
    <span className="text-slate-500">{event.description}</span>
    <span className="text-slate-400">by</span>
    <span className="font-medium text-slate-600">{event.performedBy?.name}</span>
  </div>
);

export const TicketDetailModal = ({ ticketId, open, onClose, onUpdated }) => {
  const { user, isStaff, isAdmin } = useAuth();
  const [ticket, setTicket]         = useState(null);
  const [comments, setComments]     = useState([]);
  const [auditLogs, setAuditLogs]   = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [tab, setTab]               = useState('comments');
  const [comment, setComment]       = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [posting, setPosting]       = useState(false);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState({});
  const commentRef = useRef(null);

  useEffect(() => {
    if (!open || !ticketId) return;
    setLoading(true);
    Promise.all([
      ticketAPI.getOne(ticketId),
      commentAPI.getAll(ticketId),
      isStaff ? userAPI.getTechnicians() : Promise.resolve({ data: { data: [] } }),
      isStaff ? auditAPI.getAll({ ticketId }) : Promise.resolve({ data: { data: [] } }),
    ]).then(([t, c, tech, audit]) => {
      setTicket(t.data.data);
      setComments(c.data.data || []);
      setTechnicians(tech.data.data || []);
      setAuditLogs(audit.data.data || []);
    }).catch(() => toast.error('Failed to load ticket'))
      .finally(() => setLoading(false));
  }, [open, ticketId, isStaff]);

  const updateField = async (field, value) => {
    setSaving(p => ({ ...p, [field]: true }));
    try {
      const payload = { [field]: value };
      if (field === 'assignedTo') payload.assignedTo = value || null;
      const res = await ticketAPI.update(ticket._id, payload);
      setTicket(res.data.data);
      onUpdated?.(res.data.data);
      toast.success('Updated');
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setSaving(p => ({ ...p, [field]: false }));
    }
  };

  const saveResolution = async () => {
    await updateField('resolutionNotes', ticket.resolutionNotes);
  };

  const postComment = async () => {
    if (!comment.trim()) return;
    setPosting(true);
    try {
      const res = await commentAPI.create(ticket._id, { content: comment.trim(), isInternal });
      setComments(p => [...p, res.data.data]);
      setComment('');
      setIsInternal(false);
      toast.success('Comment posted');
    } catch (err) {
      toast.error(err.message || 'Failed to post comment');
    } finally { setPosting(false); }
  };

  const deleteComment = async (id) => {
    try {
      await commentAPI.delete(id);
      setComments(p => p.filter(c => c._id !== id));
      toast.success('Comment deleted');
    } catch (err) { toast.error(err.message); }
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={loading ? 'Loading…' : ticket?.title}
      subtitle={ticket ? `${ticket.ticketId} · ${ticket.category} · Opened ${relativeTime(ticket?.createdAt)}` : ''}
      size="xl"
    >
      {loading ? (
        <div className="p-2"><SkeletonTicketDetail /></div>
      ) : !ticket ? (
        <div className="text-center py-10 text-slate-400">Ticket not found</div>
      ) : (
        <div className="flex gap-6">
          {/* ─── Main Column ─── */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={ticket.status} size="lg" />
              <PriorityBadge priority={ticket.priority} />
              <CategoryTag category={ticket.category} />
            </div>

            {/* Description */}
            <div>
              <div className="label">Description</div>
              <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </div>
            </div>

            {/* Resolution (if resolved) */}
            {ticket.resolutionNotes && (
              <div>
                <div className="label">Resolution</div>
                <div className="bg-green-50 rounded-xl border border-green-100 p-4 text-sm text-green-800 leading-relaxed whitespace-pre-wrap">
                  {ticket.resolutionNotes}
                </div>
              </div>
            )}

            {/* Attachments */}
            {ticket.attachments?.length > 0 && (
              <div>
                <div className="label flex items-center gap-1.5"><PaperClipIcon className="w-3 h-3" />Attachments</div>
                <div className="space-y-2">
                  {ticket.attachments.map(att => (
                    <a key={att._id} href={att.path} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors group">
                      <FileIcon mimetype={att.mimetype} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-slate-700 truncate group-hover:text-blue-600">{att.originalName}</div>
                        <div className="text-[10px] text-slate-400">{formatBytes(att.size)}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs: Comments / Audit */}
            <div>
              <div className="flex border-b border-slate-100 mb-3 gap-1">
                {[
                  { key: 'comments', label: `Comments (${comments.filter(c => !c.isInternal || isStaff).length})` },
                  { key: 'history', label: `History (${ticket?.statusHistory?.length || 0})` },
                  ...(isStaff ? [{ key: 'audit', label: 'Audit Log' }] : [])
                ].map(t => (
                  <button key={t.key} onClick={() => setTab(t.key)}
                    className={`px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-all
                      ${tab === t.key ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                    {t.label}
                  </button>
                ))}
              </div>

              {tab === 'comments' ? (
                <div>
                  {comments.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">No comments yet</div>
                  ) : (
                    <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                      {comments.map(c => (
                        <CommentItem
                          key={c._id}
                          comment={c}
                          canDelete={isAdmin || c.author?._id === user._id}
                          onDelete={deleteComment}
                        />
                      ))}
                    </div>
                  )}

                  {/* Comment input */}
                  <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                    <textarea
                      ref={commentRef}
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Add a comment or update…"
                      rows={3}
                      className="w-full px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 resize-none outline-none"
                    />
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-t border-slate-100">
                      {isStaff && (
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-500 hover:text-slate-700">
                          <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)}
                            className="rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                          <LockClosedIcon className="w-3 h-3" />
                          Internal note only
                        </label>
                      )}
                      <div className="ml-auto">
                        <button
                          onClick={postComment}
                          disabled={!comment.trim() || posting}
                          className="btn btn-primary btn-sm"
                        >
                          {posting ? <Spinner size="sm" /> : <ChatBubbleLeftIcon className="w-3.5 h-3.5" />}
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : tab === 'history' ? (
                <div className="max-h-60 overflow-y-auto pr-1">
                  {(!ticket?.statusHistory || ticket.statusHistory.length === 0) ? (
                    <div className="text-center py-6 text-slate-400 text-xs">No status history</div>
                  ) : (
                    <div className="relative pl-5">
                      <div className="absolute left-1.5 top-2 bottom-2 w-px bg-slate-200" />
                      {[...ticket.statusHistory].reverse().map((h, i) => (
                        <div key={i} className="relative flex items-start gap-3 pb-4 last:pb-0">
                          <div className={`absolute -left-3.5 w-3 h-3 rounded-full border-2 border-white flex-shrink-0 mt-0.5
                            ${h.status === 'Resolved' || h.status === 'Closed' ? 'bg-green-400' :
                              h.status === 'In Progress' ? 'bg-blue-400' :
                              h.status === 'On Hold' ? 'bg-purple-400' : 'bg-amber-400'}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <StatusBadge status={h.status} />
                              {h.changedBy && (
                                <span className="text-xs text-slate-500">
                                  by <span className="font-medium">{h.changedBy.name || 'System'}</span>
                                </span>
                              )}
                            </div>
                            {h.note && <p className="text-xs text-slate-400 mt-1">{h.note}</p>}
                            <p className="text-[10px] text-slate-400 font-mono mt-1">{relativeTime(h.changedAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                  {auditLogs.length === 0
                    ? <div className="text-center py-6 text-slate-400 text-xs">No audit events</div>
                    : auditLogs.map(e => <AuditEvent key={e._id} event={e} />)
                  }
                </div>
              )}
            </div>
          </div>

          {/* ─── Sidebar ─── */}
          <div className="w-60 flex-shrink-0 space-y-3">
            {/* Meta */}
            <div className="card p-4 space-y-3">
              {[
                { label: 'Submitted by', value: <UserChip user={ticket.submittedBy} showRole /> },
                { label: 'Department',   value: <span className="text-xs text-slate-600">{ticket.submittedBy?.department || '—'}</span> },
                { label: 'Location',     value: <span className="text-xs text-slate-600">{ticket.location || '—'}</span> },
                { label: 'Opened',       value: <span className="text-xs text-slate-400 font-mono">{formatDateTime(ticket.createdAt)}</span> },
                ...(ticket.resolvedAt ? [{ label: 'Resolved', value: <span className="text-xs text-green-600 font-mono">{formatDateTime(ticket.resolvedAt)}</span> }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
                  <div className="text-right">{value}</div>
                </div>
              ))}
            </div>

            {/* IT Controls */}
            {isStaff && (
              <>
                <div className="card p-4 space-y-3">
                  <FormField label="Status">
                    <Select
                      value={ticket.status}
                      onChange={v => updateField('status', v)}
                      options={STATUSES}
                      disabled={saving.status}
                    />
                    {saving.status && <Spinner size="sm" className="mt-1" />}
                  </FormField>

                  <FormField label="Assigned To">
                    <Select
                      value={ticket.assignedTo?._id || ticket.assignedTo || ''}
                      onChange={v => updateField('assignedTo', v)}
                      options={[
                        { value: '', label: '— Unassigned' },
                        ...technicians.map(t => ({ value: t._id, label: t.name }))
                      ]}
                      disabled={saving.assignedTo}
                    />
                  </FormField>

                  <FormField label="Priority">
                    <Select
                      value={ticket.priority}
                      onChange={v => updateField('priority', v)}
                      options={PRIORITIES}
                      disabled={saving.priority}
                    />
                  </FormField>
                </div>

                <div className="card p-4 space-y-2">
                  <div className="label">Resolution Notes</div>
                  <textarea
                    value={ticket.resolutionNotes || ''}
                    onChange={e => setTicket(p => ({ ...p, resolutionNotes: e.target.value }))}
                    rows={4}
                    placeholder="How was this resolved?"
                    className="input resize-none text-xs"
                  />
                  <button onClick={saveResolution} className="btn btn-sm btn-secondary w-full justify-center" disabled={saving.resolutionNotes}>
                    {saving.resolutionNotes ? <Spinner size="sm" /> : 'Save Notes'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};
