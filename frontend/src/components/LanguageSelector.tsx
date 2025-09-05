import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { colors, typography, spacing } from '../constants/theme';

const { width } = Dimensions.get('window');

const SUPPORTED_LANGUAGES = {
  en: {
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
  ne: {
    name: 'Nepali',
    nativeName: 'नेपाली',
    flag: '🇳🇵',
  },
};

type Language = keyof typeof SUPPORTED_LANGUAGES;

interface LanguageSelectorProps {
  style?: any;
  showLabel?: boolean;
}

export default function LanguageSelector({ style, showLabel = true }: LanguageSelectorProps) {
  const { lang, setLanguage, t } = useLanguage();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleLanguageSelect = async (languageCode: Language) => {
    try {
      await setLanguage(languageCode);
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error setting language:', error);
    }
  };

  const currentLanguage = SUPPORTED_LANGUAGES[lang];

  const renderLanguageItem = ({ item }: { item: [string, typeof SUPPORTED_LANGUAGES[Language]] }) => {
    const [code, langData] = item;
    const isSelected = code === lang;

    return (
      <TouchableOpacity
        style={[
          styles.languageItem,
          isSelected && styles.selectedLanguageItem,
        ]}
        onPress={() => handleLanguageSelect(code as Language)}
      >
        <View style={styles.languageItemContent}>
          <Text style={styles.flag}>{langData.flag}</Text>
          <View style={styles.languageTextContainer}>
            <Text style={[
              styles.languageName,
              isSelected && styles.selectedLanguageName,
            ]}>
              {langData.name}
            </Text>
            <Text style={[
              styles.nativeName,
              isSelected && styles.selectedNativeName,
            ]}>
              {langData.nativeName}
            </Text>
          </View>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const languageEntries = Object.entries(SUPPORTED_LANGUAGES);

  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <Text style={styles.label}>{t('settings.language')}</Text>
      )}
      
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setIsModalVisible(true)}
      >
        <View style={styles.selectorContent}>
          <Text style={styles.flag}>{currentLanguage.flag}</Text>
          <View style={styles.selectorTextContainer}>
            <Text style={styles.selectorLanguageName}>{currentLanguage.name}</Text>
            <Text style={styles.selectorNativeName}>{currentLanguage.nativeName}</Text>
          </View>
          <Ionicons name="chevron-down" size={20} color={colors.text} />
        </View>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('settings.language')}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={languageEntries}
            keyExtractor={([code]) => code}
            renderItem={renderLanguageItem}
            style={styles.languageList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  selectorButton: {
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  selectorTextContainer: {
    flex: 1,
  },
  selectorLanguageName: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  selectorNativeName: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: spacing.sm,
  },
  languageList: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  languageItem: {
    backgroundColor: colors.background,
    borderRadius: 8,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedLanguageItem: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  languageItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  languageTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  languageName: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  selectedLanguageName: {
    color: '#fff',
  },
  nativeName: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  selectedNativeName: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
});