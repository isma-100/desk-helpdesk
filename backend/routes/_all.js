// ─────────────────────────────────────────────────────
// routes/comments.js
// ─────────────────────────────────────────────────────
const express = require('express');
const commentRouter = express.Router({ mergeParams: true });
const { protect } = require('../middleware/auth');
const { getComments, addComment, deleteComment } = require('../controllers/otherControllers');

commentRouter.get('/',     protect, getComments);
commentRouter.post('/',    protect, addComment);
commentRouter.delete('/:id', protect, deleteComment);

// ─────────────────────────────────────────────────────
// routes/users.js
// ─────────────────────────────────────────────────────
const userRouter = express.Router();
const { isAdmin, protect: p2, isTechOrAdmin } = require('../middleware/auth');
const { getUsers, createUser, updateUser, toggleUserStatus, getTechnicians } = require('../controllers/otherControllers');

userRouter.get('/technicians', p2, isTechOrAdmin, getTechnicians);
userRouter.get('/',      p2, isAdmin, getUsers);
userRouter.post('/',     p2, isAdmin, createUser);
userRouter.put('/:id',   p2, isAdmin, updateUser);
userRouter.patch('/:id/toggle', p2, isAdmin, toggleUserStatus);

// ─────────────────────────────────────────────────────
// routes/notifications.js
// ─────────────────────────────────────────────────────
const notifRouter = express.Router();
const { protect: p3 } = require('../middleware/auth');
const { getNotifications, markNotificationsRead } = require('../controllers/otherControllers');

notifRouter.get('/',       p3, getNotifications);
notifRouter.put('/read',   p3, markNotificationsRead);

// ─────────────────────────────────────────────────────
// routes/audit.js
// ─────────────────────────────────────────────────────
const auditRouter = express.Router();
const { isAdmin: isAdm, protect: p4 } = require('../middleware/auth');
const { getAuditLogs } = require('../controllers/otherControllers');

auditRouter.get('/', p4, isAdm, getAuditLogs);

// ─────────────────────────────────────────────────────
// routes/uploads.js
// ─────────────────────────────────────────────────────
const uploadRouter = express.Router();
const { protect: p5 } = require('../middleware/auth');
const upload = require('../middleware/upload');

uploadRouter.post('/', p5, upload.array('files', 5), (req, res) => {
  const files = (req.files || []).map(f => ({
    filename:     f.filename,
    originalName: f.originalname,
    mimetype:     f.mimetype,
    size:         f.size,
    url:          `/uploads/${f.filename}`
  }));
  res.json({ success: true, data: files });
});

module.exports = {
  commentRoutes:      commentRouter,
  userRoutes:         userRouter,
  notificationRoutes: notifRouter,
  auditRoutes:        auditRouter,
  uploadRoutes:       uploadRouter
};
