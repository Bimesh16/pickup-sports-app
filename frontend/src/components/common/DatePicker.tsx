import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NepalColors, FontSizes, Spacing } from '../../constants/theme';
import { useLanguage } from '../../contexts/LanguageContext';

interface DatePickerProps {
  value?: Date;
  onDateChange: (date: Date) => void;
  placeholder?: string;
  minimumAge?: number;
  maximumAge?: number;
}

export default function DatePicker({
  value,
  onDateChange,
  placeholder,
  minimumAge = 12,
  maximumAge = 100,
}: DatePickerProps) {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [selectedYear, setSelectedYear] = useState(value?.getFullYear() || new Date().getFullYear() - 20);
  const [selectedMonth, setSelectedMonth] = useState(value?.getMonth() || 0);
  const [selectedDay, setSelectedDay] = useState(value?.getDate() || 1);

  const currentYear = new Date().getFullYear();
  const minYear = currentYear - maximumAge;
  const maxYear = currentYear - minimumAge;

  // Generate years from newest to oldest (descending order) for better UX
  // This will show years from 2012 to 1924 (for 2024 current year, 12-100 age range)
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const days = Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1);

  const handleConfirm = () => {
    const newDate = new Date(selectedYear, selectedMonth, selectedDay);
    onDateChange(newDate);
    setIsVisible(false);
  };

  const getAge = (birthDate: Date) => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const formatDate = (date: Date) => {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  return (
    <View>
      <TouchableOpacity style={styles.dateInput} onPress={() => setIsVisible(true)}>
        <Ionicons name="calendar-outline" size={20} color={NepalColors.primary} style={styles.icon} />
        <Text style={[styles.dateText, !value && styles.placeholder]}>
          {value ? `${formatDate(value)} (Age: ${getAge(value)})` : (placeholder || t('register.agePlaceholder'))}
        </Text>
        <Ionicons name="chevron-down" size={20} color={NepalColors.textSecondary} />
      </TouchableOpacity>

      <Modal visible={isVisible} transparent animationType="slide">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalContent} 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setIsVisible(false)}>
                <Text style={styles.cancelButton}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{t('register.agePlaceholder')}</Text>
              <TouchableOpacity onPress={handleConfirm}>
                <Text style={styles.confirmButton}>{t('common.ok')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pickerContainer}>
              <View style={styles.pickerColumn}>
                <Text style={styles.columnHeader}>{t('datePicker.day')}</Text>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                  {days.map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[styles.pickerItem, selectedDay === day && styles.selectedItem]}
                      onPress={() => setSelectedDay(day)}
                    >
                      <Text style={[styles.pickerText, selectedDay === day && styles.selectedText]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.columnHeader}>{t('datePicker.month')}</Text>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                  {months.map((month, index) => (
                    <TouchableOpacity
                      key={month}
                      style={[styles.pickerItem, selectedMonth === index && styles.selectedItem]}
                      onPress={() => setSelectedMonth(index)}
                    >
                      <Text style={[styles.pickerText, selectedMonth === index && styles.selectedText]}>
                        {month}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.columnHeader}>{t('datePicker.year')}</Text>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                  {years.map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[styles.pickerItem, selectedYear === year && styles.selectedItem]}
                      onPress={() => setSelectedYear(year)}
                    >
                      <Text style={[styles.pickerText, selectedYear === year && styles.selectedText]}>
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  icon: {
    marginRight: Spacing.sm,
  },
  dateText: {
    flex: 1,
    color: 'white',
    fontSize: FontSizes.base,
  },
  placeholder: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: NepalColors.primary,
  },
  cancelButton: {
    fontSize: FontSizes.base,
    color: NepalColors.textSecondary,
  },
  confirmButton: {
    fontSize: FontSizes.base,
    color: NepalColors.primary,
    fontWeight: '600',
  },
  pickerContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: Spacing.xs,
  },
  columnHeader: {
    textAlign: 'center',
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: NepalColors.primary,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: Spacing.sm,
  },
  scrollView: {
    maxHeight: 200,
  },
  pickerItem: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedItem: {
    backgroundColor: NepalColors.primary,
  },
  pickerText: {
    textAlign: 'center',
    fontSize: FontSizes.base,
    color: NepalColors.text,
  },
  selectedText: {
    color: 'white',
    fontWeight: '600',
  },
});

