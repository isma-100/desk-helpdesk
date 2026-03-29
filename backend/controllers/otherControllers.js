const { Comment, Notification, AuditLog } = require('../models/index');
const Ticket = require('../models/Ticket');
const User = require('../models/User');

// ═══════════════════════════════════════════════════════
// COMMENT CONTROLLER
// ═══════════════════════════════════════════════════════

const getComments = async (req, res) => {
  const { ticketId } = req.params;
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

  // Employees cannot see internal notes
  const query = { ticket: ticketId };
  if (req.user.role === 'employee') query.isInternal = false;

  const comments = await Comment.find(query)
    .populate('author', 'name email avatar role')
    .sort('createdAt');

  res.json({ success: true, data: comments });
};

const addComment = async (req, res) => {
  const { ticketId } = req.params;
  const { content, isInternal } = req.body;

  if (!content?.trim()) {
    return res.status(400).json({ success: false, message: 'Comment content is required' });
  }

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

  // Employees cannot post internal notes
  const internal = (req.user.role !== 'employee') && !!isInternal;

  const comment = await Comment.create({
    ticket: ticketId,
    author: req.user._id,
    content: content.trim(),
    isInternal: internal
  });

  await comment.populate('author', 'name email avatar role');

  // Notify relevant parties (skip internal notes for submitter)
  if (!internal) {
    const submitterStr = ticket.submittedBy.toString();
    if (submitterStr !== req.user._id.toString()) {
      await Notification.create({
        recipient: ticket.submittedBy,
        type: 'comment_added',
        title: 'New Comment on Your Ticket',
        message: `${req.user.name} commented on ticket ${ticket.ticketId}`,
        ticket: ticket._id
      });
    }
  }

  await AuditLog.create({
    action: 'comment_added',
    performedBy: req.user._id,
    ticket: ticket._id,
    description: `${internal ? 'Internal note' : 'Comment'} added to ticket ${ticket.ticketId}`,
    ipAddress: req.ip
  });

  res.status(201).json({ success: true, data: comment });
};

const deleteComment = async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

  const isOwner = comment.author.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  await comment.deleteOne();
  res.json({ success: true, message: 'Comment deleted' });
};

// ═══════════════════════════════════════════════════════
// USER CONTROLLER (Admin operations)
// ═══════════════════════════════════════════════════════

const getUsers = async (req, res) => {
  const { role, isActive, search, page = 1, limit = 50 } = req.query;
  const query = {};
  if (role)     query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search)   query.$or = [
    { name:  { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } }
  ];

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [users, total] = await Promise.all([
    User.find(query).sort('name').skip(skip).limit(parseInt(limit)),
    User.countDocuments(query)
  ]);

  res.json({ success: true, data: users, pagination: { total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) } });
};

const createUser = async (req, res) => {
  const { name, email, password, role, department, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  }
  const user = await User.create({ name, email, password, role: role || 'employee', department, phone });

  await AuditLog.create({
    action: 'user_created', performedBy: req.user._id, targetUser: user._id,
    description: `User ${user.email} created with role ${user.role}`, ipAddress: req.ip
  });

  res.status(201).json({ success: true, data: user });
};

const updateUser = async (req, res) => {
  const { name, email, role, department, phone, isActive } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, email, role, department, phone, isActive },
    { new: true, runValidators: true }
  );
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  await AuditLog.create({
    action: 'user_updated', performedBy: req.user._id, targetUser: user._id,
    description: `User ${user.email} updated`, ipAddress: req.ip
  });

  res.json({ success: true, data: user });
};

const toggleUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({ success: false, message: 'Cannot deactivate your own account' });
  }
  user.isActive = !user.isActive;
  await user.save();

  await AuditLog.create({
    action: user.isActive ? 'user_updated' : 'user_deactivated',
    performedBy: req.user._id, targetUser: user._id,
    description: `User ${user.email} ${user.isActive ? 'activated' : 'deactivated'}`, ipAddress: req.ip
  });

  res.json({ success: true, data: user, message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
};

const getTechnicians = async (req, res) => {
  const technicians = await User.find({ role: { $in: ['technician', 'admin'] }, isActive: true }, 'name email avatar role department');
  res.json({ success: true, data: technicians });
};

// ═══════════════════════════════════════════════════════
// NOTIFICATION CONTROLLER
// ═══════════════════════════════════════════════════════

const getNotifications = async (req, res) => {
  const { unreadOnly } = req.query;
  const query = { recipient: req.user._id };
  if (unreadOnly === 'true') query.isRead = false;

  const [notifications, unreadCount] = await Promise.all([
    Notification.find(query).sort('-createdAt').limit(50).populate('ticket', 'ticketId title'),
    Notification.countDocuments({ recipient: req.user._id, isRead: false })
  ]);

  res.json({ success: true, data: notifications, unreadCount });
};

const markNotificationsRead = async (req, res) => {
  const { ids } = req.body; // array of IDs, or empty to mark all
  const query = { recipient: req.user._id };
  if (ids && ids.length) query._id = { $in: ids };

  await Notification.updateMany(query, { isRead: true, readAt: new Date() });
  res.json({ success: true, message: 'Notifications marked as read' });
};

// ═══════════════════════════════════════════════════════
// AUDIT LOG CONTROLLER
// ═══════════════════════════════════════════════════════

const getAuditLogs = async (req, res) => {
  const { ticketId, userId, action, page = 1, limit = 50 } = req.query;
  const query = {};
  if (ticketId) query.ticket = ticketId;
  if (userId)   query.performedBy = userId;
  if (action)   query.action = action;
  // Technicians without a ticketId filter only see their own actions
  if (req.user.role === 'technician' && !ticketId) {
    query.performedBy = req.user._id;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .populate('performedBy', 'name email role')
      .populate('ticket', 'ticketId title'),
    AuditLog.countDocuments(query)
  ]);

  res.json({ success: true, data: logs, pagination: { total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) } });
};

module.exports = {
  // Comments
  getComments, addComment, deleteComment,
  // Users
  getUsers, createUser, updateUser, toggleUserStatus, getTechnicians,
  // Notifications
  getNotifications, markNotificationsRead,
  // Audit
  getAuditLogs
};
