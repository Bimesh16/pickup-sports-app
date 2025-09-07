import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, borderRadius, spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');

// Simplified Nepali calendar data (in a real app, you'd use a proper Nepali calendar library)
const nepaliMonths = [
  'बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज',
  'कार्तिक', 'मंसिर', 'पुस', 'माघ', 'फागुन', 'चैत'
];

const nepaliDays = [
  'आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहिबार', 'शुक्रबार', 'शनिबार'
];

const nepaliNumbers = [
  '०', '१', '२', '३', '४', '५', '६', '७', '८', '९'
];

interface NepaliCalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  showGregorian?: boolean;
  style?: any;
}

export const NepaliCalendar: React.FC<NepaliCalendarProps> = ({
  selectedDate = new Date(),
  onDateSelect,
  showGregorian = true,
  style,
}) => {
  const [currentDate, setCurrentDate] = useState(selectedDate);
  const [nepaliDate, setNepaliDate] = useState({ year: 2080, month: 0, day: 1 });

  // Convert Gregorian to Nepali date (simplified conversion)
  const convertToNepali = (gregorianDate: Date) => {
    // This is a simplified conversion - in a real app, you'd use proper algorithms
    const year = gregorianDate.getFullYear();
    const month = gregorianDate.getMonth();
    const day = gregorianDate.getDate();
    
    // Approximate conversion (2080 BS = 2023 AD)
    const nepaliYear = year - 2023 + 2080;
    const nepaliMonth = month;
    const nepaliDay = day;
    
    return { year: nepaliYear, month: nepaliMonth, day: nepaliDay };
  };

  // Convert Nepali numbers to Devanagari
  const toNepaliNumber = (num: number): string => {
    return num.toString().split('').map(digit => nepaliNumbers[parseInt(digit)]).join('');
  };

  useEffect(() => {
    const nepali = convertToNepali(currentDate);
    setNepaliDate(nepali);
  }, [currentDate]);

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(day);
    setCurrentDate(newDate);
    onDateSelect?.(newDate);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.twilightPurple]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
          <Text style={styles.navText}>‹</Text>
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.nepaliMonth}>
            {nepaliMonths[nepaliDate.month]} {toNepaliNumber(nepaliDate.year)}
          </Text>
          {showGregorian && (
            <Text style={styles.gregorianMonth}>
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
          )}
        </View>
        
        <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
          <Text style={styles.navText}>›</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Days of week */}
      <View style={styles.daysHeader}>
        {nepaliDays.map((day, index) => (
          <View key={index} style={styles.dayHeader}>
            <Text style={styles.dayHeaderText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {/* Empty cells for days before month starts */}
        {Array.from({ length: firstDay }, (_, i) => (
          <View key={`empty-${i}`} style={styles.dayCell} />
        ))}
        
        {/* Days of the month */}
        {days.map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayCell,
              day === currentDate.getDate() && styles.selectedDay,
            ]}
            onPress={() => handleDateSelect(day)}
          >
            <Text style={[
              styles.dayText,
              day === currentDate.getDate() && styles.selectedDayText,
            ]}>
              {toNepaliNumber(day)}
            </Text>
            {showGregorian && (
              <Text style={[
                styles.gregorianDayText,
                day === currentDate.getDate() && styles.selectedGregorianDayText,
              ]}>
                {day}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...colors.shadows?.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    color: colors.textLight,
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
  },
  headerContent: {
    alignItems: 'center',
  },
  nepaliMonth: {
    color: colors.textLight,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
  },
  gregorianMonth: {
    color: colors.textLight,
    fontSize: typography.fontSize.sm,
    opacity: 0.8,
  },
  daysHeader: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceVariant,
    paddingVertical: spacing.sm,
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
  },
  dayHeaderText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.medium,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.sm,
  },
  dayCell: {
    width: (width - spacing.md * 2 - spacing.sm * 2) / 7,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  selectedDay: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  dayText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    fontFamily: typography.fontFamily.medium,
  },
  selectedDayText: {
    color: colors.textLight,
    fontFamily: typography.fontFamily.bold,
  },
  gregorianDayText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  selectedGregorianDayText: {
    color: colors.textLight,
  },
});
