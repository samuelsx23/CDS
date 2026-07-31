CREATE TABLE `vehicles` (
	`id` integer PRIMARY KEY NOT NULL,
	`brand` text NOT NULL,
	`model` text NOT NULL,
	`version` text NOT NULL,
	`price` integer NOT NULL,
	`year` integer NOT NULL,
	`km` integer NOT NULL,
	`color` text NOT NULL,
	`transmission` text NOT NULL,
	`fuel` text NOT NULL,
	`image` text NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `media_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` integer NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL,
	`uploaded_by` text NOT NULL,
	`data` blob NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `media_assets_vehicle_id_idx` ON `media_assets` (`vehicle_id`);
