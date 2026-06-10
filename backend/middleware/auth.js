/**
 * Simple admin authentication middleware.
 * Checks for the `x-admin-password` header against the ADMIN_PASSWORD env var.
 */
const adminAuth = (req, res, next) => {
  const password = req.headers['x-admin-password'];

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized — invalid admin password'
    });
  }

  next();
};

module.exports = adminAuth;
