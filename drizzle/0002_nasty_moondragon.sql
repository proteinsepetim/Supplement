CREATE TABLE `goal_ingredients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`goalId` int NOT NULL,
	`ingredientId` int NOT NULL,
	`relevanceScore` int NOT NULL DEFAULT 5,
	CONSTRAINT `goal_ingredients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `page_seo` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pageRoute` varchar(200) NOT NULL,
	`pageTitle` varchar(200),
	`metaTitle` varchar(200),
	`metaDescription` text,
	`ogImage` varchar(500),
	`keywords` varchar(500),
	`noIndex` enum('true','false') NOT NULL DEFAULT 'false',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `page_seo_id` PRIMARY KEY(`id`),
	CONSTRAINT `page_seo_pageRoute_unique` UNIQUE(`pageRoute`)
);
--> statement-breakpoint
CREATE TABLE `product_ingredients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` varchar(50) NOT NULL,
	`ingredientId` int NOT NULL,
	`amountPerServing` varchar(50),
	CONSTRAINT `product_ingredients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(100) NOT NULL,
	`settingValue` text,
	`settingType` enum('text','image','json','boolean','number') NOT NULL DEFAULT 'text',
	`description` varchar(255),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_settings_settingKey_unique` UNIQUE(`settingKey`)
);
--> statement-breakpoint
CREATE TABLE `wizard_goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`icon` varchar(50),
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` enum('true','false') NOT NULL DEFAULT 'true',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wizard_goals_id` PRIMARY KEY(`id`),
	CONSTRAINT `wizard_goals_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `wizard_ingredients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wizard_ingredients_id` PRIMARY KEY(`id`),
	CONSTRAINT `wizard_ingredients_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `wizard_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`goalId` int,
	`gender` varchar(20),
	`ageRange` varchar(20),
	`trainingFrequency` varchar(50),
	`recommendedProducts` text,
	`addedToCart` enum('true','false') NOT NULL DEFAULT 'false',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wizard_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `categories` ADD `metaTitle` varchar(200);--> statement-breakpoint
ALTER TABLE `categories` ADD `metaDescription` text;--> statement-breakpoint
ALTER TABLE `categories` ADD `keywords` varchar(500);--> statement-breakpoint
ALTER TABLE `products` ADD `servingSize` varchar(50);--> statement-breakpoint
ALTER TABLE `products` ADD `servingsPerContainer` int;--> statement-breakpoint
ALTER TABLE `products` ADD `usageInstructions` text;--> statement-breakpoint
ALTER TABLE `products` ADD `metaTitle` varchar(200);--> statement-breakpoint
ALTER TABLE `products` ADD `metaDescription` text;--> statement-breakpoint
ALTER TABLE `products` ADD `keywords` varchar(500);