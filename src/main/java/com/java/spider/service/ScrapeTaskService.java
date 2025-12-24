package com.java.spider.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.java.spider.entity.ScrapeTaskEntity;

/**
 * Scrape task service interface
 *
 * @author whoami
 */
public interface ScrapeTaskService extends IService<ScrapeTaskEntity> {

    /**
     * Create new scrape task
     *
     * @param taskName task name
     * @param url      target URL
     * @param prompt   LLM prompt
     * @return task entity
     */
    ScrapeTaskEntity createTask(String taskName, String url, String prompt);

    /**
     * Update task status
     *
     * @param taskId task ID
     * @param status task status
     */
    void updateTaskStatus(Long taskId, com.java.spider.enums.TaskStatus status);

    /**
     * Save task result
     *
     * @param taskId task ID
     * @param result result JSON
     */
    void saveTaskResult(Long taskId, String result);
}
