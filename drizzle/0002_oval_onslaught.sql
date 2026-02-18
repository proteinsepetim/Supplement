CREATE TABLE `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`ruleType` enum('min_cart_gift','buy_x_get_y','cart_discount_percent','cart_discount_amount','free_shipping') NOT NULL,
	`minCartAmount` int,
	`requiredCategoryId` int,
	`requiredProductCount` int,
	`discountPercent` int,
	`discountAmount` int,
	`giftProductName` varchar(200),
	`giftProductImage` varchar(500),
	`isActive` boolean NOT NULL DEFAULT true,
	`priority` int NOT NULL DEFAULT 0,
	`startsAt` timestamp,
	`endsAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_options` (
	`id` int AUTO_INCREMENT NOT NULL,
	`questionId` int NOT NULL,
	`optionText` varchar(200) NOT NULL,
	`optionIcon` varchar(50),
	`categoryIds` json,
	`tagFilters` json,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quiz_options_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`questionText` varchar(500) NOT NULL,
	`questionType` enum('single','multiple') NOT NULL DEFAULT 'single',
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quiz_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `site_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` enum('page_view','add_to_cart','checkout_start','order_complete') NOT NULL,
	`sessionId` varchar(100),
	`userId` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `site_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `products` ADD `servingsCount` int;--> statement-breakpoint
ALTER TABLE `products` ADD `ratingScore` int DEFAULT 0;