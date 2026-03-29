const express = require('express');
const router = express.Router();
const { protect, isTechOrAdmin } = require('../middleware/auth');
const { getAuditLogs } = require('../controllers/otherControllers');

// Technicians can see audit logs for tickets they work on
// Full system audit (no ticketId filter) is admin-only - handled in controller
router.get('/', protect, isTechOrAdmin, getAuditLogs);

module.exports = router;
