-- Migration: Add performance indexes for better query performance
-- Version: V1047
-- Description: Adds database indexes to improve query performance for common operations

DO $$
BEGIN
    -- Game table performance indexes
    IF to_regclass('public.game') IS NOT NULL THEN
        CREATE INDEX IF NOT EXISTS idx_game_sport_time ON public.game(sport, "time");
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='game' AND column_name='location')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='game' AND column_name='latitude')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='game' AND column_name='longitude') THEN
            CREATE INDEX IF NOT EXISTS idx_game_location_coordinates ON public.game(location, latitude, longitude);
        END IF;
        CREATE INDEX IF NOT EXISTS idx_game_status_time ON public.game(status, "time");
        CREATE INDEX IF NOT EXISTS idx_game_user_time ON public.game(user_id, "time");
        CREATE INDEX IF NOT EXISTS idx_game_venue_time ON public.game(venue_id, "time");
        CREATE INDEX IF NOT EXISTS idx_game_capacity_status ON public.game(capacity, status);
        CREATE INDEX IF NOT EXISTS idx_game_price_range ON public.game(price_per_player, status);
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='game' AND column_name='latitude')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='game' AND column_name='longitude') THEN
            CREATE INDEX IF NOT EXISTS idx_game_advanced_search ON public.game(sport, status, "time", latitude, longitude);
        END IF;
        CREATE INDEX IF NOT EXISTS idx_game_active_sport_time ON public.game(sport, "time") WHERE status IN ('PUBLISHED', 'FULL');
        COMMENT ON INDEX idx_game_sport_time IS 'Index for filtering games by sport and time';
        COMMENT ON INDEX idx_game_location_coordinates IS 'Index for geographic game searches';
        COMMENT ON INDEX idx_game_advanced_search IS 'Composite index for complex game search queries';
    END IF;

    -- User table performance indexes
    IF to_regclass('public.app_user') IS NOT NULL THEN
        CREATE INDEX IF NOT EXISTS idx_user_username ON public.app_user(username);
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='app_user' AND column_name='location')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='app_user' AND column_name='latitude')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='app_user' AND column_name='longitude') THEN
            CREATE INDEX IF NOT EXISTS idx_user_location_coordinates ON public.app_user(location, latitude, longitude);
        END IF;
        CREATE INDEX IF NOT EXISTS idx_user_preferred_sport ON public.app_user(preferred_sport);
        CREATE INDEX IF NOT EXISTS idx_user_skill_level ON public.app_user(skill_level);
        CREATE INDEX IF NOT EXISTS idx_user_rating ON public.app_user(rating_average, rating_count);
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='app_user' AND column_name='created_at') THEN
            CREATE INDEX IF NOT EXISTS idx_user_created_at ON public.app_user(created_at);
        END IF;
        CREATE INDEX IF NOT EXISTS idx_user_advanced_search ON public.app_user(preferred_sport, skill_level, location, rating_average);
        CREATE INDEX IF NOT EXISTS idx_user_active_sport ON public.app_user(preferred_sport, skill_level) WHERE rating_average >= 3.0;
        COMMENT ON INDEX idx_user_username IS 'Index for user authentication lookups';
        COMMENT ON INDEX idx_user_advanced_search IS 'Composite index for complex user search queries';
    END IF;

    -- Venue table performance indexes
    IF to_regclass('public.venues') IS NOT NULL THEN
        CREATE INDEX IF NOT EXISTS idx_venue_name_city ON public.venues(name, city);
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='venues' AND column_name='latitude')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='venues' AND column_name='longitude') THEN
            CREATE INDEX IF NOT EXISTS idx_venue_location_coordinates ON public.venues(latitude, longitude);
        END IF;
        CREATE INDEX IF NOT EXISTS idx_venue_type_status ON public.venues(venue_type, status);
        CREATE INDEX IF NOT EXISTS idx_venue_capacity_price ON public.venues(max_capacity, base_price_per_hour);
        CREATE INDEX IF NOT EXISTS idx_venue_owner_status ON public.venues(owner_id, status);
        CREATE INDEX IF NOT EXISTS idx_venue_city_state ON public.venues(city, state, country);
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='venues' AND column_name='latitude')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='venues' AND column_name='longitude') THEN
            CREATE INDEX IF NOT EXISTS idx_venue_advanced_search ON public.venues(venue_type, status, city, latitude, longitude);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='venues' AND column_name='latitude')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='venues' AND column_name='longitude') THEN
            CREATE INDEX IF NOT EXISTS idx_venue_active_location ON public.venues(latitude, longitude) WHERE status = 'ACTIVE';
        END IF;
        COMMENT ON INDEX idx_venue_name_city IS 'Index for venue name and city searches';
        COMMENT ON INDEX idx_venue_location_coordinates IS 'Index for geographic venue searches';
        COMMENT ON INDEX idx_venue_advanced_search IS 'Composite index for complex venue search queries';
    END IF;

    -- Venue booking performance indexes
    IF to_regclass('public.venue_bookings') IS NOT NULL THEN
        CREATE INDEX IF NOT EXISTS idx_venue_booking_venue_time ON public.venue_bookings(venue_id, start_time, end_time);

        -- Create user/time index based on available column (user_id or booked_by)
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='venue_bookings' AND column_name='user_id') THEN
            CREATE INDEX IF NOT EXISTS idx_venue_booking_user_time ON public.venue_bookings(user_id, start_time);
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='venue_bookings' AND column_name='booked_by') THEN
            CREATE INDEX IF NOT EXISTS idx_venue_booking_user_time ON public.venue_bookings(booked_by, start_time);
        END IF;

        CREATE INDEX IF NOT EXISTS idx_venue_booking_status_time ON public.venue_bookings(status, start_time);

        -- Create payment status index only if columns exist
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='venue_bookings' AND column_name='payment_status')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='venue_bookings' AND column_name='created_at') THEN
            CREATE INDEX IF NOT EXISTS idx_venue_booking_payment_status ON public.venue_bookings(payment_status, created_at);
        END IF;
    END IF;

    -- Game participants performance indexes
    IF to_regclass('public.game_participants') IS NOT NULL THEN
        CREATE INDEX IF NOT EXISTS idx_game_participants_game_user ON public.game_participants(game_id, user_id);

        -- user/time index: prefer created_at if present; otherwise fallback to joined_at
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='game_participants' AND column_name='created_at') THEN
            CREATE INDEX IF NOT EXISTS idx_game_participants_user_time ON public.game_participants(user_id, created_at);
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='game_participants' AND column_name='joined_at') THEN
            CREATE INDEX IF NOT EXISTS idx_game_participants_user_time ON public.game_participants(user_id, joined_at);
        END IF;

        -- status/time index only if both columns exist
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='game_participants' AND column_name='status')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='game_participants' AND column_name='created_at') THEN
            CREATE INDEX IF NOT EXISTS idx_game_participants_status ON public.game_participants(status, created_at);
        END IF;
    END IF;

    -- Game waitlist performance indexes
    IF to_regclass('public.game_waitlist') IS NOT NULL THEN
        CREATE INDEX IF NOT EXISTS idx_game_waitlist_game_user ON public.game_waitlist(game_id, user_id);
        CREATE INDEX IF NOT EXISTS idx_game_waitlist_user_time ON public.game_waitlist(user_id, created_at);
        CREATE INDEX IF NOT EXISTS idx_game_waitlist_priority ON public.game_waitlist(game_id, created_at);
    END IF;

    -- Chat messages performance indexes
    IF to_regclass('public.chat_messages') IS NOT NULL THEN
        -- Only create indexes if target columns exist
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='chat_messages' AND column_name='game_id')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='chat_messages' AND column_name='created_at') THEN
            CREATE INDEX IF NOT EXISTS idx_chat_messages_game_time ON public.chat_messages(game_id, created_at);
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='chat_messages' AND column_name='user_id')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='chat_messages' AND column_name='created_at') THEN
            CREATE INDEX IF NOT EXISTS idx_chat_messages_user_time ON public.chat_messages(user_id, created_at);
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='chat_messages' AND column_name='message_type')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='chat_messages' AND column_name='created_at') THEN
            CREATE INDEX IF NOT EXISTS idx_chat_messages_type_time ON public.chat_messages(message_type, created_at);
        END IF;
    END IF;

    -- Notification performance indexes
    IF to_regclass('public.notification') IS NOT NULL THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notification' AND column_name='user_id')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notification' AND column_name='type')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notification' AND column_name='created_at') THEN
            CREATE INDEX IF NOT EXISTS idx_notification_user_type ON public.notification(user_id, type, created_at);
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notification' AND column_name='status')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notification' AND column_name='created_at') THEN
            CREATE INDEX IF NOT EXISTS idx_notification_status_time ON public.notification(status, created_at);
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notification' AND column_name='user_id')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notification' AND column_name='read')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notification' AND column_name='created_at') THEN
            CREATE INDEX IF NOT EXISTS idx_notification_read_status ON public.notification(user_id, read, created_at);
        END IF;
    END IF;

    -- User ratings performance indexes
    IF to_regclass('public.user_ratings') IS NOT NULL THEN
        -- rated_user composite with rating_type if present; else rating_category; else fallback
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_ratings' AND column_name='rating_type') THEN
            CREATE INDEX IF NOT EXISTS idx_user_ratings_rated_user ON public.user_ratings(rated_user_id, rating_type);
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_ratings' AND column_name='rating_category') THEN
            CREATE INDEX IF NOT EXISTS idx_user_ratings_rated_user ON public.user_ratings(rated_user_id, rating_category);
        ELSE
            CREATE INDEX IF NOT EXISTS idx_user_ratings_rated_user ON public.user_ratings(rated_user_id);
        END IF;

        -- rater_user with created_at if available
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_ratings' AND column_name='created_at') THEN
            CREATE INDEX IF NOT EXISTS idx_user_ratings_rater_user ON public.user_ratings(rater_user_id, created_at);
        ELSE
            CREATE INDEX IF NOT EXISTS idx_user_ratings_rater_user ON public.user_ratings(rater_user_id);
        END IF;

        -- rating value/time index: prefer rating_value; else rating
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_ratings' AND column_name='rating_value')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_ratings' AND column_name='created_at') THEN
            CREATE INDEX IF NOT EXISTS idx_user_ratings_rating_value ON public.user_ratings(rating_value, created_at);
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_ratings' AND column_name='rating')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_ratings' AND column_name='created_at') THEN
            CREATE INDEX IF NOT EXISTS idx_user_ratings_rating_value ON public.user_ratings(rating, created_at);
        END IF;
    END IF;

    -- Search and discovery performance indexes
    IF to_regclass('public.saved_searches') IS NOT NULL THEN
        CREATE INDEX IF NOT EXISTS idx_saved_searches_user_sport ON public.saved_searches(user_id, sport);
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='saved_searches' AND column_name='latitude')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='saved_searches' AND column_name='longitude') THEN
            CREATE INDEX IF NOT EXISTS idx_saved_searches_location ON public.saved_searches(latitude, longitude);
        END IF;
        CREATE INDEX IF NOT EXISTS idx_saved_searches_frequency ON public.saved_searches(user_id, search_frequency);
    END IF;

    -- Analytics and tracking performance indexes
    IF to_regclass('public.analytics_events') IS NOT NULL THEN
        CREATE INDEX IF NOT EXISTS idx_analytics_events_user_type ON public.analytics_events(user_id, event_type, created_at);
        CREATE INDEX IF NOT EXISTS idx_analytics_events_session_time ON public.analytics_events(session_id, created_at);
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='analytics_events' AND column_name='latitude')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='analytics_events' AND column_name='longitude') THEN
            CREATE INDEX IF NOT EXISTS idx_analytics_events_location ON public.analytics_events(latitude, longitude, created_at);
        END IF;
    END IF;

    -- Performance metrics indexes
    IF to_regclass('public.performance_metrics') IS NOT NULL THEN
        CREATE INDEX IF NOT EXISTS idx_performance_metrics_endpoint_time ON public.performance_metrics(endpoint, created_at);
        CREATE INDEX IF NOT EXISTS idx_performance_metrics_response_time ON public.performance_metrics(response_time, created_at);
        CREATE INDEX IF NOT EXISTS idx_performance_metrics_status_code ON public.performance_metrics(status_code, created_at);
    END IF;

    -- Business intelligence indexes
    IF to_regclass('public.business_intelligence') IS NOT NULL THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='business_intelligence' AND column_name='date') THEN
            CREATE INDEX IF NOT EXISTS idx_business_intelligence_metric_date ON public.business_intelligence(metric_name, date);
            CREATE INDEX IF NOT EXISTS idx_business_intelligence_category ON public.business_intelligence(category, date);
            CREATE INDEX IF NOT EXISTS idx_business_intelligence_value_range ON public.business_intelligence(metric_value, date);
        END IF;
    END IF;

    -- Predictive analytics indexes
    IF to_regclass('public.predictive_analytics') IS NOT NULL THEN
        CREATE INDEX IF NOT EXISTS idx_predictive_analytics_model_type ON public.predictive_analytics(model_type, created_at);
        CREATE INDEX IF NOT EXISTS idx_predictive_analytics_accuracy ON public.predictive_analytics(accuracy_score, created_at);
        CREATE INDEX IF NOT EXISTS idx_predictive_analytics_prediction_type ON public.predictive_analytics(prediction_type, created_at);
    END IF;
END
$$;
