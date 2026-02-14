CREATE TABLE `categories` (
	`id` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`icon` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `newsletter` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`isActive` enum('true','false') NOT NULL DEFAULT 'true',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `newsletter_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletter_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` varchar(50) NOT NULL,
	`variantId` varchar(50) NOT NULL,
	`productName` varchar(200) NOT NULL,
	`variantName` varchar(100) NOT NULL,
	`quantity` int NOT NULL,
	`unitPrice` int NOT NULL,
	`lineTotal` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(50) NOT NULL,
	`userId` int,
	`status` enum('pending','confirmed','preparing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`customerName` varchar(200) NOT NULL,
	`customerEmail` varchar(320) NOT NULL,
	`customerPhone` varchar(20) NOT NULL,
	`address` text NOT NULL,
	`city` varchar(100) NOT NULL,
	`district` varchar(100),
	`zipCode` varchar(10),
	`subtotal` int NOT NULL,
	`shippingCost` int NOT NULL,
	`codFee` int NOT NULL DEFAULT 0,
	`total` int NOT NULL,
	`shippingMethod` varchar(50) NOT NULL,
	`paymentMethod` varchar(50) NOT NULL,
	`trackingNumber` varchar(100),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `product_variants` (
	`id` varchar(50) NOT NULL,
	`productId` varchar(50) NOT NULL,
	`sku` varchar(100) NOT NULL,
	`name` varchar(100) NOT NULL,
	`size` varchar(50),
	`flavor` varchar(50),
	`price` int NOT NULL,
	`stock` int NOT NULL DEFAULT 0,
	`imageUrl` varchar(500),
	`isActive` enum('true','false') NOT NULL DEFAULT 'true',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_variants_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_variants_sku_unique` UNIQUE(`sku`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(50) NOT NULL,
	`name` varchar(200) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`description` text,
	`brandId` varchar(50) NOT NULL,
	`categoryId` varchar(50) NOT NULL,
	`basePrice` int NOT NULL,
	`rating` int DEFAULT 0,
	`reviewCount` int DEFAULT 0,
	`imageUrl` varchar(500),
	`tags` text,
	`nutritionFacts` text,
	`isActive` enum('true','false') NOT NULL DEFAULT 'true',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `stock_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` varchar(50) NOT NULL,
	`variantId` varchar(50),
	`email` varchar(320) NOT NULL,
	`isNotified` enum('true','false') NOT NULL DEFAULT 'false',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stock_alerts_id` PRIMARY KEY(`id`)
);
