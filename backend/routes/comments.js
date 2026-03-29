const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getComments, addComment, deleteComment } = require('../controllers/otherControllers');

// GET  /api/comments/:ticketId  - get all comments for a ticket
// POST /api/comments/:ticketId  - add comment to a ticket
router.get('/:ticketId',    protect, getComments);
router.post('/:ticketId',   protect, addComment);
router.delete('/:id',       protect, deleteComment);

module.exports = router;
