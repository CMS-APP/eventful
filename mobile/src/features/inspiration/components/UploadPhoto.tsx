import { useCallback, useState } from "react";

import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import * as ImagePicker from "expo-image-picker";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { padding } from "@/design-system/tokens/padding";
import { Photo } from "@/types/Photo";
import { haptics } from "@/utils/haptics";

interface UploadPhotoProps {
  photos: Photo[];
  setPhotos: (photos: Photo[]) => void;
  maxPhotos?: number;
}

export function UploadPhoto({
  photos,
  setPhotos,
  maxPhotos = 10
}: UploadPhotoProps) {
  const [loading, setLoading] = useState(false);

  const requestPermissions = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant permission to access your photo library."
      );
      return false;
    }
    return true;
  }, []);

  const pickImage = useCallback(async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert(
        "Maximum Photos Reached",
        `You can only upload up to ${maxPhotos} photos.`
      );
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      setLoading(true);
      haptics.soft();

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [1, 1]
      });

      if (!result.canceled && result.assets.length > 0) {
        const newPhotos: Photo[] = result.assets.map((asset, index) => ({
          id: `photo_${Date.now()}_${index}`,
          title: `Photo ${photos.length + index + 1}`,
          uri: asset.uri,
          uploaded: false
        }));

        const totalPhotos = photos.length + newPhotos.length;
        if (totalPhotos > maxPhotos) {
          const allowedPhotos = newPhotos.slice(0, maxPhotos - photos.length);
          setPhotos([...photos, ...allowedPhotos]);
          Alert.alert(
            "Photos Limited",
            `Only ${allowedPhotos.length} photos were added to stay within the limit.`
          );
        } else {
          setPhotos([...photos, ...newPhotos]);
        }
      }
    } catch {
      Alert.alert("Error", "Failed to pick images. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [photos, maxPhotos, requestPermissions, setPhotos]);

  const removePhoto = useCallback(
    (photoId: string) => {
      haptics.soft();
      const updatedPhotos = photos.filter((photo) => photo.id !== photoId);
      setPhotos(updatedPhotos);
    },
    [photos, setPhotos]
  );

  const renderPhoto = useCallback(
    (photo: Photo) => (
      <View key={photo.id} style={styles.photoContainer}>
        <Image source={{ uri: photo.uri }} style={styles.photo} />
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removePhoto(photo.id)}
          hitSlop={getHitSlop("medium")}
        >
          <FontAwesome5 name="times" size={16} color={colors.white} />
        </TouchableOpacity>
      </View>
    ),
    [removePhoto]
  );

  const renderAddButton = useCallback(
    () => (
      <TouchableOpacity
        key="add_button"
        style={[styles.photoContainer, styles.addButton]}
        onPress={pickImage}
        disabled={loading}
        hitSlop={getHitSlop("medium")}
      >
        <FontAwesome5 name="plus" size={30} color={colors.primary} />
        <Text style={styles.addButtonText}>Add Photo</Text>
      </TouchableOpacity>
    ),
    [pickImage, loading]
  );

  // Create grid layout with photos and add button
  const renderGrid = () => {
    const allItems = [...photos];

    // Add the add button if there's space
    if (photos.length < maxPhotos) {
      allItems.push({
        id: "add_button",
        title: "",
        uri: "",
        uploaded: false
      } as Photo);
    }

    const rows = [];

    // Create rows of 3 items each
    for (let i = 0; i < allItems.length; i += 3) {
      const rowItems = allItems.slice(i, i + 3);
      const row = (
        <View key={`row_${i}`} style={styles.photoRow}>
          {rowItems.map((item, index) => {
            if (item.id === "add_button") {
              return renderAddButton();
            } else {
              return renderPhoto(item);
            }
          })}
          {/* Fill remaining slots with empty views to maintain grid */}
          {Array.from({ length: 3 - rowItems.length }, (_, index) => (
            <View key={`empty_${i}_${index}`} style={styles.photoContainer} />
          ))}
        </View>
      );
      rows.push(row);
    }

    return rows;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text type="subHeader">Photos</Text>
        <Text type="body">
          {photos.length}/{maxPhotos} photos
        </Text>
      </View>

      <View>{renderGrid()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    ...padding.mediumWidget,
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.primary + "33",
    borderStyle: "dashed",
    borderWidth: 2,
    justifyContent: "center"
  },
  addButtonText: {
    color: colors.primary,
    fontSize: 12,
    letterSpacing: 2,
    marginTop: 6,
    textAlign: "center"
  },
  container: {
    backgroundColor: colors.lightGray,
    borderRadius: 24,
    flex: 1,
    padding: 20
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20
  },
  photo: {
    borderRadius: 12,
    height: "100%",
    width: "100%"
  },
  photoContainer: {
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    width: "30%"
  },
  photoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    width: "100%"
  },
  removeButton: {
    alignItems: "center",
    backgroundColor: colors.red + "CC",
    borderRadius: 12,
    height: 24,
    justifyContent: "center",
    position: "absolute",
    right: 6,
    top: 6,
    width: 24
  }
});
