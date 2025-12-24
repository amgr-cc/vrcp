import GenericScreen from "@/components/layout/GenericScreen";
import DetailItemContainer from "@/components/features/DetailItemContainer";
import CardViewGroupDetail from "@/components/view/item-CardView/detail/CardViewGroupDetail";
import LoadingIndicator from "@/components/view/LoadingIndicator";
import { fontSize, navigationBarHeight, radius, spacing } from "@/configs/styles";
import { useCache } from "@/contexts/CacheContext";
import { useVRChat } from "@/contexts/VRChatContext";
import { extractErrMsg } from "@/libs/utils";
import { Group } from "@/vrchat/api";
import { useTheme } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router/build/hooks";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { RefreshControl } from "react-native-gesture-handler";
import { MenuItem } from "@/components/layout/type";
import JsonDataModal from "@/components/modals/JsonDataModal";
import { useToast } from "@/contexts/ToastContext";
import { useTranslation } from "react-i18next";
import { useSetting } from "@/contexts/SettingContext";

export default function GroupDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { settings: { otherOptions: {enableJsonViewer} } } = useSetting();
  const vrc = useVRChat();
  const { t } = useTranslation();
  const cache = useCache();
  const theme = useTheme();
  const { showToast } = useToast();
  const [group, setGroup] = useState<Group>();
  const fetchingRef = useRef(false);
  const isLoading = useMemo(() => fetchingRef.current, [fetchingRef.current]);

  const [openJson, setOpenJson] = useState(false);


  const fetchGroup = () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    cache.group.get(id, true)
      .then(setGroup)
      .catch((e) => showToast("error", "Error fetching group data", extractErrMsg(e)))
      .finally(() => fetchingRef.current = false);
  };

  useEffect(() => {
    fetchGroup();
  }, []);

  const menuItems: MenuItem[] = [
    {
      icon: "circle-medium",
      title: "(REQUEST) JOIN GROUP or LEAVE GROUP",
    },
    {
      icon: "circle-medium",
      title: "GROUP INSTANCES",
    },
    {
      type: "divider",
      hidden: !enableJsonViewer,
    },
    {
      icon: "code-json",
      title: t("pages.detail_group.menuLabel_json"),
      onPress: () => setOpenJson(true),
      hidden: !enableJsonViewer,
    },
  ];

  return (
    <GenericScreen menuItems={menuItems}>
      {group ? (
        <View style={{ flex: 1 }}>
          <CardViewGroupDetail group={group} style={[styles.cardView]} />
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={fetchGroup}
              />
            }
          >
            <DetailItemContainer title="Title1">
              <View style={styles.detailItemContent}>
                <Text style={{ color: theme.colors.text }}>text1-1</Text>
                <Text style={{ color: theme.colors.text }}>text1-2</Text>
              </View>
            </DetailItemContainer>

            <DetailItemContainer
              title="Title2"
              iconButtonConfig={[{ name: "edit", onPress: () => {} }]}
            >
              <View style={styles.detailItemContent}>
                <Text style={{ color: theme.colors.text }}>text2-1</Text>
              </View>
            </DetailItemContainer>

          </ScrollView>
        </View>
      ) : (
        <LoadingIndicator absolute />
      )}

      {/* Modals */}
      <JsonDataModal open={openJson} setOpen={setOpenJson} data={group} />

    </GenericScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: navigationBarHeight,
  },
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
});
