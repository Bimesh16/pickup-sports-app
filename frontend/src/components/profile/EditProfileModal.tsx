import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { colors, typography, spacing } from '../../constants/theme';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  gender?: string;
  nationality?: string;
  birthDate?: string;
  country?: string;
  bio?: string;
}

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  user: User | null;
  onAvatarChanged?: (url: string) => void;
}

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const NATIONALITIES = [
  'Nepali', 'Indian', 'American', 'British', 'Canadian', 'Australian',
  'German', 'French', 'Italian', 'Spanish', 'Japanese', 'Chinese',
  'Korean', 'Brazilian', 'Argentinian', 'Mexican', 'Other'
];
const COUNTRIES = [
  'Nepal', 'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Italy', 'Spain', 'Japan', 'China',
  'South Korea', 'Brazil', 'Argentina', 'Mexico', 'Other'
];

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  onSave,
  user,
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<User>({
    id: '',
    name: '',
    username: '',
    email: '',
    phone: '',
    gender: '',
    nationality: '',
    birthDate: '',
    country: '',
    bio: '',
  });

  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id || '',
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
        nationality: user.nationality || '',
        birthDate: user.birthDate || '',
        country: user.country || '',
        bio: user.bio || '',
      });
    }
  }, [user, visible]);

  const handleInputChange = (field: keyof User, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDropdownToggle = (field: string) => {
    setShowDropdown(showDropdown === field ? null : field);
  };

  const closeAllDropdowns = () => {
    setShowDropdown(null);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.username.trim() || !formData.email.trim()) {
      Alert.alert('Incomplete Information', 'Please fill in all required fields.');
      return;
    }

    onSave(formData);
    Alert.alert('Success', 'Profile updated successfully!');
    onClose();
  };

  const pickAndUploadAvatar = async () => {
    try {
      // Mock avatar upload for now
      setUploading(true);
      const mockAvatar = 'https://via.placeholder.com/150x150/003893/FFFFFF?text=Avatar';
      setUploading(false);
      if (onAvatarChanged) onAvatarChanged(mockAvatar);
      Alert.alert(t('common.success'), t('toast.avatarUpdated'));
    } catch (e) {
      setUploading(false);
      Alert.alert('Not Available', 'Please install expo-image-picker to enable avatar upload.');
    }
  };

  const renderTextInput = (
    field: keyof User,
    placeholder: string,
    value: string,
    multiline = false,
    required = false
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>
        {placeholder} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[styles.textInput, multiline && styles.textInputMultiline]}
        placeholder={placeholder}
        value={value}
        onChangeText={(text) => handleInputChange(field, text)}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );

  const renderDropdown = (
    field: keyof User,
    label: string,
    options: string[],
    value: string,
    required = false
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => handleDropdownToggle(field)}
      >
        <Text style={[styles.dropdownText, !value && styles.placeholderText]}>
          {value || `Select ${label.toLowerCase()}`}
        </Text>
        <Ionicons
          name={showDropdown === field ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.text}
        />
      </TouchableOpacity>
      {showDropdown === field && (
        <View style={styles.dropdownOptions}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.dropdownOption}
              onPress={() => {
                handleInputChange(field, option);
                closeAllDropdowns();
              }}
            >
              <Text style={styles.dropdownOptionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={uploading}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.section, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
            <Text style={styles.sectionTitle}>Profile Photo</Text>
            <TouchableOpacity onPress={pickAndUploadAvatar} style={[styles.saveButton, { paddingVertical: 6 }]} disabled={uploading}>
              <Text style={styles.saveButtonText}>{uploading ? 'Uploading...' : 'Change Photo'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            {renderTextInput('name', 'Full Name', formData.name, false, true)}
            {renderTextInput('username', 'Username', formData.username, false, true)}
            {renderTextInput('email', 'Email', formData.email, false, true)}
            {renderTextInput('phone', 'Phone Number', formData.phone || '')}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            
            {renderDropdown('gender', 'Gender', GENDERS, formData.gender || '')}
            {renderDropdown('nationality', 'Nationality', NATIONALITIES, formData.nationality || '')}
            {renderDropdown('country', 'Country', COUNTRIES, formData.country || '')}
            {renderTextInput('birthDate', 'Birth Date (YYYY-MM-DD)', formData.birthDate || '')}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About You</Text>
            
            {renderTextInput('bio', 'Bio', formData.bio || '', true)}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: typography.fontSize.md,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  textInputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.surface,
  },
  dropdownText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  placeholderText: {
    color: colors.textSecondary,
  },
  dropdownOptions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginTop: 4,
    zIndex: 1000,
    maxHeight: 200,
  },
  dropdownOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownOptionText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
});

export default EditProfileModal;
