-- Spider database schema

-- Create scrape_task table
CREATE TABLE IF NOT EXISTS `scrape_task` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Task ID',
    `task_name` VARCHAR(255) NOT NULL COMMENT 'Task name',
    `url` VARCHAR(2048) NOT NULL COMMENT 'Target URL',
    `mode` VARCHAR(50) NOT NULL COMMENT 'Scraping mode',
    `status` VARCHAR(50) NOT NULL COMMENT 'Task status',
    `prompt` TEXT COMMENT 'LLM prompt',
    `config_json` TEXT COMMENT 'Configuration JSON',
    `result_json` LONGTEXT COMMENT 'Result JSON',
    `error_message` TEXT COMMENT 'Error message',
    `start_time` DATETIME COMMENT 'Start time',
    `end_time` DATETIME COMMENT 'End time',
    `duration` BIGINT COMMENT 'Duration in milliseconds',
    `pages_scraped` INT DEFAULT 0 COMMENT 'Number of pages scraped',
    `created_by` VARCHAR(100) COMMENT 'Created by user',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    PRIMARY KEY (`id`),
    INDEX `idx_url` (`url`(255)),
    INDEX `idx_status` (`status`),
    INDEX `idx_create_time` (`create_time`)
) ENGINE=InnoDB COMMENT='Scrape task table';

-- Create scrape_result table for storing individual page results
CREATE TABLE IF NOT EXISTS `scrape_result` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Result ID',
    `task_id` BIGINT NOT NULL COMMENT 'Task ID',
    `url` VARCHAR(2048) NOT NULL COMMENT 'Page URL',
    `content` LONGTEXT COMMENT 'Extracted content',
    `structured_data` LONGTEXT COMMENT 'Structured data JSON',
    `raw_html` LONGTEXT COMMENT 'Raw HTML',
    `success` TINYINT(1) DEFAULT 1 COMMENT 'Success flag',
    `error_message` TEXT COMMENT 'Error message',
    `duration` BIGINT COMMENT 'Processing duration in ms',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    PRIMARY KEY (`id`),
    INDEX `idx_task_id` (`task_id`),
    INDEX `idx_url` (`url`(255)),
    FOREIGN KEY (`task_id`) REFERENCES `scrape_task`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Scrape result table';
