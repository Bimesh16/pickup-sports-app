package com.bmessi.pickupsportsapp.service;

import lombok.RequiredArgsConstructor;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DataRetentionJobService {

    private static final Logger log = LoggerFactory.getLogger(DataRetentionJobService.class);

    private final JobLauncher jobLauncher;
    private final Job dataRetentionJob;

    @Scheduled(cron = "${retention.batch.cron:0 0 3 * * *}")
    @SchedulerLock(name = "dataRetentionJob")
    public void run() {
        try {
            jobLauncher.run(dataRetentionJob, new JobParametersBuilder()
                    .addLong("run.id", System.currentTimeMillis())
                    .toJobParameters());
        } catch (Exception e) {
            log.warn("Data retention job failed: {}", e.getMessage());
        }
    }
}
