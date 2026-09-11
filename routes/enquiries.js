const express = require('express');
const Enquiry = require('../models/Enquiry');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email and message are required' });
    }
    const enquiry = await Enquiry.create({ name, email, message });
    res.status(201).json({ message: 'Enquiry submitted successfully', enquiry });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Could not submit enquiry' });
  }
});

module.exports = router;