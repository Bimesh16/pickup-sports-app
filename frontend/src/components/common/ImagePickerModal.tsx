import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onCameraPress: () => void;
  onGalleryPress: () => void;
}

const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  visible,
  onClose,
  onCameraPress,
  onGalleryPress
}) => {
  if (Platform.OS !== 'web') {
    // For native, we can use Alert.alert
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Photo</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.subtitle}>Choose how you want to select your photo</Text>
          
          <View style={styles.options}>
            <TouchableOpacity style={styles.option} onPress={onCameraPress}>
              <View style={styles.optionIcon}>
                <Ionicons name="camera" size={32} color="#22D3EE" />
              </View>
              <Text style={styles.optionText}>Camera</Text>
              <Text style={styles.optionSubtext}>Take a new photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.option} onPress={onGalleryPress}>
              <View style={styles.optionIcon}>
                <Ionicons name="images" size={32} color="#22D3EE" />
              </View>
              <Text style={styles.optionText}>Photo Library</Text>
              <Text style={styles.optionSubtext}>Choose from gallery</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 24,
    textAlign: 'center',
  },
  options: {
    gap: 16,
    marginBottom: 24,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#374151',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F9FAFB',
    flex: 1,
  },
  optionSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 12,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9CA3AF',
  },
});

export default ImagePickerModal;
