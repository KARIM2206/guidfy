// middleware/internalTokenMiddleware.js
// Protects internal endpoints (e.g. /api/n8n/save-jobs) called by n8n / automation services.
// Validates the `x-internal-token` header against process.env.INTERNAL_API_TOKEN
'use strict';

const validateInternalToken = (req, res, next) => {
  const token = req.headers['x-internal-token'];

  if (!process.env.INTERNAL_API_TOKEN) {
    console.error('❌ INTERNAL_API_TOKEN is not set in environment variables');
    return res.status(500).json({
      success: false,
      error: 'Server misconfiguration: internal token not configured',
    });
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Missing x-internal-token header',
    });
  }

  // Constant-time comparison to prevent timing attacks
  const expected = Buffer.from(process.env.INTERNAL_API_TOKEN);
  const provided  = Buffer.from(token);

  if (
    expected.length !== provided.length ||
    !require('crypto').timingSafeEqual(expected, provided)
  ) {
    return res.status(403).json({
      success: false,
      error: 'Invalid internal token',
    });
  }

  next();
};

module.exports = { validateInternalToken };