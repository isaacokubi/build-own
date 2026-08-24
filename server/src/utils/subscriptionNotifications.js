import Tenant from '../models/Tenant.js';
import User from '../models/User.js';
import { Notification } from '../models/NotificationAudit.js';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_MS = 26 * 60 * 60 * 1000;

export async function sendSubscriptionExpiryNotifications(now = new Date()) {
  const upper = new Date(now.getTime() + WINDOW_MS);
  const tenants = await Tenant.find({
    status: 'active',
    'subscription.expiresAt': { $gt: now, $lte: upper },
    'subscription.status': { $nin: ['expired', 'cancelled', 'canceled', 'suspended', 'past_due'] },
  }).lean();

  let notificationsCreated = 0;

  for (const tenant of tenants) {
    const expiresAt = new Date(tenant.subscription.expiresAt);
    const remaining = expiresAt.getTime() - now.getTime();
    if (remaining > WINDOW_MS || remaining < ONE_DAY_MS - 2 * 60 * 60 * 1000) continue;

    const users = await User.find({ tenantId: tenant._id, status: 'active' }).select('_id').lean();
    const expiryKey = expiresAt.toISOString().slice(0, 10);

    for (const user of users) {
      const dedupeKey = `subscription-expiry:${tenant._id}:${user._id}:${expiryKey}`;
      const result = await Notification.updateOne(
        { dedupeKey },
        {
          $setOnInsert: {
            tenantId: tenant._id,
            recipient: user._id,
            title: 'Your Build-Own subscription expires tomorrow',
            message: `Your ${tenant.subscription?.plan || 'current'} trial or subscription for ${tenant.name} expires tomorrow. Please make a subscription before the expiry date to keep your workspace and dashboard functionality available.`,
            type: 'SYSTEM',
            link: '/admin',
            dedupeKey,
          },
        },
        { upsert: true },
      );
      if (result.upsertedCount) notificationsCreated += 1;
    }
  }

  return { tenantsChecked: tenants.length, notificationsCreated };
}

export function startSubscriptionExpiryNotificationScheduler() {
  const run = () => sendSubscriptionExpiryNotifications().catch((error) => {
    console.error('Subscription expiry notification job failed:', error);
  });

  run();
  const interval = setInterval(run, 60 * 60 * 1000);
  interval.unref?.();
  return interval;
}
