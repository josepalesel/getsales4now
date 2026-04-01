-- Fix: Update subscriptions.plan enum from ('free','pro','business','agency')
-- to ('free','starter','business','corp') to match the current application logic.
-- The old enum had 'pro' and 'agency' which no longer exist in the app.
-- The new enum adds 'starter' and 'corp' which are the current plans.
ALTER TABLE `subscriptions`
  MODIFY COLUMN `plan` enum('free','starter','business','corp') NOT NULL DEFAULT 'free';
