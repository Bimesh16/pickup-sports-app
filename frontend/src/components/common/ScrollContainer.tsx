import React, { forwardRef, useCallback, useState } from 'react';
import {
  ScrollView,
  RefreshControl,
  StyleSheet,
  Platform,
  ViewStyle,
} from 'react-native';
import { useScrollToTop } from '@react-navigation/native';
import Animated, { 
  useAnimatedScrollHandler, 
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { NepalColors, commonStyles } from '../../styles/theme';
import { ScrollContainerProps } from '../../types';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

/**
 * Advanced ScrollContainer with consistent behavior across all screens
 * Features:
 * - Pull to refresh with haptic feedback
 * - Smooth scrolling animations
 * - Auto scroll-to-top on tab press
 * - Scroll progress tracking
 * - Memory optimization
 */
const ScrollContainer = forwardRef<ScrollView, ScrollContainerProps>(
  (
    {
      children,
      refreshing = false,
      onRefresh,
      showsVerticalScrollIndicator = true,
      contentContainerStyle,
      style,
      ...props
    },
    ref
  ) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const scrollY = useSharedValue(0);
    const scrollProgress = useSharedValue(0);

    // Auto scroll to top when tab is pressed (React Navigation integration)
    useScrollToTop(ref);

    // Enhanced refresh handler with haptic feedback
    const handleRefresh = useCallback(async () => {
      if (!onRefresh) return;
      
      setIsRefreshing(true);
      
      // Add haptic feedback for iOS
      if (Platform.OS === 'ios') {
        const { HapticFeedback } = await import('expo-haptics');
        HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Light);
      }
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }, [onRefresh]);

    // Scroll progress calculation for advanced UI effects
    const updateScrollProgress = useCallback((contentHeight: number, scrollViewHeight: number) => {
      if (contentHeight <= scrollViewHeight) {
        scrollProgress.value = 0;
        return;
      }
      
      const maxScroll = contentHeight - scrollViewHeight;
      scrollProgress.value = Math.min(scrollY.value / maxScroll, 1);
    }, [scrollY, scrollProgress]);

    // Animated scroll handler for smooth interactions
    const scrollHandler = useAnimatedScrollHandler({
      onScroll: (event) => {
        scrollY.value = event.contentOffset.y;
        
        // Update scroll progress on JS thread
        runOnJS(updateScrollProgress)(
          event.contentSize.height,
          event.layoutMeasurement.height
        );
      },
    });

    // Animated styles for scroll-based effects
    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: interpolate(scrollY.value, [0, 50], [1, 0.98]),
      };
    });

    return (
      <AnimatedScrollView
        ref={ref}
        style={[styles.container, style, animatedStyle]}
        contentContainerStyle={[
          styles.contentContainer,
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        bounces={true}
        bouncesZoom={false}
        alwaysBounceVertical={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing || isRefreshing}
              onRefresh={handleRefresh}
              tintColor={NepalColors.primaryCrimson}
              colors={[NepalColors.primaryCrimson, NepalColors.primaryBlue]}
              progressBackgroundColor={NepalColors.surface}
              titleColor={NepalColors.onSurface}
              title="Pull to refresh"
              style={styles.refreshControl}
            />
          ) : undefined
        }
        // Performance optimizations
        removeClippedSubviews={Platform.OS === 'android'}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={8}
        updateCellsBatchingPeriod={100}
        getItemLayout={undefined} // Let FlatList calculate automatically
        {...props}
      >
        {children}
      </AnimatedScrollView>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    ...commonStyles.scrollContainer,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: commonStyles.padding.medium,
  },
  refreshControl: {
    backgroundColor: NepalColors.surface,
  },
});

ScrollContainer.displayName = 'ScrollContainer';

export default ScrollContainer;

// =============== Hook for Scroll Management ===============
export const useScrollContainer = (options: {
  onRefresh?: () => Promise<void>;
  refreshing?: boolean;
} = {}) => {
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useSharedValue(0);

  const handleRefresh = useCallback(async () => {
    if (!options.onRefresh) return;
    
    setRefreshing(true);
    try {
      await options.onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [options.onRefresh]);

  const scrollToTop = useCallback((ref: React.RefObject<ScrollView>) => {
    ref.current?.scrollTo({ y: 0, animated: true });
  }, []);

  return {
    refreshing: options.refreshing ?? refreshing,
    onRefresh: handleRefresh,
    scrollY,
    scrollToTop,
  };
};