package com.bmessi.pickupsportsapp.service.notification.channels;

import com.bmessi.pickupsportsapp.entity.notification.EnhancedNotification;
import com.bmessi.pickupsportsapp.service.notification.NotificationChannelService;

/**
 * Interface for notification delivery channels.
 * 
 * Each channel implementation is responsible for delivering notifications
 * through a specific medium (email, push, SMS, etc.).
 */
public interface NotificationChannel {

    /**
     * Deliver a notification through this channel.
     * 
     * @param notification The notification to deliver
     * @return true if delivery was successful, false otherwise
     */
    boolean deliver(EnhancedNotification notification);

    /**
     * Check if this channel is available and properly configured.
     * 
     * @return true if the channel can be used for delivery
     */
    boolean isAvailable();

    /**
     * Get the current health status of this channel for monitoring.
     * 
     * @return Channel health status information
     */
    NotificationChannelService.ChannelStatus getHealthStatus();
}
