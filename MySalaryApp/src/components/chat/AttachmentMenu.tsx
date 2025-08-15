import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { PhotoIcon } from '../icons/PhotoIcon';
import { DocumentIcon } from '../icons/DocumentIcon';

interface AttachmentMenuProps {
  visible: boolean;
  onClose: () => void;
  onPhotoPress: () => void;
  onDocumentPress: () => void;
  position?: { top: number; left: number };
}

export const AttachmentMenu: React.FC<AttachmentMenuProps> = ({
  visible,
  onClose,
  onPhotoPress,
  onDocumentPress,
  position = { top: 567, left: 12 }
}) => {
  const handlePhotoPress = () => {
    onPhotoPress();
    onClose();
  };

  const handleDocumentPress = () => {
    onDocumentPress();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={[styles.menu, { top: position.top, left: position.left }]}>
          <TouchableOpacity style={styles.menuItem} onPress={handlePhotoPress}>
            <PhotoIcon width={20} height={20} color="#252233" />
            <Text style={styles.menuText}>Photo or video</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleDocumentPress}>
            <DocumentIcon width={20} height={20} color="#252233" />
            <Text style={styles.menuText}>Document</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menu: {
    position: 'absolute',
    width: 158,
    height: 88,
    borderRadius: 12,
    padding: 16,
    gap: 16,
    backgroundColor: '#FDFDFE',
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuText: {
    fontFamily: 'Commissioner',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 16,
    color: '#252233',
  },
});