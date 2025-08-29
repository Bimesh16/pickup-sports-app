package com.bmessi.pickupsportsapp.config;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.PlatformTransactionManager;

@Configuration
@EnableBatchProcessing
public class DataRetentionBatchConfig {

    @Value("${retention.chat.messages.days:60}")
    private long chatMessagesDays;

    @Value("${retention.audit.days:365}")
    private long auditDays;

    @Bean
    public Job dataRetentionJob(JobRepository jobRepository,
                                PlatformTransactionManager transactionManager,
                                JdbcTemplate jdbc) {
        Step purgeChat = new StepBuilder("purgeChatMessages", jobRepository)
                .tasklet((contribution, context) -> {
                    if (chatMessagesDays > 0) {
                        Instant cutoff = Instant.now().minus(chatMessagesDays, ChronoUnit.DAYS);
                        jdbc.update("DELETE FROM chat_messages WHERE sent_at < ?", Timestamp.from(cutoff));
                    }
                    return RepeatStatus.FINISHED;
                }, transactionManager)
                .build();

        Step purgeAudit = new StepBuilder("purgeAdminAudit", jobRepository)
                .tasklet((contribution, context) -> {
                    if (auditDays > 0) {
                        Instant cutoff = Instant.now().minus(auditDays, ChronoUnit.DAYS);
                        jdbc.update("DELETE FROM admin_audit WHERE created_at < ?", Timestamp.from(cutoff));
                    }
                    return RepeatStatus.FINISHED;
                }, transactionManager)
                .build();

        return new JobBuilder("dataRetentionJob", jobRepository)
                .start(purgeChat)
                .next(purgeAudit)
                .build();
    }
}
