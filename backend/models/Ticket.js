const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  filename:     { type: String, required: true },
  originalName: { type: String, required: true },
  mimetype:     { type: String, required: true },
  size:         { type: Number, required: true },
  path:         { type: String, required: true },
  uploadedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedAt:   { type: Date, default: Date.now }
}, { _id: true });

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Hardware', 'Software', 'Network', 'Account/Access', 'Other']
  },
  priority: {
    type: String,
    required: [true, 'Priority is required'],
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'On Hold', 'Resolved', 'Closed'],
    default: 'Open'
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  location: {
    type: String,
    trim: true
  },
  resolutionNotes: {
    type: String,
    trim: true,
    maxlength: [3000, 'Resolution notes cannot exceed 3000 characters']
  },
  resolvedAt: Date,
  closedAt: Date,
  attachments: [attachmentSchema],
  tags: [{ type: String, trim: true }],
  statusHistory: [{
    status:    { type: String, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    note:      String
  }]
}, {
  timestamps: true
});

// Auto-generate ticketId before save
ticketSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Ticket').countDocuments();
    this.ticketId = `TKT-${String(count + 1).padStart(4, '0')}`;
  }
  // Set resolved/closed timestamps
  if (this.isModified('status')) {
    if (this.status === 'Resolved') this.resolvedAt = new Date();
    if (this.status === 'Closed') this.closedAt = new Date();
  }
  next();
});

// Virtual for comment count
ticketSchema.virtual('commentCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'ticket',
  count: true
});

// Indexes
// ticketId index created via unique:true on field definition
ticketSchema.index({ submittedBy: 1 });
ticketSchema.index({ assignedTo: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ priority: 1 });
ticketSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Ticket', ticketSchema);
