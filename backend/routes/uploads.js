const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, upload.array('files', 5), (req, res) => {
  const files = (req.files || []).map(f => ({
    filename:     f.filename,
    originalName: f.originalname,
    mimetype:     f.mimetype,
    size:         f.size,
    url:          `/uploads/${f.filename}`
  }));
  res.json({ success: true, data: files });
});

module.exports = router;
