package com.ertriage.web;

import com.ertriage.service.QueueService;

import java.util.Map;

public class MetricsController {

    private final QueueService queueService;

    public MetricsController(QueueService queueService) {
        this.queueService = queueService;
    }

    // 7.2.1 getTriageCounts()
    public Map<String, Long> getTriageCounts() {
        return queueService.countsByLevel();
    }
}