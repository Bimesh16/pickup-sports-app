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
        // Try to use MediaDevices API first for better camera access
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            return await capturePhotoWithCamera();
          } catch (cameraError) {
            console.log('Camera API not available, falling back to file input:', cameraError);
            return createWebFileInput('camera');
          }
        } else {
          return createWebFileInput('camera');
        }
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

  const capturePhotoWithCamera = (): Promise<ImagePickerResult | null> => {
    return new Promise((resolve) => {
      console.log('ImagePickerComponent: Capturing photo with camera API');
      
      // Create a video element to capture the camera stream
      const video = document.createElement('video');
      video.style.display = 'none';
      document.body.appendChild(video);
      
      // Create a canvas to capture the photo
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      }).then((stream) => {
        video.srcObject = stream;
        video.play();
        
        // Create a modal to show camera preview
        const modal = document.createElement('div');
        modal.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        `;
        
        const preview = document.createElement('video');
        preview.srcObject = stream;
        preview.style.cssText = `
          width: 90%;
          max-width: 500px;
          height: auto;
          border-radius: 8px;
        `;
        preview.autoplay = true;
        preview.muted = true;
        
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
          margin-top: 20px;
          display: flex;
          gap: 20px;
        `;
        
        const captureButton = document.createElement('button');
        captureButton.textContent = 'Capture Photo';
        captureButton.style.cssText = `
          padding: 12px 24px;
          background: #22D3EE;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
        `;
        
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.style.cssText = `
          padding: 12px 24px;
          background: #6B7280;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
        `;
        
        captureButton.onclick = () => {
          // Set canvas dimensions to match video
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // Draw the current video frame to canvas
          context?.drawImage(video, 0, 0);
          
          // Convert to blob
          canvas.toBlob((blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onload = (e: any) => {
                resolve({
                  uri: e.target.result,
                  width: canvas.width,
                  height: canvas.height,
                  type: blob.type,
                  fileName: `camera_photo_${Date.now()}.jpg`,
                  fileSize: blob.size,
                });
              };
              reader.readAsDataURL(blob);
            } else {
              resolve(null);
            }
            
            // Cleanup
            stream.getTracks().forEach(track => track.stop());
            document.body.removeChild(modal);
            document.body.removeChild(video);
          }, 'image/jpeg', 0.8);
        };
        
        cancelButton.onclick = () => {
          stream.getTracks().forEach(track => track.stop());
          document.body.removeChild(modal);
          document.body.removeChild(video);
          resolve(null);
        };
        
        buttonContainer.appendChild(captureButton);
        buttonContainer.appendChild(cancelButton);
        modal.appendChild(preview);
        modal.appendChild(buttonContainer);
        document.body.appendChild(modal);
        
      }).catch((error) => {
        console.error('Error accessing camera:', error);
        document.body.removeChild(video);
        resolve(null);
      });
    });
  };

  const createWebFileInput = (type: 'camera' | 'gallery'): Promise<ImagePickerResult | null> => {
    return new Promise((resolve) => {
      console.log('ImagePickerComponent: Creating web file input for', type);
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      if (type === 'camera') {
        // Try to force camera access on mobile devices
        input.capture = 'environment'; // Use back camera
        input.setAttribute('capture', 'environment');
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
      
      console.log('ImagePickerComponent: Clicking file input for', type);
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
    console.log('useImagePicker: Modal should be visible now');
  };

  const handleClose = () => {
    console.log('useImagePicker: Modal closed');
    setShowModal(false);
  };

  const handleCameraPress = async () => {
    console.log('useImagePicker: Camera selected - calling launchCamera');
    setShowModal(false);
    const result = await launchCamera(options);
    console.log('useImagePicker: Camera result:', result);
    if (onImageSelected) {
      onImageSelected(result);
    }
  };

  const handleGalleryPress = async () => {
    console.log('useImagePicker: Gallery selected - calling launchImageLibrary');
    setShowModal(false);
    const result = await launchImageLibrary(options);
    console.log('useImagePicker: Gallery result:', result);
    if (onImageSelected) {
      onImageSelected(result);
    }
  };

  const launchCamera = async (options: ImagePickerOptions): Promise<ImagePickerResult | null> => {
    try {
      if (Platform.OS === 'web') {
        // Try to use MediaDevices API first for better camera access
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            console.log('useImagePicker: Using camera API');
            return await capturePhotoWithCamera();
          } catch (cameraError) {
            console.log('Camera API not available, falling back to file input:', cameraError);
            return createWebFileInput('camera');
          }
        } else {
          console.log('useImagePicker: MediaDevices not available, using file input');
          return createWebFileInput('camera');
        }
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
        console.log('useImagePicker: Using gallery file input');
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
        // Try to force camera access on mobile devices
        console.log('useImagePicker: Setting camera capture attributes');
        input.capture = 'environment'; // Use back camera
        input.setAttribute('capture', 'environment');
      } else {
        console.log('useImagePicker: Setting gallery file input (no capture)');
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
      
      console.log('useImagePicker: Clicking file input for', type);
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
