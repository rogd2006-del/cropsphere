import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Notification } from '../models/Notification';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { page = '1', limit = '20', unreadOnly } = req.query as Record<string, string>;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const filter: Record<string, unknown> = { userId: req.user!._id };
    if (unreadOnly === 'true') filter.read = false;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId: req.user!._id, read: false }),
    ]);

    res.json({ success: true, data: notifications, unreadCount, pagination: { page: pageNum, limit: limitNum, total } });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/read', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!._id },
      { read: true },
      { new: true }
    );
    if (!notif) throw new AppError('Notification not found', 404);
    res.json({ success: true, data: notif });
  } catch (err) {
    next(err);
  }
});

router.patch('/read-all', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    await Notification.updateMany({ userId: req.user!._id, read: false }, { read: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
});

export default router;
