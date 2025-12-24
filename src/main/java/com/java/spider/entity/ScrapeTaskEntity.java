package com.java.spider.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.java.spider.enums.ScrapeMode;
import com.java.spider.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Scrape task entity
 *
 * @author whoami
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("scrape_task")
public class ScrapeTaskEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * Task name
     */
    private String taskName;

    /**
     * Target URL
     */
    private String url;

    /**
     * Scraping mode
     */
    private ScrapeMode mode;

    /**
     * Task status
     */
    private TaskStatus status;

    /**
     * LLM prompt
     */
    private String prompt;

    /**
     * Configuration JSON
     */
    private String configJson;

    /**
     * Result JSON
     */
    private String resultJson;

    /**
     * Error message
     */
    private String errorMessage;

    /**
     * Start time
     */
    private LocalDateTime startTime;

    /**
     * End time
     */
    private LocalDateTime endTime;

    /**
     * Duration in milliseconds
     */
    private Long duration;

    /**
     * Pages scraped
     */
    private Integer pagesScraped;

    /**
     * Created by
     */
    private String createdBy;

    /**
     * Creation time
     */
    private LocalDateTime createTime;

    /**
     * Update time
     */
    private LocalDateTime updateTime;
}
