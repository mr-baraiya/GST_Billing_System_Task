const { sendContactNotification } = require('../utils/emailService');

// POST /api/contact
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required fields.' });
    }

    // Dispatch email to admin
    await sendContactNotification(name, email, phone, subject, message);

    res.json({
      message: 'Thank you for reaching out! Your inquiry has been sent to our team, and we will get back to you shortly.',
    });
  } catch (err) {
    console.error('Contact form submission error:', err);
    res.status(500).json({ error: 'Failed to send inquiry email. Please try again later.' });
  }
};
