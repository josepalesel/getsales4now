CREATE TABLE `ghl_provisioning_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subscriptionId` int,
	`action` varchar(64) NOT NULL,
	`status` enum('pending','success','failed') NOT NULL DEFAULT 'pending',
	`ghlLocationId` varchar(128),
	`requestPayload` json,
	`responsePayload` json,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ghl_provisioning_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`plan` enum('free','pro','business','agency') NOT NULL DEFAULT 'free',
	`status` enum('active','trialing','past_due','canceled','incomplete') NOT NULL DEFAULT 'active',
	`stripeCustomerId` varchar(128),
	`stripeSubscriptionId` varchar(128),
	`stripePriceId` varchar(128),
	`ghlLocationId` varchar(128),
	`ghlLocationName` varchar(200),
	`ghlProvisionedAt` timestamp,
	`ghlStatus` enum('pending','provisioning','active','failed','suspended') NOT NULL DEFAULT 'pending',
	`contactsLimit` int DEFAULT 100,
	`usersLimit` int DEFAULT 1,
	`trialEndsAt` timestamp,
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`canceledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_userId_unique` UNIQUE(`userId`)
);
