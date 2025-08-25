package com.bmessi.pickupsportsapp.common.config;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Declares the notification queue and its dead-letter queue.
 */
@Configuration
public class NotificationQueueConfig {

    @Value("${notifications.queue:notifications.queue}")
    private String notificationQueue;

    @Bean
    public Queue notificationsQueue() {
        return QueueBuilder.durable(notificationQueue)
                .withArgument("x-dead-letter-exchange", "")
                .withArgument("x-dead-letter-routing-key", notificationQueue + ".dlq")
                .build();
    }

    @Bean
    public Queue notificationsDlq() {
        return QueueBuilder.durable(notificationQueue + ".dlq").build();
    }
}

