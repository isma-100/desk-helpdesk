const Ticket = require('../models/Ticket');
const { Comment, Notification, AuditLog } = require('../models/index');
const User = require('../models/User');

// ─── Helper: create notification ──────────────────────────────────────────────
const notify = async (recipientId, type, title, message, ticketId) => {
  if (!recipientId) return;
  try {
    await Notification.create({ recipient: recipientId, type, title, message, ticket: ticketId });
  } catch (e) { /* don't fail on notification error */ }
};

// ─── Helper: create audit log ─────────────────────────────────────────────────
const audit = async (action, userId, description, ticketId, changes, req) => {
  try {
    await AuditLog.create({
      action, performedBy: userId, ticket: ticketId,
      description, changes,
      ipAddress: req?.ip,
      userAgent: req?.headers?.['user-agent']
    });
  } catch (e) { /* don't fail on audit error */ }
};

// @desc    Get all tickets (with filters, search, pagination)
// @route   GET /api/tickets
// @access  Private
const getTickets = async (req, res) => {
  const { status, priority, category, assignedTo, submittedBy,
          search, page = 1, limit = 20, sort = '-createdAt' } = req.query;

  const query = {};

  // Role-based data scope
  if (req.user.role === 'employee') {
    query.submittedBy = req.user._id;
  } else if (assignedTo === 'me') {
    // technicians AND admins can filter 'My Queue'
    query.assignedTo = req.user._id;
  }

  if (status && status !== 'all')     query.status = status;
  if (priority && priority !== 'all') query.priority = priority;
  if (category && category !== 'all') query.category = category;
  if (submittedBy && req.user.role !== 'employee') query.submittedBy = submittedBy;
  if (assignedTo && assignedTo !== 'me' && req.user.role !== 'employee') query.assignedTo = assignedTo;

  if (search) {
    query.$or = [
      { ticketId: { $regex: search, $options: 'i' } },
      { title:    { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [tickets, total] = await Promise.all([
    Ticket.find(query)
      .populate('submittedBy', 'name email avatar department')
      .populate('assignedTo',  'name email avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Ticket.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: tickets,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    }
  });
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
const getTicket = async (req, res) => {
  const ticket = await Ticket.findOne({
    $or: [{ _id: req.params.id }, { ticketId: req.params.id }]
  })
    .populate('submittedBy', 'name email avatar department')
    .populate('assignedTo',  'name email avatar')
    .populate('statusHistory.changedBy', 'name');

  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

  // Employees can only see their own tickets
  if (req.user.role === 'employee' && ticket.submittedBy._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  res.json({ success: true, data: ticket });
};

// @desc    Create ticket
// @route   POST /api/tickets
// @access  Private
const createTicket = async (req, res) => {
  const { title, description, category, priority, location } = req.body;

  if (!title?.trim() || !description?.trim() || !category) {
    return res.status(400).json({ success: false, message: 'Title, description, and category are required' });
  }

  const attachments = (req.files || []).map(f => ({
    filename:     f.filename,
    originalName: f.originalname,
    mimetype:     f.mimetype,
    size:         f.size,
    path:         `/uploads/${f.filename}`,
    uploadedBy:   req.user._id
  }));

  const ticket = await Ticket.create({
    title: title.trim(),
    description: description.trim(),
    category,
    priority: priority || 'Medium',
    location,
    submittedBy: req.user._id,
    attachments,
    statusHistory: [{ status: 'Open', changedBy: req.user._id, note: 'Ticket created' }]
  });

  await ticket.populate('submittedBy', 'name email avatar department');

  // Notify all admins and technicians
  const staff = await User.find({ role: { $in: ['admin', 'technician'] }, isActive: true }, '_id');
  await Promise.all(staff.map(s =>
    notify(s._id, 'ticket_created', 'New Ticket Submitted',
      `${req.user.name} submitted: "${ticket.title}" [${ticket.ticketId}]`, ticket._id)
  ));

  await audit('ticket_created', req.user._id, `Ticket ${ticket.ticketId} created: "${ticket.title}"`, ticket._id, null, req);

  res.status(201).json({ success: true, data: ticket });
};

// @desc    Update ticket
// @route   PUT /api/tickets/:id
// @access  Private (Technician/Admin)
const updateTicket = async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

  const { status, priority, assignedTo, resolutionNotes, title, description, category, location } = req.body;
  const changes = { before: {}, after: {} };

  // Employees can only update title/description/location on Open tickets
  if (req.user.role === 'employee') {
    if (ticket.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (!['Open'].includes(ticket.status)) {
      return res.status(400).json({ success: false, message: 'Cannot edit a ticket that is in progress or resolved' });
    }
    if (title) ticket.title = title.trim();
    if (description) ticket.description = description.trim();
    if (location !== undefined) ticket.location = location;
    await ticket.save();
    return res.json({ success: true, data: ticket });
  }

  // Technician / Admin updates
  if (status && status !== ticket.status) {
    changes.before.status = ticket.status;
    changes.after.status  = status;
    ticket.statusHistory.push({ status, changedBy: req.user._id });
    ticket.status = status;

    // Notify submitter
    await notify(ticket.submittedBy, 'status_changed', 'Ticket Status Updated',
      `Your ticket ${ticket.ticketId} status changed to "${status}"`, ticket._id);
  }

  if (priority && priority !== ticket.priority) {
    changes.before.priority = ticket.priority;
    changes.after.priority  = priority;
    ticket.priority = priority;
    await notify(ticket.submittedBy, 'priority_changed', 'Ticket Priority Updated',
      `Your ticket ${ticket.ticketId} priority changed to "${priority}"`, ticket._id);
  }

  if (assignedTo !== undefined) {
    const prevAssignee = ticket.assignedTo?.toString();
    const newAssignee  = assignedTo || null;
    if (prevAssignee !== (newAssignee || '')) {
      changes.before.assignedTo = prevAssignee;
      changes.after.assignedTo  = newAssignee;
      ticket.assignedTo = newAssignee || null;
      if (newAssignee) {
        await notify(newAssignee, 'ticket_assigned', 'Ticket Assigned to You',
          `Ticket ${ticket.ticketId} has been assigned to you: "${ticket.title}"`, ticket._id);
      }
    }
  }

  if (resolutionNotes !== undefined) ticket.resolutionNotes = resolutionNotes;
  if (title) ticket.title = title.trim();
  if (description) ticket.description = description.trim();
  if (category) ticket.category = category;
  if (location !== undefined) ticket.location = location;

  await ticket.save();
  await ticket.populate('submittedBy', 'name email avatar department');
  await ticket.populate('assignedTo',  'name email avatar');

  if (Object.keys(changes.after).length > 0) {
    const desc = Object.entries(changes.after).map(([k, v]) => `${k}: ${changes.before[k]} → ${v}`).join(', ');
    await audit('ticket_updated', req.user._id, `Updated ticket ${ticket.ticketId}: ${desc}`, ticket._id, changes, req);
  }

  res.json({ success: true, data: ticket });
};

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Admin only
const deleteTicket = async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

  await Comment.deleteMany({ ticket: ticket._id });
  await Notification.deleteMany({ ticket: ticket._id });
  await AuditLog.deleteMany({ ticket: ticket._id });
  await ticket.deleteOne();

  res.json({ success: true, message: `Ticket ${ticket.ticketId} deleted` });
};

// @desc    Get ticket stats
// @route   GET /api/tickets/stats
// @access  Private (Technician/Admin)
const getStats = async (req, res) => {
  const matchStage = req.user.role === 'technician' ? { assignedTo: req.user._id } : {};

  const [byStatus, byPriority, byCategory, recent] = await Promise.all([
    Ticket.aggregate([{ $match: matchStage }, { $group: { _id: '$status',   count: { $sum: 1 } } }]),
    Ticket.aggregate([{ $match: matchStage }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
    Ticket.aggregate([{ $match: matchStage }, { $group: { _id: '$category', count: { $sum: 1 } } }]),
    Ticket.find(matchStage).sort('-createdAt').limit(5).populate('submittedBy', 'name').lean()
  ]);

  const total    = byStatus.reduce((s, i) => s + i.count, 0);
  const resolved = (byStatus.find(i => i._id === 'Resolved')?.count || 0) + (byStatus.find(i => i._id === 'Closed')?.count || 0);

  res.json({
    success: true,
    data: {
      total,
      resolved,
      resolutionRate: total ? Math.round(resolved / total * 100) : 0,
      byStatus:   Object.fromEntries(byStatus.map(i   => [i._id, i.count])),
      byPriority: Object.fromEntries(byPriority.map(i => [i._id, i.count])),
      byCategory: Object.fromEntries(byCategory.map(i => [i._id, i.count])),
      recentTickets: recent
    }
  });
};

module.exports = { getTickets, getTicket, createTicket, updateTicket, deleteTicket, getStats };
