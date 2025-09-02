import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Platform,
  TextInput,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Portal } from 'react-native-paper';
import { BlurView } from 'expo-blur';
import { NepalColors, commonStyles } from '../../styles/theme';
import { DropdownOption, DropdownProps } from '../../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_DROPDOWN_HEIGHT = SCREEN_HEIGHT * 0.4;

/**
 * Advanced Dropdown Component
 * Features:
 * - Smooth animations with spring physics
 * - Search functionality
 * - Multi-select support
 * - Custom positioning
 * - Blur overlay
 * - Keyboard navigation support
 * - Performance optimized for large lists
 */
const AdvancedDropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onSelect,
  placeholder = 'Select an option',
  searchable = false,
  multiple = false,
  disabled = false,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>(
    multiple ? (Array.isArray(value) ? value : value ? [value] : []) : []
  );
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  
  const triggerRef = useRef<TouchableOpacity>(null);
  const searchInputRef = useRef<TextInput>(null);
  
  // Animated values
  const animatedHeight = useSharedValue(0);
  const animatedOpacity = useSharedValue(0);
  const animatedScale = useSharedValue(0.95);
  const chevronRotation = useSharedValue(0);

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return options;
    
    return options.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  // Calculate dropdown position
  const calculatePosition = useCallback(() => {
    triggerRef.current?.measure((x, y, width, height, pageX, pageY) => {
      const availableSpaceBelow = SCREEN_HEIGHT - (pageY + height);
      const dropdownHeight = Math.min(
        filteredOptions.length * 48 + (searchable ? 48 : 0) + 16,
        MAX_DROPDOWN_HEIGHT
      );
      
      setDropdownPosition({
        top: availableSpaceBelow >= dropdownHeight ? pageY + height : pageY - dropdownHeight,
        left: pageX,
        width: width,
      });
    });
  }, [filteredOptions.length, searchable]);

  // Open dropdown
  const openDropdown = useCallback(() => {
    if (disabled) return;
    
    calculatePosition();
    setIsOpen(true);
    
    // Animate opening
    animatedOpacity.value = withTiming(1, { duration: 200 });
    animatedHeight.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
    animatedScale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
    chevronRotation.value = withSpring(180, {
      damping: 15,
      stiffness: 300,
    });

    // Focus search input if searchable
    if (searchable) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [disabled, calculatePosition, searchable]);

  // Close dropdown
  const closeDropdown = useCallback(() => {
    animatedOpacity.value = withTiming(0, { duration: 150 });
    animatedHeight.value = withSpring(0, {
      damping: 15,
      stiffness: 300,
    });
    animatedScale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 300,
    });
    chevronRotation.value = withSpring(0, {
      damping: 15,
      stiffness: 300,
    });

    // Close after animation
    setTimeout(() => {
      runOnJS(setIsOpen)(false);
      runOnJS(setSearchQuery)('');
    }, 150);
  }, []);

  // Handle option selection
  const handleOptionSelect = useCallback((optionValue: string) => {
    if (multiple) {
      const newSelection = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];
      
      setSelectedValues(newSelection);
      onSelect(newSelection.join(','));
    } else {
      onSelect(optionValue);
      closeDropdown();
    }
  }, [multiple, selectedValues, onSelect, closeDropdown]);

  // Get display text for trigger
  const getDisplayText = useCallback(() => {
    if (multiple) {
      if (selectedValues.length === 0) return placeholder;
      if (selectedValues.length === 1) {
        const option = options.find(opt => opt.value === selectedValues[0]);
        return option?.label || selectedValues[0];
      }
      return `${selectedValues.length} selected`;
    }
    
    const selectedOption = options.find(opt => opt.value === value);
    return selectedOption?.label || placeholder;
  }, [multiple, selectedValues, value, options, placeholder]);

  // Animated styles
  const dropdownAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: animatedOpacity.value,
      transform: [
        {
          scaleY: interpolate(animatedHeight.value, [0, 1], [0.8, 1]),
        },
        {
          scaleX: animatedScale.value,
        },
      ],
    };
  });

  const chevronAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${chevronRotation.value}deg`,
        },
      ],
    };
  });

  // Close dropdown when clicking outside
  const handleBackdropPress = useCallback(() => {
    closeDropdown();
  }, [closeDropdown]);

  // Render dropdown item
  const renderDropdownItem = useCallback(({ item }: { item: DropdownOption }) => {
    const isSelected = multiple 
      ? selectedValues.includes(item.value)
      : value === item.value;

    return (
      <TouchableOpacity
        style={[
          styles.dropdownItem,
          isSelected && styles.dropdownItemSelected,
          item.disabled && styles.dropdownItemDisabled,
        ]}
        onPress={() => !item.disabled && handleOptionSelect(item.value)}
        disabled={item.disabled}
        activeOpacity={0.7}
      >
        {item.icon && (
          <Ionicons
            name={item.icon as any}
            size={20}
            color={isSelected ? NepalColors.primaryWhite : NepalColors.onSurface}
            style={styles.itemIcon}
          />
        )}
        <Text
          style={[
            styles.dropdownItemText,
            isSelected && styles.dropdownItemTextSelected,
            item.disabled && styles.dropdownItemTextDisabled,
          ]}
        >
          {item.label}
        </Text>
        {multiple && isSelected && (
          <Ionicons
            name="checkmark"
            size={20}
            color={NepalColors.primaryWhite}
            style={styles.checkmark}
          />
        )}
      </TouchableOpacity>
    );
  }, [multiple, selectedValues, value, handleOptionSelect]);

  return (
    <View style={[styles.container, style]}>
      {/* Dropdown Trigger */}
      <TouchableOpacity
        ref={triggerRef}
        style={[
          styles.trigger,
          isOpen && styles.triggerOpen,
          disabled && styles.triggerDisabled,
        ]}
        onPress={isOpen ? closeDropdown : openDropdown}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.triggerText,
            !value && !multiple && styles.placeholderText,
            disabled && styles.triggerTextDisabled,
          ]}
          numberOfLines={1}
        >
          {getDisplayText()}
        </Text>
        <Animated.View style={chevronAnimatedStyle}>
          <Ionicons
            name="chevron-down"
            size={20}
            color={disabled ? NepalColors.outline : NepalColors.onSurface}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Dropdown Portal */}
      {isOpen && (
        <Portal>
          {/* Backdrop with blur effect */}
          <TouchableOpacity
            style={styles.backdrop}
            onPress={handleBackdropPress}
            activeOpacity={1}
          >
            <BlurView intensity={20} style={StyleSheet.absoluteFillObject} />
          </TouchableOpacity>

          {/* Dropdown Content */}
          <Animated.View
            style={[
              styles.dropdown,
              {
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
              },
              dropdownAnimatedStyle,
            ]}
          >
            {/* Search Input */}
            {searchable && (
              <View style={styles.searchContainer}>
                <Ionicons
                  name="search"
                  size={20}
                  color={NepalColors.onSurfaceVariant}
                  style={styles.searchIcon}
                />
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder="Search options..."
                  placeholderTextColor={NepalColors.onSurfaceVariant}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery('')}
                    style={styles.clearButton}
                  >
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={NepalColors.onSurfaceVariant}
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Options List */}
            <FlatList
              data={filteredOptions}
              renderItem={renderDropdownItem}
              keyExtractor={(item) => item.value}
              style={styles.optionsList}
              contentContainerStyle={styles.optionsContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
              // Performance optimizations
              removeClippedSubviews={Platform.OS === 'android'}
              maxToRenderPerBatch={10}
              windowSize={10}
              initialNumToRender={8}
              getItemLayout={(data, index) => ({
                length: 48,
                offset: 48 * index,
                index,
              })}
            />
          </Animated.View>
        </Portal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: NepalColors.surface,
    borderWidth: 1,
    borderColor: NepalColors.outline,
    borderRadius: commonStyles.borderRadius.medium,
    paddingHorizontal: commonStyles.padding.medium,
    paddingVertical: commonStyles.padding.small + 4,
    minHeight: 48,
    ...commonStyles.shadows.small,
  },
  triggerOpen: {
    borderColor: NepalColors.primaryCrimson,
    borderWidth: 2,
  },
  triggerDisabled: {
    backgroundColor: NepalColors.surfaceVariant,
    opacity: 0.6,
  },
  triggerText: {
    flex: 1,
    fontSize: 16,
    color: NepalColors.onSurface,
    fontFamily: 'Poppins-Regular',
  },
  placeholderText: {
    color: NepalColors.onSurfaceVariant,
  },
  triggerTextDisabled: {
    color: NepalColors.onSurfaceVariant,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: NepalColors.surface,
    borderRadius: commonStyles.borderRadius.medium,
    maxHeight: MAX_DROPDOWN_HEIGHT,
    zIndex: 1001,
    ...commonStyles.shadows.large,
    borderWidth: 1,
    borderColor: NepalColors.outline,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: commonStyles.padding.medium,
    paddingVertical: commonStyles.padding.small,
    borderBottomWidth: 1,
    borderBottomColor: NepalColors.outlineVariant,
    backgroundColor: NepalColors.surfaceVariant,
  },
  searchIcon: {
    marginRight: commonStyles.padding.small,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: NepalColors.onSurface,
    fontFamily: 'Poppins-Regular',
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  optionsList: {
    maxHeight: MAX_DROPDOWN_HEIGHT - 60,
  },
  optionsContent: {
    paddingVertical: commonStyles.padding.small,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: commonStyles.padding.medium,
    paddingVertical: commonStyles.padding.small + 4,
    minHeight: 48,
    backgroundColor: 'transparent',
  },
  dropdownItemSelected: {
    backgroundColor: NepalColors.primaryCrimson,
  },
  dropdownItemDisabled: {
    opacity: 0.5,
  },
  itemIcon: {
    marginRight: commonStyles.padding.small,
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 16,
    color: NepalColors.onSurface,
    fontFamily: 'Poppins-Regular',
  },
  dropdownItemTextSelected: {
    color: NepalColors.primaryWhite,
    fontFamily: 'Poppins-Medium',
  },
  dropdownItemTextDisabled: {
    color: NepalColors.onSurfaceVariant,
  },
  checkmark: {
    marginLeft: commonStyles.padding.small,
  },
});

export default AdvancedDropdown;

// =============== Predefined Dropdown Options ===============

export const SPORT_OPTIONS: DropdownOption[] = [
  { label: 'Futsal', value: 'futsal', icon: 'football' },
  { label: 'Football', value: 'football', icon: 'football' },
  { label: 'Basketball', value: 'basketball', icon: 'basketball' },
  { label: 'Cricket', value: 'cricket', icon: 'baseball' },
  { label: 'Volleyball', value: 'volleyball', icon: 'tennisball' },
  { label: 'Badminton', value: 'badminton', icon: 'tennisball' },
  { label: 'Table Tennis', value: 'table-tennis', icon: 'tennisball' },
  { label: 'Tennis', value: 'tennis', icon: 'tennisball' },
];

export const SKILL_LEVEL_OPTIONS: DropdownOption[] = [
  { label: 'Beginner', value: 'beginner', icon: 'star-outline' },
  { label: 'Intermediate', value: 'intermediate', icon: 'star-half' },
  { label: 'Advanced', value: 'advanced', icon: 'star' },
  { label: 'Professional', value: 'professional', icon: 'trophy' },
  { label: 'Any Level', value: 'any', icon: 'people' },
];

export const PAYMENT_METHOD_OPTIONS: DropdownOption[] = [
  { label: 'eSewa', value: 'esewa', icon: 'card' },
  { label: 'Khalti', value: 'khalti', icon: 'card' },
  { label: 'Credit/Debit Card', value: 'stripe', icon: 'card' },
  { label: 'PayPal', value: 'paypal', icon: 'logo-paypal' },
];

export const TIME_SLOT_OPTIONS: DropdownOption[] = [
  { label: 'Early Morning (6-9 AM)', value: 'early-morning', icon: 'sunny' },
  { label: 'Morning (9-12 PM)', value: 'morning', icon: 'partly-sunny' },
  { label: 'Afternoon (12-5 PM)', value: 'afternoon', icon: 'sunny' },
  { label: 'Evening (5-8 PM)', value: 'evening', icon: 'sunset' },
  { label: 'Night (8-11 PM)', value: 'night', icon: 'moon' },
];

export const RADIUS_OPTIONS: DropdownOption[] = [
  { label: '1 km', value: '1', icon: 'location' },
  { label: '3 km', value: '3', icon: 'location' },
  { label: '5 km', value: '5', icon: 'location' },
  { label: '10 km', value: '10', icon: 'location' },
  { label: '20 km', value: '20', icon: 'location' },
  { label: 'No limit', value: '999', icon: 'globe' },
];

// =============== Hook for Dropdown Management ===============
export const useAdvancedDropdown = () => {
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = useCallback((value: string) => {
    setSelectedValue(value);
    setIsOpen(false);
  }, []);

  const reset = useCallback(() => {
    setSelectedValue('');
    setIsOpen(false);
  }, []);

  return {
    selectedValue,
    isOpen,
    setIsOpen,
    handleSelect,
    reset,
  };
};