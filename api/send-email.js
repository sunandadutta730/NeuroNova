// Vercel Serverless Function for LifeLink Email Dispatch
// Environment variables required in Vercel / .env:
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { to, subject, body, type, donorName, bloodGroup, city, requestId, dateRange, instructions } = req.body || {};

    if (!to || !subject) {
      return res.status(400).json({ error: 'Missing required email fields: to and subject' });
    }

    console.log(`📧 [Serverless Email Service] Sending email (${type || 'GENERAL'}) to ${to}: "${subject}"`);

    // In Vercel serverless environment, use SMTP if configured
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT || 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || '"LifeLink Network" <noreply@lifelink.org>';

    if (smtpHost && smtpUser && smtpPass) {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: parseInt(smtpPort) === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      const mailOptions = {
        from: smtpFrom,
        to: to,
        subject: subject,
        html: body || `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #dc2626;">LifeLink Smart Blood Network</h2>
            <p>${subject}</p>
            <hr>
            <p><strong>Donor Name:</strong> ${donorName || 'N/A'}</p>
            <p><strong>Blood Group:</strong> ${bloodGroup || 'N/A'}</p>
            <p><strong>City:</strong> ${city || 'N/A'}</p>
            <p><strong>Request ID:</strong> ${requestId || 'N/A'}</p>
            ${dateRange ? `<p><strong>Appointment Date Range:</strong> ${dateRange}</p>` : ''}
            ${instructions ? `<p><strong>Instructions:</strong> ${instructions}</p>` : ''}
            <br>
            <p>Please log in to your LifeLink Portal to complete verification.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Email dispatched via SMTP successfully');
    } else {
      console.log('⚡ SMTP environment variables not configured. Simulated serverless email dispatch recorded.');
    }

    return res.status(200).json({
      success: true,
      message: 'Email dispatched successfully',
      timestamp: new Date().toISOString(),
      recipient: to
    });

  } catch (err) {
    console.error('❌ Email serverless error:', err);
    return res.status(500).json({ error: 'Failed to send email', details: err.message });
  }
};
