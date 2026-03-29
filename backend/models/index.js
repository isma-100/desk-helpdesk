const mongoose = require('mongoose');

// ─── COMMENT MODEL ───────────────────────────────────────────────────────────
const commentSchema = new mongoose.Schema({
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [2000, 'Comment cannot exceed 2000 characters']
  },
  isInternal: {
    type: Boolean,
    default: false  // Internal notes only visible to technicians/admin
  },
  attachments: [{
    filename:     String,
    originalName: String,
    path:         String,
    size:         Number
  }],
  editedAt: Date
}, {
  timestamps: true
});

commentSchema.index({ ticket: 1, createdAt: 1 });

// ─── NOTIFICATION MODEL ───────────────────────────────────────────────────────
const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'ticket_created',
      'ticket_assigned',
      'ticket_updated',
      'ticket_resolved',
      'ticket_closed',
      'comment_added',
      'priority_changed',
      'status_changed'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date
}, {
  timestamps: true
});

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// ─── AUDIT LOG MODEL ──────────────────────────────────────────────────────────
const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'ticket_created',
      'ticket_updated',
      'ticket_assigned',
      'ticket_unassigned',
      'status_changed',
      'priority_changed',
      'comment_added',
      'comment_deleted',
      'file_uploaded',
      'file_deleted',
      'user_created',
      'user_updated',
      'user_deactivated',
      'resolution_added',
      'ticket_closed'
    ]
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket'
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  description: {
    type: String,
    required: true
  },
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after:  mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

auditLogSchema.index({ ticket: 1, createdAt: -1 });
auditLogSchema.index({ performedBy: 1, createdAt: -1 });

const Comment      = mongoose.model('Comment',      commentSchema);
const Notification = mongoose.model('Notification', notificationSchema);
const AuditLog     = mongoose.model('AuditLog',     auditLogSchema);

module.exports = { Comment, Notification, AuditLog };
