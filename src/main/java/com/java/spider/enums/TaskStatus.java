package com.java.spider.enums;

/**
 * Task status enumeration
 *
 * @author whoami
 */
public enum TaskStatus {

    /**
     * Task is pending
     */
    PENDING,

    /**
     * Task is running
     */
    RUNNING,

    /**
     * Task completed successfully
     */
    COMPLETED,

    /**
     * Task failed
     */
    FAILED,

    /**
     * Task was canceled
     */
    CANCELED
}
