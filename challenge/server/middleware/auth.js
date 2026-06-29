import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'challenge-dev-secret';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    try {
      req.user = jwt.verify(header.slice(7), JWT_SECRET);
      if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
      next();
    } catch {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}

export const requireAdmin   = requireRole('admin');
export const requireAny     = requireAuth;
