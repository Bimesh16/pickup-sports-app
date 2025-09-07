import React, { useState } from 'react';
import { Platform } from 'react-native';
import ImagePickerModal from './ImagePickerModal';

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

interface ImagePickerComponentProps {
  onImageSelected: (result: ImagePickerResult | null) => void;
  options?: ImagePickerOptions;
}

const ImagePickerComponent: React.FC<ImagePickerComponentProps> = ({
  onImageSelected,
  options = {}
}) => {
  const [showModal, setShowModal] = useState(false);

  const showImagePicker = () => {
    console.log('ImagePickerComponent: showImagePicker called');
    setShowModal(true);
  };

  const handleClose = () => {
    console.log('ImagePickerComponent: Modal closed');
    setShowModal(false);
  };

  const handleCameraPress = async () => {
    console.log('ImagePickerComponent: Camera selected');
    setShowModal(false);
    const result = await launchCamera(options);
    onImageSelected(result);
  };

  const handleGalleryPress = async () => {
    console.log('ImagePickerComponent: Gallery selected');
    setShowModal(false);
    const result = await launchImageLibrary(options);
    onImageSelected(result);
  };

  const launchCamera = async (options: ImagePickerOptions): Promise<ImagePickerResult | null> => {
    try {
      if (Platform.OS === 'web') {
        return createWebFileInput('camera');
      }

      // For native, this would use expo-image-picker
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
  };

  const launchImageLibrary = async (options: ImagePickerOptions): Promise<ImagePickerResult | null> => {
    try {
      if (Platform.OS === 'web') {
        return createWebFileInput('gallery');
      }

      // For native, this would use expo-image-picker
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
  };

  const createWebFileInput = (type: 'camera' | 'gallery'): Promise<ImagePickerResult | null> => {
    return new Promise((resolve) => {
      console.log('ImagePickerComponent: Creating web file input for', type);
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      if (type === 'camera') {
        input.capture = 'camera';
      }

      input.onchange = (event: any) => {
        console.log('ImagePickerComponent: File input changed');
        const file = event.target.files[0];
        if (file) {
          console.log('ImagePickerComponent: File selected:', file.name, file.type, file.size);
          const reader = new FileReader();
          reader.onload = (e: any) => {
            console.log('ImagePickerComponent: File read successfully');
            resolve({
              uri: e.target.result,
              width: 300,
              height: 300,
              type: file.type,
              fileName: file.name,
              fileSize: file.size,
            });
          };
          reader.onerror = (error) => {
            console.error('ImagePickerComponent: Error reading file:', error);
            resolve(null);
          };
          reader.readAsDataURL(file);
        } else {
          console.log('ImagePickerComponent: No file selected');
          resolve(null);
        }
      };

      input.oncancel = () => {
        console.log('ImagePickerComponent: File input cancelled');
        resolve(null);
      };
      
      console.log('ImagePickerComponent: Clicking file input');
      input.click();
    });
  };

  return (
    <>
      <ImagePickerModal
        visible={showModal}
        onClose={handleClose}
        onCameraPress={handleCameraPress}
        onGalleryPress={handleGalleryPress}
      />
      {/* This component doesn't render anything visible, it just provides the functionality */}
    </>
  );
};

// Export a hook to use the image picker
export const useImagePicker = () => {
  const [showModal, setShowModal] = useState(false);
  const [onImageSelected, setOnImageSelected] = useState<((result: ImagePickerResult | null) => void) | null>(null);
  const [options, setOptions] = useState<ImagePickerOptions>({});

  const showImagePicker = (callback: (result: ImagePickerResult | null) => void, pickerOptions: ImagePickerOptions = {}) => {
    console.log('useImagePicker: showImagePicker called');
    setOnImageSelected(() => callback);
    setOptions(pickerOptions);
    setShowModal(true);
  };

  const handleClose = () => {
    console.log('useImagePicker: Modal closed');
    setShowModal(false);
  };

  const handleCameraPress = async () => {
    console.log('useImagePicker: Camera selected');
    setShowModal(false);
    const result = await launchCamera(options);
    if (onImageSelected) {
      onImageSelected(result);
    }
  };

  const handleGalleryPress = async () => {
    console.log('useImagePicker: Gallery selected');
    setShowModal(false);
    const result = await launchImageLibrary(options);
    if (onImageSelected) {
      onImageSelected(result);
    }
  };

  const launchCamera = async (options: ImagePickerOptions): Promise<ImagePickerResult | null> => {
    try {
      if (Platform.OS === 'web') {
        return createWebFileInput('camera');
      }

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
  };

  const launchImageLibrary = async (options: ImagePickerOptions): Promise<ImagePickerResult | null> => {
    try {
      if (Platform.OS === 'web') {
        return createWebFileInput('gallery');
      }

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
  };

  const createWebFileInput = (type: 'camera' | 'gallery'): Promise<ImagePickerResult | null> => {
    return new Promise((resolve) => {
      console.log('useImagePicker: Creating web file input for', type);
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      if (type === 'camera') {
        input.capture = 'camera';
      }

      input.onchange = (event: any) => {
        console.log('useImagePicker: File input changed');
        const file = event.target.files[0];
        if (file) {
          console.log('useImagePicker: File selected:', file.name, file.type, file.size);
          const reader = new FileReader();
          reader.onload = (e: any) => {
            console.log('useImagePicker: File read successfully');
            resolve({
              uri: e.target.result,
              width: 300,
              height: 300,
              type: file.type,
              fileName: file.name,
              fileSize: file.size,
            });
          };
          reader.onerror = (error) => {
            console.error('useImagePicker: Error reading file:', error);
            resolve(null);
          };
          reader.readAsDataURL(file);
        } else {
          console.log('useImagePicker: No file selected');
          resolve(null);
        }
      };

      input.oncancel = () => {
        console.log('useImagePicker: File input cancelled');
        resolve(null);
      };
      
      console.log('useImagePicker: Clicking file input');
      input.click();
    });
  };

  return {
    showImagePicker,
    ImagePickerModal: () => (
      <ImagePickerModal
        visible={showModal}
        onClose={handleClose}
        onCameraPress={handleCameraPress}
        onGalleryPress={handleGalleryPress}
      />
    )
  };
};

export default ImagePickerComponent;
