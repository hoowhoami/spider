package com.java.spider.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.java.spider.entity.ScrapeTaskEntity;
import com.java.spider.enums.ScrapeMode;
import com.java.spider.enums.TaskStatus;
import com.java.spider.mapper.ScrapeTaskMapper;
import com.java.spider.service.ScrapeTaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Scrape task service implementation
 *
 * @author whoami
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ScrapeTaskServiceImpl extends ServiceImpl<ScrapeTaskMapper, ScrapeTaskEntity>
        implements ScrapeTaskService {

    @Override
    public ScrapeTaskEntity createTask(String taskName, String url, String prompt) {
        ScrapeTaskEntity task = ScrapeTaskEntity.builder()
                .taskName(taskName)
                .url(url)
                .prompt(prompt)
                .mode(ScrapeMode.SMART_SCRAPER)
                .status(TaskStatus.PENDING)
                .createTime(LocalDateTime.now())
                .updateTime(LocalDateTime.now())
                .build();

        save(task);
        log.info("Created task: id={}, name={}", task.getId(), task.getTaskName());

        return task;
    }

    @Override
    public void updateTaskStatus(Long taskId, TaskStatus status) {
        ScrapeTaskEntity task = getById(taskId);
        if (task != null) {
            task.setStatus(status);
            task.setUpdateTime(LocalDateTime.now());

            if (status == TaskStatus.RUNNING) {
                task.setStartTime(LocalDateTime.now());
            } else if (status == TaskStatus.COMPLETED || status == TaskStatus.FAILED) {
                task.setEndTime(LocalDateTime.now());
                if (task.getStartTime() != null) {
                    task.setDuration(
                            java.time.Duration.between(task.getStartTime(), task.getEndTime()).toMillis()
                    );
                }
            }

            updateById(task);
            log.info("Updated task status: id={}, status={}", taskId, status);
        }
    }

    @Override
    public void saveTaskResult(Long taskId, String result) {
        ScrapeTaskEntity task = getById(taskId);
        if (task != null) {
            task.setResultJson(result);
            task.setUpdateTime(LocalDateTime.now());
            updateById(task);
            log.info("Saved task result: id={}", taskId);
        }
    }
}
