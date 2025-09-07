import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { theme, locale, isDark, toggleTheme, adaptiveMode, setAdaptiveMode, setLocale } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        
        {/* Theme Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {locale === 'nepal' ? 'थिम सेटिङ्गहरू' : 'Theme Settings'}
          </Text>
          
          <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon-outline" size={20} color={theme.colors.text} />
              <Text style={[styles.settingText, { color: theme.colors.text }]}>
                {locale === 'nepal' ? 'डार्क मोड' : 'Dark Mode'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: theme.colors.primary }}
              thumbColor={isDark ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="contrast-outline" size={20} color={theme.colors.text} />
              <Text style={[styles.settingText, { color: theme.colors.text }]}>
                {locale === 'nepal' ? 'अनुकूलन मोड' : 'Adaptive Mode'}
              </Text>
            </View>
            <Switch
              value={adaptiveMode}
              onValueChange={setAdaptiveMode}
              trackColor={{ false: '#767577', true: theme.colors.primary }}
              thumbColor={adaptiveMode ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Language Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {locale === 'nepal' ? 'भाषा सेटिङ्गहरू' : 'Language Settings'}
          </Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, { backgroundColor: theme.colors.card }]}
            onPress={() => setLocale(locale === 'nepal' ? 'global' : 'nepal')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="language-outline" size={20} color={theme.colors.text} />
              <Text style={[styles.settingText, { color: theme.colors.text }]}>
                {locale === 'nepal' ? 'भाषा' : 'Language'}
              </Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
                {locale === 'nepal' ? '🇳🇵 नेपाली' : '🌍 English'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {locale === 'nepal' ? 'एप सेटिङ्गहरू' : 'App Settings'}
          </Text>
          
          <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={20} color={theme.colors.text} />
              <Text style={[styles.settingText, { color: theme.colors.text }]}>
                {locale === 'nepal' ? 'सूचनाहरू' : 'Notifications'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="shield-outline" size={20} color={theme.colors.text} />
              <Text style={[styles.settingText, { color: theme.colors.text }]}>
                {locale === 'nepal' ? 'गोपनीयता' : 'Privacy'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="help-circle-outline" size={20} color={theme.colors.text} />
              <Text style={[styles.settingText, { color: theme.colors.text }]}>
                {locale === 'nepal' ? 'सहायता' : 'Help & Support'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
  },
});

export default SettingsScreen;