import GenericScreen from "@/components/layout/GenericScreen";
import DetailItemContainer from "@/components/features/detail/DetailItemContainer";
import CardViewAvatarDetail from "@/components/view/item-CardView/detail/CardViewAvatarDetail";
import LoadingIndicator from "@/components/view/LoadingIndicator";
import { fontSize, radius, spacing } from "@/configs/styles";
import { useCache } from "@/contexts/CacheContext";
import { useVRChat } from "@/contexts/VRChatContext";
import { extractErrMsg } from "@/libs/utils";
import { Avatar, User } from "@/vrchat/api";
import { useTheme } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router/build/hooks";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { routeToUser } from "@/libs/route";
import UserChip from "@/components/view/chip-badge/UserChip";
import { getAuthorTags, getPlatform, getTrustRankColor } from "@/libs/vrchat";
import PlatformChips from "@/components/view/chip-badge/PlatformChips";
import TagChips from "@/components/view/chip-badge/TagChips";
import { useData } from "@/contexts/DataContext";
import { MenuItem } from "@/components/layout/type";
import ChangeFavoriteModal from "@/components/features/detail/ChangeFavoriteModal";
import { RefreshControl } from "react-native-gesture-handler";

export default function AvatarDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vrc = useVRChat();
  const cache = useCache();
  const data = useData();
  const theme = useTheme();
  const fetchingRef = useRef(false);
  const isLoading = useMemo(() => fetchingRef.current, [fetchingRef.current]);
  const [avatar, setAvatar] = useState<Avatar>();
  const [author, setAuthor] = useState<User>();

  const [openChangeFavorite, setOpenChangeFavorite] = useState(false);

  const isFavorite = data.favorites.data.some(fav => fav.favoriteId === id && fav.type === "avatar");

  const fetchAvatar = () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    cache.avatar.get(id, true)
      .then(setAvatar)
      .catch((e) => console.error("Error fetching user profile:", extractErrMsg(e)))
      .finally(() => fetchingRef.current = false);
  };

  useEffect(() => {
    fetchAvatar();
  }, []);

  useEffect(() => {
    if (!avatar?.authorId) return;
    cache.user.get(avatar.authorId).then((u) => setAuthor(u)).catch(console.error)
  }, [avatar?.authorId])


  const menuItems: MenuItem[] = [
    {
      icon: isFavorite ? "heart" : "heart-plus",
      title: isFavorite ? "Edit Favorite Group" : "Add Favorite Group",
      onPress: () => setOpenChangeFavorite(true),
    },
  ];

  return (
    <GenericScreen menuItems={menuItems}>
      {avatar ? (
        <View style={{ flex: 1 }}>
          <CardViewAvatarDetail avatar={avatar} style={[styles.cardView]} />
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={fetchAvatar}
              />
            }
          >

            <DetailItemContainer title="Platform">
              <View style={styles.detailItemContent}>
                <PlatformChips platforms={getPlatform(avatar)} />
              </View>
            </DetailItemContainer>

            <DetailItemContainer title="Description">
              <View style={styles.detailItemContent}>
                <Text style={{ color: theme.colors.text }}>
                  {avatar.description}
                </Text>
              </View>
            </DetailItemContainer>

            <DetailItemContainer title="Tags">
              <View style={styles.detailItemContent}>
                <TagChips tags={getAuthorTags(avatar)} />
              </View>
            </DetailItemContainer>

            
            <DetailItemContainer title="Author">
              {author && (
                <View style={styles.detailItemContent}>
                  <TouchableOpacity onPress={() => routeToUser(author.id)} activeOpacity={0.7}>
                    <UserChip user={author} textColor={getTrustRankColor(author, true, false)}/>
                  </TouchableOpacity>
                </View>
              )}
            </DetailItemContainer>

            <Text style={{ color: "gray" }}>
              {JSON.stringify(avatar, null, 2)}
            </Text>
          </ScrollView>
        </View>
      ) : (
        <LoadingIndicator absolute />
      )}

      
      {/* dialog and modals */}
      
      <ChangeFavoriteModal
        open={openChangeFavorite}
        setOpen={setOpenChangeFavorite}
        item={avatar}
        type="avatar"
        onSuccess={data.favorites.fetch}
      />
    </GenericScreen>
  );
}

const styles = StyleSheet.create({
  cardView: {
    position: "relative",
    paddingVertical: spacing.medium,
  },
  badgeContainer: {
    position: "absolute",
    width: "100%",
    top: spacing.medium,
    bottom: spacing.medium,
    borderRadius: radius.small,
    padding: spacing.medium,
  },
  badge: {
    padding: spacing.small,
    width: "20%",
    aspectRatio: 1,
  },

  detailItemContent: {
    flex: 1,
    // borderStyle:"dotted", borderColor:"red",borderWidth:1
  },
  detailItemImage: {
    marginRight: spacing.small,
    height: spacing.small * 2 + fontSize.medium * 3,
    aspectRatio: 16 / 9,
  },
});
