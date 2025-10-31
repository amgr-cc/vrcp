import GenericScreen from "@/components/layout/GenericScreen";
import DetailItemContainer from "@/components/features/detail/DetailItemContainer";
import CardViewGroupDetail from "@/components/view/item-CardView/detail/CardViewGroupDetail";
import LoadingIndicator from "@/components/view/LoadingIndicator";
import { fontSize, radius, spacing } from "@/configs/styles";
import { useCache } from "@/contexts/CacheContext";
import { useVRChat } from "@/contexts/VRChatContext";
import { extractErrMsg } from "@/libs/utils";
import { Group } from "@/vrchat/api";
import { useTheme } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router/build/hooks";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { RefreshControl } from "react-native-gesture-handler";

export default function GroupDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vrc = useVRChat();
  const cache = useCache();
  const theme = useTheme();
  const [group, setGroup] = useState<Group>();
  const fetchingRef = useRef(false);
  const isLoading = useMemo(() => fetchingRef.current, [fetchingRef.current]);

  const fetchGroup = () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    cache.group.get(id, true)
      .then(setGroup)
      .catch((e) => console.error("Error fetching group data:", extractErrMsg(e)))
      .finally(() => fetchingRef.current = false);
  };

  useEffect(() => {
    fetchGroup();
  }, []);

  return (
    <GenericScreen>
      {group ? (
        <View style={{ flex: 1 }}>
          <CardViewGroupDetail group={group} style={[styles.cardView]} />
          <ScrollView
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

            <Text style={{ color: "gray" }}>
              {JSON.stringify(group, null, 2)}
            </Text>
          </ScrollView>
        </View>
      ) : (
        <LoadingIndicator absolute />
      )}
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
