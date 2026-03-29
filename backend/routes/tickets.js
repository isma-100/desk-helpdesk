const express = require('express');
const router = express.Router();
const { protect, isTechOrAdmin, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getTickets, getTicket, createTicket, updateTicket, deleteTicket, getStats
} = require('../controllers/ticketController');

router.get('/stats', protect, isTechOrAdmin, getStats);
router.get('/',     protect, getTickets);
router.post('/',    protect, upload.array('attachments', 5), createTicket);
router.get('/:id',  protect, getTicket);
router.put('/:id',  protect, updateTicket);
router.delete('/:id', protect, isAdmin, deleteTicket);

module.exports = router;
