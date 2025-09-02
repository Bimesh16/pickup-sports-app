import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  BackHandler,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { Portal } from 'react-native-paper';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NepalColors, commonStyles } from '../../styles/theme';
import { ModalOptions } from '../../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AdvancedModalProps {
  visible: boolean;
  children: React.ReactNode;
  onDismiss?: () => void;
  options?: ModalOptions;
}

/**
 * Advanced Modal Component with Background Dismissal
 * Features:
 * - Multiple animation types (slide, fade, scale)
 * - Position options (center, bottom, top)
 * - Background blur effect
 * - Hardware back button handling (Android)
 * - Safe area handling
 * - Gesture-based dismissal
 * - Customizable appearance
 */
const AdvancedModal: React.FC<AdvancedModalProps> = ({
  visible,
  children,
  onDismiss,
  options = {},
}) => {
  const insets = useSafeAreaInsets();
  
  const {
    title,
    dismissible = true,
    showCloseButton = true,
    animationType = 'slide',
    position = 'center',
    backgroundColor = NepalColors.surface,
  } = options;

  // Animation values
  const backdropOpacity = useSharedValue(0);
  const modalTranslateY = useSharedValue(SCREEN_HEIGHT);
  const modalScale = useSharedValue(0.8);
  const modalOpacity = useSharedValue(0);

  // Handle back button on Android
  useEffect(() => {
    if (!visible || !dismissible) return;

    const backAction = () => {
      if (onDismiss) {
        onDismiss();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [visible, dismissible, onDismiss]);

  // Show modal animation
  const showModal = useCallback(() => {
    backdropOpacity.value = withTiming(1, { duration: 300 });
    
    switch (animationType) {
      case 'slide':
        modalTranslateY.value = withSpring(0, {
          damping: 20,
          stiffness: 300,
        });
        break;
      case 'scale':
        modalScale.value = withSpring(1, {
          damping: 15,
          stiffness: 300,
        });
        modalOpacity.value = withTiming(1, { duration: 200 });
        break;
      case 'fade':
        modalOpacity.value = withTiming(1, { duration: 300 });
        break;
    }
  }, [animationType]);

  // Hide modal animation
  const hideModal = useCallback(() => {
    backdropOpacity.value = withTiming(0, { duration: 200 });
    
    switch (animationType) {
      case 'slide':
        modalTranslateY.value = withTiming(
          position === 'top' ? -SCREEN_HEIGHT : SCREEN_HEIGHT,
          { duration: 250 }
        );
        break;
      case 'scale':
        modalScale.value = withSpring(0.8, {
          damping: 15,
          stiffness: 300,
        });
        modalOpacity.value = withTiming(0, { duration: 150 });
        break;
      case 'fade':
        modalOpacity.value = withTiming(0, { duration: 200 });
        break;
    }
  }, [animationType, position]);

  // Handle backdrop press
  const handleBackdropPress = useCallback(() => {
    if (dismissible && onDismiss) {
      onDismiss();
    }
  }, [dismissible, onDismiss]);

  // Initialize animation values based on position and type
  useEffect(() => {
    if (visible) {
      // Reset values before showing
      backdropOpacity.value = 0;
      
      switch (animationType) {
        case 'slide':
          modalTranslateY.value = position === 'top' ? -SCREEN_HEIGHT : SCREEN_HEIGHT;
          break;
        case 'scale':
          modalScale.value = 0.8;
          modalOpacity.value = 0;
          break;
        case 'fade':
          modalOpacity.value = 0;
          break;
      }
      
      // Start show animation
      requestAnimationFrame(showModal);
    } else {
      hideModal();
    }
  }, [visible, animationType, position, showModal, hideModal]);

  // Animated styles
  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const modalAnimatedStyle = useAnimatedStyle(() => {
    const baseStyle: any = {};

    switch (animationType) {
      case 'slide':
        baseStyle.transform = [{ translateY: modalTranslateY.value }];
        break;
      case 'scale':
        baseStyle.opacity = modalOpacity.value;
        baseStyle.transform = [{ scale: modalScale.value }];
        break;
      case 'fade':
        baseStyle.opacity = modalOpacity.value;
        break;
    }

    return baseStyle;
  });

  // Get container style based on position
  const getContainerStyle = () => {
    switch (position) {
      case 'top':
        return [styles.container, styles.containerTop, { paddingTop: insets.top }];
      case 'bottom':
        return [styles.container, styles.containerBottom, { paddingBottom: insets.bottom }];
      default:
        return [styles.container, styles.containerCenter];
    }
  };

  // Get modal style based on position
  const getModalStyle = () => {
    const baseStyle = [
      styles.modal,
      { backgroundColor },
      position === 'bottom' && styles.modalBottom,
      position === 'top' && styles.modalTop,
    ];

    return baseStyle;
  };

  if (!visible) return null;

  return (
    <Portal>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          onPress={handleBackdropPress}
          activeOpacity={1}
        >
          <BlurView intensity={20} style={StyleSheet.absoluteFillObject} />
        </TouchableOpacity>
      </Animated.View>

      {/* Modal Container */}
      <View style={getContainerStyle()} pointerEvents="box-none">
        <Animated.View style={[getModalStyle(), modalAnimatedStyle]}>
          {/* Header */}
          {(title || showCloseButton) && (
            <View style={styles.header}>
              {title && (
                <Text style={styles.title} numberOfLines={1}>
                  {title}
                </Text>
              )}
              {showCloseButton && dismissible && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onDismiss}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={NepalColors.onSurface}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Content */}
          <View style={styles.content}>
            {children}
          </View>
        </Animated.View>
      </View>
    </Portal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1001,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: commonStyles.padding.large,
  },
  containerCenter: {
    justifyContent: 'center',
  },
  containerTop: {
    justifyContent: 'flex-start',
  },
  containerBottom: {
    justifyContent: 'flex-end',
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    maxHeight: SCREEN_HEIGHT * 0.9,
    borderRadius: commonStyles.borderRadius.large,
    ...commonStyles.shadows.large,
  },
  modalBottom: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
  },
  modalTop: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: commonStyles.padding.large,
    paddingVertical: commonStyles.padding.medium,
    borderBottomWidth: 1,
    borderBottomColor: NepalColors.outlineVariant,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.onSurface,
    marginRight: commonStyles.padding.medium,
  },
  closeButton: {
    padding: commonStyles.padding.small,
    borderRadius: commonStyles.borderRadius.small,
    backgroundColor: NepalColors.surfaceVariant,
  },
  content: {
    padding: commonStyles.padding.large,
  },
});

export default AdvancedModal;

// =============== Modal Provider Component ===============
interface ModalContextType {
  showModal: (content: React.ReactNode, options?: ModalOptions) => void;
  hideModal: () => void;
  showConfirmDialog: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => void;
  showAlert: (title: string, message: string) => void;
}

const ModalContext = React.createContext<ModalContextType | null>(null);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = React.useState<{
    visible: boolean;
    content: React.ReactNode;
    options: ModalOptions;
  }>({
    visible: false,
    content: null,
    options: {},
  });

  const showModal = useCallback(
    (content: React.ReactNode, options: ModalOptions = {}) => {
      setModalState({
        visible: true,
        content,
        options: {
          dismissible: true,
          showCloseButton: true,
          animationType: 'slide',
          position: 'center',
          ...options,
        },
      });
    },
    []
  );

  const hideModal = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      visible: false,
    }));
    
    // Clear content after animation
    setTimeout(() => {
      setModalState(prev => ({
        ...prev,
        content: null,
      }));
    }, 300);
  }, []);

  const showConfirmDialog = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      onCancel?: () => void
    ) => {
      const content = (
        <View>
          <Text style={styles.dialogMessage}>{message}</Text>
          <View style={styles.dialogActions}>
            <TouchableOpacity
              style={[styles.dialogButton, styles.cancelButton]}
              onPress={() => {
                hideModal();
                onCancel?.();
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dialogButton, styles.confirmButton]}
              onPress={() => {
                hideModal();
                onConfirm();
              }}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      );

      showModal(content, {
        title,
        dismissible: true,
        showCloseButton: false,
        animationType: 'scale',
      });
    },
    [showModal, hideModal]
  );

  const showAlert = useCallback(
    (title: string, message: string) => {
      const content = (
        <View>
          <Text style={styles.dialogMessage}>{message}</Text>
          <TouchableOpacity
            style={[styles.dialogButton, styles.confirmButton, styles.singleButton]}
            onPress={hideModal}
          >
            <Text style={styles.confirmButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      );

      showModal(content, {
        title,
        dismissible: true,
        showCloseButton: false,
        animationType: 'scale',
      });
    },
    [showModal, hideModal]
  );

  const handleDismiss = useCallback(() => {
    if (modalState.options.onDismiss) {
      modalState.options.onDismiss();
    }
    hideModal();
  }, [modalState.options, hideModal]);

  return (
    <ModalContext.Provider
      value={{
        showModal,
        hideModal,
        showConfirmDialog,
        showAlert,
      }}
    >
      {children}
      <AdvancedModal
        visible={modalState.visible}
        onDismiss={modalState.options.dismissible ? handleDismiss : undefined}
        options={modalState.options}
      >
        {modalState.content}
      </AdvancedModal>
    </ModalContext.Provider>
  );
};

// Hook to use modal context
export const useModal = () => {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

// Additional styles for dialog components
const dialogStyles = StyleSheet.create({
  dialogMessage: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurface,
    lineHeight: 24,
    marginBottom: commonStyles.padding.large,
    textAlign: 'center',
  },
  dialogActions: {
    flexDirection: 'row',
    gap: commonStyles.padding.medium,
  },
  dialogButton: {
    flex: 1,
    paddingVertical: commonStyles.padding.medium,
    borderRadius: commonStyles.borderRadius.medium,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: NepalColors.surfaceVariant,
    borderWidth: 1,
    borderColor: NepalColors.outline,
  },
  confirmButton: {
    backgroundColor: NepalColors.primaryCrimson,
  },
  singleButton: {
    marginHorizontal: commonStyles.padding.large,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: NepalColors.onSurface,
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.primaryWhite,
  },
});

// Merge dialog styles with main styles
Object.assign(styles, dialogStyles);

export default AdvancedModal;