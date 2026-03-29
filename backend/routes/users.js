const express = require('express');
const router = express.Router();
const { protect, isAdmin, isTechOrAdmin } = require('../middleware/auth');
const { getUsers, createUser, updateUser, toggleUserStatus, getTechnicians } = require('../controllers/otherControllers');

router.get('/technicians', protect, isTechOrAdmin, getTechnicians);
router.get('/',            protect, isAdmin, getUsers);
router.post('/',           protect, isAdmin, createUser);
router.put('/:id',         protect, isAdmin, updateUser);
router.patch('/:id/toggle', protect, isAdmin, toggleUserStatus);

module.exports = router;
