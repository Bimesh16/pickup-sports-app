import React from 'react';
import { Alert, Platform } from 'react-native';

interface ImagePickerOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  mediaTypes?: 'Images' | 'Videos' | 'All';
}

interface ImagePickerResult {
  uri: string;
  width: number;
  height: number;
  type?: string;
  fileName?: string;
  fileSize?: number;
}

class ImagePickerService {
  static async requestPermissions(): Promise<boolean> {
    try {
      // For web, we'll use a simple file input approach
      if (Platform.OS === 'web') {
        return true;
      }

      // For native, we'll need to implement proper permissions
      // This is a simplified version - in a real app you'd use expo-image-picker
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  static async showImagePicker(
    options: ImagePickerOptions = {}
  ): Promise<ImagePickerResult | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Please grant permission to access your photos and camera');
        return null;
      }

      return new Promise((resolve) => {
        Alert.alert(
          'Select Photo',
          'Choose how you want to select your photo',
          [
            {
              text: 'Camera',
              onPress: () => this.launchCamera(options).then(resolve),
            },
            {
              text: 'Photo Library',
              onPress: () => this.launchImageLibrary(options).then(resolve),
            },
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => resolve(null),
            },
          ]
        );
      });
    } catch (error) {
      console.error('Error showing image picker:', error);
      Alert.alert('Error', 'Failed to open image picker');
      return null;
    }
  }

  private static async launchCamera(options: ImagePickerOptions): Promise<ImagePickerResult | null> {
    try {
      if (Platform.OS === 'web') {
        // For web, we'll create a file input for camera
        return this.createWebFileInput('camera');
      }

      // For native, this would use expo-image-picker
      // For now, we'll return a mock result
      return {
        uri: 'https://via.placeholder.com/300x300/4A5568/FFFFFF?text=Camera+Photo',
        width: 300,
        height: 300,
        type: 'image/jpeg',
        fileName: 'camera_photo.jpg',
        fileSize: 50000,
      };
    } catch (error) {
      console.error('Error launching camera:', error);
      return null;
    }
  }

  private static async launchImageLibrary(options: ImagePickerOptions): Promise<ImagePickerResult | null> {
    try {
      if (Platform.OS === 'web') {
        // For web, we'll create a file input for gallery
        return this.createWebFileInput('gallery');
      }

      // For native, this would use expo-image-picker
      // For now, we'll return a mock result
      return {
        uri: 'https://via.placeholder.com/300x300/4A5568/FFFFFF?text=Gallery+Photo',
        width: 300,
        height: 300,
        type: 'image/jpeg',
        fileName: 'gallery_photo.jpg',
        fileSize: 50000,
      };
    } catch (error) {
      console.error('Error launching image library:', error);
      return null;
    }
  }

  private static createWebFileInput(type: 'camera' | 'gallery'): Promise<ImagePickerResult | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      if (type === 'camera') {
        input.capture = 'camera';
      }

      input.onchange = (event: any) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            resolve({
              uri: e.target.result,
              width: 300,
              height: 300,
              type: file.type,
              fileName: file.name,
              fileSize: file.size,
            });
          };
          reader.readAsDataURL(file);
        } else {
          resolve(null);
        }
      };

      input.oncancel = () => resolve(null);
      input.click();
    });
  }
}

export default ImagePickerService;
