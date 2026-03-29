const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getNotifications, markNotificationsRead } = require('../controllers/otherControllers');

router.get('/',    protect, getNotifications);
router.put('/read', protect, markNotificationsRead);

module.exports = router;
