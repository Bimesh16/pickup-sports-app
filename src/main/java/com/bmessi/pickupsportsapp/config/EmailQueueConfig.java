package com.bmessi.pickupsportsapp.config;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Declares the email queue and its dead-letter queue.
 */
@Configuration
public class EmailQueueConfig {

    @Value("${emails.queue:emails.queue}")
    private String emailQueue;

    @Bean
    public Queue emailsQueue() {
        return QueueBuilder.durable(emailQueue)
                .withArgument("x-dead-letter-exchange", "")
                .withArgument("x-dead-letter-routing-key", emailQueue + ".dlq")
                .build();
    }

    @Bean
    public Queue emailsDlq() {
        return QueueBuilder.durable(emailQueue + ".dlq").build();
    }
}
