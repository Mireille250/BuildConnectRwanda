import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export type NotificationType =
  | 'NEW_APPLICATION'
  | 'APPLICATION_ACCEPTED'
  | 'APPLICATION_REJECTED'
  | 'NEW_MESSAGE'
  | 'NEW_REVIEW'
  | 'JOB_POSTED'
  | 'VERIFICATION_APPROVED'
  | 'VERIFICATION_REJECTED';

@Injectable()
export class NotificationsService {
  constructor(private readonly db: DatabaseService) {}

  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string,
  ) {
    return this.db.queryOne(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, type, title, message, link ?? null],
    );
  }

  async getUserNotifications(userId: string, limit = 20) {
    return this.db.queryMany(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit],
    );
  }

  async getUnreadCount(userId: string) {
    const result = await this.db.queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM notifications
       WHERE user_id = $1 AND is_read = FALSE`,
      [userId],
    );
    return parseInt(result?.count ?? '0', 10);
  }

  async markAsRead(userId: string, notificationId: string) {
    await this.db.query(
      `UPDATE notifications SET is_read = TRUE
       WHERE id = $1 AND user_id = $2`,
      [notificationId, userId],
    );
  }

  async markAllAsRead(userId: string) {
    await this.db.query(
      `UPDATE notifications SET is_read = TRUE
       WHERE user_id = $1 AND is_read = FALSE`,
      [userId],
    );
  }

  async deleteNotification(userId: string, notificationId: string) {
    await this.db.query(
      `DELETE FROM notifications WHERE id = $1 AND user_id = $2`,
      [notificationId, userId],
    );
  }
}