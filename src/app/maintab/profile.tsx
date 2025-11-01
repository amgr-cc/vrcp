import GenericScreen from "@/components/layout/GenericScreen";
import DetailItemContainer from "@/components/features/detail/DetailItemContainer";
import BadgeChip from "@/components/view/chip-badge/BadgeChip";
import LinkChip from "@/components/view/chip-badge/LinkChip";
import RegionBadge from "@/components/view/chip-badge/RegionBadge";
import CardViewUserDetail from "@/components/view/item-CardView/detail/CardViewUserDetail";
import LoadingIndicator from "@/components/view/LoadingIndicator";
import { radius, spacing } from "@/configs/styles";
import { useData } from "@/contexts/DataContext";
import { useVRChat } from "@/contexts/VRChatContext";
import { useTheme } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import ImagePreview from "@/components/view/ImagePreview";
import { getUserIconUrl, getUserProfilePicUrl } from "@/libs/vrchat";
import ChangeStatusModal from "@/components/features/profile/ChangeStatusModal";
import { MenuItem } from "@/components/layout/type";
import ChangeBioModal from "@/components/features/profile/ChangeBioModal";
import ChangeBioLinksModal from "@/components/features/profile/ChangeBioLinksModal";

export default function Profile() {
  const vrc = useVRChat();
  const theme = useTheme();
  const { currentUser } = useData();
  const [preview, setPreview] = useState({ imageUrl: "", open: false });
  const [openChangeStatus, setOpenChangeStatus] = useState(false);
  const [openChangeBio, setOpenChangeBio] = useState(false);
  const [openChangeBioLinks, setOpenChangeBioLinks] = useState(false);

  const menuItems: MenuItem[] = [
    {
      icon: "playlist-edit",
      title: "Edit Bio",
      onPress: () => setOpenChangeBio(true),
    },
    {
      icon: "clipboard-edit-outline",
      title: "Edit Bio Links",
      onPress: () => setOpenChangeBioLinks(true),
    },
    {
      icon: "human-edit",
      title: "Change Status",
      onPress: () => setOpenChangeStatus(true),
    },
  ];
  return (
    <GenericScreen menuItems={menuItems}>
      {currentUser.data ? (
        <View>
          <CardViewUserDetail
            user={currentUser.data}
            style={[styles.cardView]}
            onPress={() => currentUser.data && setPreview({imageUrl: getUserProfilePicUrl(currentUser.data, true), open: true})}
            onPressIcon={() => currentUser.data && setPreview({imageUrl: getUserIconUrl(currentUser.data, true), open: true})}
          />

          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={currentUser.isLoading}
                onRefresh={currentUser.fetch}
              />
            }
          >

            <DetailItemContainer title="Bio">
              <View style={styles.detailItemContent}>
                <Text style={{ color: theme.colors.text }}>
                  {currentUser.data.bio}
                </Text>
              </View>
            </DetailItemContainer>

            <DetailItemContainer title="Links">
              <View style={styles.detailItemContent}>
                {currentUser.data.bioLinks.map((link, index) => (
                  <LinkChip key={index} url={link} />
                ))}
              </View>
            </DetailItemContainer>

            <DetailItemContainer title="Badges">
              <View style={[styles.detailItemContent, styles.horizontal]}>
                {currentUser.data.badges?.map((badge) => (
                  <BadgeChip key={badge.badgeId} badge={badge} />
                ))}
              </View>
            </DetailItemContainer>

            <DetailItemContainer title="Info">
              <View style={styles.detailItemContent}>
                <Text style={{ color: theme.colors.text }}>
                  {`last activity: ${currentUser.data.last_activity}`}
                </Text>
                <Text style={{ color: theme.colors.text }}>
                  {`first joined: ${currentUser.data.date_joined}`}
                </Text>
              </View>
            </DetailItemContainer>

            <View style={{ padding: spacing.large, marginTop: spacing.large }}>
              <Text style={{ color: theme.colors.subText }}>
                {JSON.stringify(currentUser.data, null, 2)}
              </Text>
            </View>
          </ScrollView>
        </View>
      ) : (
        <LoadingIndicator absolute />
      )}

      {/* dialog and modals */}
      <ImagePreview
        imageUrls={[preview.imageUrl]}
        open={preview.open}
        onClose={() => setPreview({ imageUrl: "", open: false })}
      />
      <ChangeStatusModal open={openChangeStatus} setOpen={setOpenChangeStatus} />
      <ChangeBioModal open={openChangeBio} setOpen={setOpenChangeBio} />
      <ChangeBioLinksModal open={openChangeBioLinks} setOpen={setOpenChangeBioLinks} />
    </GenericScreen>
  );
}

const styles = StyleSheet.create({
  cardView: {
    position: "relative",
    paddingVertical: spacing.medium,
    // pointerEvents: "none", // override TouchableOpacity events
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
  horizontal: { 
    flexDirection: "row", 
    alignItems: "center",
    flexWrap: "wrap",
  },
});
