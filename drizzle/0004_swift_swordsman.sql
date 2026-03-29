ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerified` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerifyToken` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `resetPasswordToken` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `resetPasswordExpires` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `trialStartedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `trialEndsAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `selectedPlan` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `ghlOnboardingCompleted` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `ghlOnboardingStep` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `companyPhone` varchar(30);--> statement-breakpoint
ALTER TABLE `users` ADD `companyWebsite` varchar(255);