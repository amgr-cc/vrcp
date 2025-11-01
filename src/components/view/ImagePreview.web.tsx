import React, { useState } from "react";
import { Modal, View, Dimensions, StyleSheet, Pressable } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import ImageModal from "react-native-image-modal";

interface Props {
  imageUrls: string[];
  initialIdx?: number;
  open: boolean;
  onClose: () => void;
}

const { width, height } = Dimensions.get("window");

const ImagePreview = ({ imageUrls, initialIdx = 0, open, onClose }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(initialIdx);

  return (
    <Modal visible={open} transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Close Area */}
        <Pressable style={styles.closeArea} onPress={onClose} />

        {/* Carousel */}
        <View style={styles.carouselContainer}>
          <Carousel
            loop={false}
            width={width * 0.9}
            height={height * 0.7}
            data={imageUrls}
            scrollAnimationDuration={250}
            onSnapToItem={(index) => setCurrentIndex(index)}
            renderItem={({ item }) => (
              <ImageModal
                key={item}
                source={{ uri: item }}
                style={{
                  width: width * 0.9,
                  height: height * 0.7,
                  borderRadius: 8,
                }}
                resizeMode="contain"
                modalImageResizeMode="contain"
                overlayBackgroundColor="rgba(0,0,0,0.95)"
              />
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeArea: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  carouselContainer: {
    zIndex: 1,
  },
});

export default ImagePreview;
