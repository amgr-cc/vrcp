import { downloadImageToCache } from "@/contexts/CacheContext";
import { useEffect, useRef, useState } from "react";
import EnhancedImageViewing from "react-native-image-viewing";

interface Props {
  imageUrls: string[]; // array of image URLs
  initialIdx?: number; // initial index to show
  open: boolean;
  onClose: () => void;
}
/**
 * fullscreen preview of images
 * @returns 
 */
const ImagePreview = ({
  imageUrls,
  initialIdx = 0,
  open,
  onClose,
}: Props) => {
  // const [images, setImages] = useState<{ uri: string, remoteUrl: string }[]>(imageUrls.map((uri) => ({ uri, remoteUrl: uri })));
  // useEffect(() => {
  //   if (!open) return;

  //   const updateImages = async (prevImages: { uri: string, remoteUrl: string }[]) => {
  //     // check if imageUrls changed
  //     const newImages: { uri: string, remoteUrl: string }[] = [];
  //     imageUrls.forEach((url, idx) => {
  //       if (prevImages[idx] && prevImages[idx].remoteUrl === url) {
  //         newImages.push(prevImages[idx]);
  //       } else {
  //         newImages.push({ uri: url, remoteUrl: url }); // not downloaded yet
  //       }
  //     });
  //     // if initialIdx image is not downloaded yet, download it
  //     if (initialIdx >= 0 && initialIdx < newImages.length) {
  //       const { uri, remoteUrl } = newImages[initialIdx]; 
  //       if (!uri.startsWith("file://")) {
  //         const localUri = await downloadImageToCache(remoteUrl)
  //         if (localUri) {
  //           newImages[initialIdx] = { uri: localUri, remoteUrl };
  //         }
  //       }
  //     }
  //     return newImages;
  //   }
  //   updateImages(images).then(setImages).catch((e) => {
  //     console.error("Error updating images for preview:", e);
  //   });
  // }, [imageUrls, initialIdx, open]);

  // const onImageIndexChange = async (index: number) => {
  //   if (index < 0 || index >= images.length) return;

  //   const { uri, remoteUrl } = images[index];
  //   // download to cache
  //   if (uri.startsWith("file://")) return; // already local
  //   const localUri = await downloadImageToCache(remoteUrl);
  //   if (localUri) {
  //     const newImages = [...images];
  //     newImages[index] = { uri: localUri, remoteUrl };
  //     setImages(newImages);
  //   } 
  // }

  const images = imageUrls.map((url) => ({ uri: url }));

  return (
    <EnhancedImageViewing
      images={images}
      imageIndex={initialIdx}
      // onImageIndexChange={onImageIndexChange}
      
      // swipeToCloseEnabled={false}
      visible={open}
      onRequestClose={onClose}
    />
  );
};

export default ImagePreview;
