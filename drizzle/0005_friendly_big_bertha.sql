ALTER TABLE `subscriptions` MODIFY COLUMN `plan` enum('free','starter','basic','business','corp') NOT NULL DEFAULT 'free';--> statement-breakpoint
ALTER TABLE `contacts` ADD `ghlContactId` varchar(128);--> statement-breakpoint
ALTER TABLE `contacts` ADD `ghlLocationId` varchar(128);--> statement-breakpoint
ALTER TABLE `contacts` ADD `ghlSyncedAt` timestamp;--> statement-breakpoint
ALTER TABLE `conversations` ADD `ghlConversationId` varchar(128);--> statement-breakpoint
ALTER TABLE `conversations` ADD `ghlLocationId` varchar(128);--> statement-breakpoint
ALTER TABLE `conversations` ADD `ghlSyncedAt` timestamp;--> statement-breakpoint
ALTER TABLE `opportunities` ADD `ghlOpportunityId` varchar(128);--> statement-breakpoint
ALTER TABLE `opportunities` ADD `ghlLocationId` varchar(128);--> statement-breakpoint
ALTER TABLE `opportunities` ADD `ghlSyncedAt` timestamp;