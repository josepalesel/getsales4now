CREATE TABLE `agent_actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`agentType` enum('central','crm','content','funnel','support','reports') NOT NULL,
	`action` varchar(200) NOT NULL,
	`input` json,
	`output` text,
	`status` enum('pending_approval','approved','rejected','executed','failed') DEFAULT 'pending_approval',
	`requiresApproval` boolean DEFAULT false,
	`approvedBy` int,
	`approvedAt` timestamp,
	`executedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(200) NOT NULL,
	`entity` varchar(64),
	`entityId` int,
	`details` json,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`objective` enum('leads','sales','booking','retention','followup','reactivation') DEFAULT 'leads',
	`channel` enum('email','whatsapp','sms','multi') DEFAULT 'email',
	`language` varchar(10) DEFAULT 'en',
	`status` enum('draft','pending_approval','active','paused','completed','cancelled') DEFAULT 'draft',
	`targetNiche` varchar(64),
	`sequence` json DEFAULT ('[]'),
	`stats` json DEFAULT ('{"sent":0,"opened":0,"clicked":0,"converted":0}'),
	`scheduledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`industry` varchar(100),
	`website` varchar(300),
	`phone` varchar(30),
	`email` varchar(320),
	`country` varchar(4),
	`city` varchar(100),
	`size` enum('1-10','11-50','51-200','201-500','500+') DEFAULT '1-10',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100),
	`email` varchar(320),
	`phone` varchar(30),
	`whatsapp` varchar(30),
	`company` varchar(200),
	`jobTitle` varchar(100),
	`country` varchar(4),
	`language` varchar(10) DEFAULT 'en',
	`tags` json DEFAULT ('[]'),
	`leadScore` int DEFAULT 0,
	`status` enum('new','contacted','qualified','converted','lost','inactive') DEFAULT 'new',
	`source` varchar(64),
	`notes` text,
	`lastContactedAt` timestamp,
	`nextActionAt` timestamp,
	`nextAction` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contactId` int,
	`channel` enum('whatsapp','email','sms','webchat','voice') NOT NULL,
	`status` enum('open','pending','resolved','bot') DEFAULT 'open',
	`assignedTo` int,
	`language` varchar(10) DEFAULT 'en',
	`detectedLanguage` varchar(10),
	`intentLabel` varchar(100),
	`summary` text,
	`lastMessageAt` timestamp DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `funnels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`objective` varchar(64),
	`niche` varchar(64),
	`language` varchar(10) DEFAULT 'en',
	`status` enum('draft','active','paused','archived') DEFAULT 'draft',
	`steps` json DEFAULT ('[]'),
	`stats` json DEFAULT ('{"visitors":0,"leads":0,"conversions":0}'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `funnels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`provider` enum('ghl','n8n','whatsapp','email','meta','linkedin','telephony','webhook') NOT NULL,
	`name` varchar(100) NOT NULL,
	`status` enum('connected','disconnected','error','pending') DEFAULT 'pending',
	`config` json DEFAULT ('{}'),
	`lastCheckedAt` timestamp,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','agent','bot','system') NOT NULL,
	`content` text NOT NULL,
	`mediaUrl` text,
	`transcription` text,
	`suggestedReply` text,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `opportunities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contactId` int,
	`companyId` int,
	`pipelineId` int,
	`title` varchar(200) NOT NULL,
	`value` decimal(12,2),
	`currency` varchar(8) DEFAULT 'USD',
	`stage` varchar(64) DEFAULT 'new',
	`probability` int DEFAULT 0,
	`expectedCloseDate` timestamp,
	`status` enum('open','won','lost') DEFAULT 'open',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `opportunities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pipelines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`stages` json DEFAULT ('[]'),
	`isDefault` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pipelines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `social_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`contentVariants` json DEFAULT ('[]'),
	`channels` json DEFAULT ('[]'),
	`mediaUrls` json DEFAULT ('[]'),
	`hashtags` json DEFAULT ('[]'),
	`postType` enum('organic','ad','story','reel') DEFAULT 'organic',
	`audience` enum('b2b','b2c','both') DEFAULT 'both',
	`language` varchar(10) DEFAULT 'en',
	`status` enum('draft','scheduled','published','failed') DEFAULT 'draft',
	`scheduledAt` timestamp,
	`publishedAt` timestamp,
	`stats` json DEFAULT ('{"likes":0,"comments":0,"shares":0,"reach":0,"clicks":0}'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `social_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contactId` int,
	`opportunityId` int,
	`title` varchar(200) NOT NULL,
	`description` text,
	`dueAt` timestamp,
	`priority` enum('low','medium','high') DEFAULT 'medium',
	`status` enum('pending','in_progress','done','cancelled') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`type` enum('campaign','social_post','funnel','email','whatsapp','sms','bot') NOT NULL,
	`name` varchar(200) NOT NULL,
	`language` varchar(10) DEFAULT 'en',
	`niche` varchar(64),
	`objective` varchar(64),
	`content` text NOT NULL,
	`metadata` json DEFAULT ('{}'),
	`isSystem` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `uiLanguage` varchar(10) DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `operationalLanguage` varchar(10) DEFAULT 'en';--> statement-breakpoint
ALTER TABLE `users` ADD `timezone` varchar(64) DEFAULT 'America/New_York';--> statement-breakpoint
ALTER TABLE `users` ADD `country` varchar(4);--> statement-breakpoint
ALTER TABLE `users` ADD `currency` varchar(8) DEFAULT 'USD';--> statement-breakpoint
ALTER TABLE `users` ADD `onboardingCompleted` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `onboardingStep` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `businessType` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `businessName` text;--> statement-breakpoint
ALTER TABLE `users` ADD `primaryObjective` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `brandVoice` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `targetAudience` text;