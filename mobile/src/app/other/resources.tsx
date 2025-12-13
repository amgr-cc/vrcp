import GenericScreen from "@/components/layout/GenericScreen";
import CardViewAvatar from "@/components/view/item-CardView/CardViewAvatar";
import CardViewWorld from "@/components/view/item-CardView/CardViewWorld";
import LoadingIndicator from "@/components/view/LoadingIndicator";
import { navigationBarHeight, spacing } from "@/configs/styles";
import { useVRChat } from "@/contexts/VRChatContext";
import { extractErrMsg } from "@/libs/utils";
import { routeToAvatar, routeToWorld } from "@/libs/route";
import { Avatar, LimitedWorld, OrderOption, Print, SortOption } from "@/vrchat/api";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useTheme } from "@react-navigation/native";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Image, StyleSheet, Text, Touchable, TouchableOpacity, View } from "react-native";
import { useData } from "@/contexts/DataContext";
import CardViewPrint from "@/components/view/item-CardView/CardViewPrint";
import { CachedImage } from "@/contexts/CacheContext";
import ImagePreview from "@/components/view/ImagePreview";
import { useSetting } from "@/contexts/SettingContext";
import { useToast } from "@/contexts/ToastContext";
import { useTranslation } from "react-i18next";
// user's avatar, world, and other uploaded resources
export default function Resources() {
  const theme = useTheme();
  const { t } = useTranslation();
  const MaterialTab = createMaterialTopTabNavigator();

  return (
    <GenericScreen>
      <MaterialTab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: theme.colors.background },
          tabBarIndicatorStyle: { backgroundColor: theme.colors.primary },
        }}
      >
        <MaterialTab.Screen
          name="avatar"
          options={{ tabBarLabel: t("pages.resources.tabLabel_avatars") }}
          component={useCallback(AvatarsTab, [])}
        />
        <MaterialTab.Screen
          name="world"
          options={{ tabBarLabel: t("pages.resources.tabLabel_worlds") }}
          component={useCallback(WorldsTab, [])}
        />
        <MaterialTab.Screen
          name="print"
          options={{ tabBarLabel: t("pages.resources.tabLabel_prints") }}
          component={useCallback(PrintsTab, [])}
        />
      </MaterialTab.Navigator>
    </GenericScreen>
  );
}



const AvatarsTab = memo(() => {
  const vrc = useVRChat();
  const theme = useTheme();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { settings } = useSetting();
  const cardViewColumns = settings.uiOptions.layouts.cardViewColumns;
  const NumPerReq = 50;
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const fetchingRef = useRef(false);
  const isLoading = useMemo(() => fetchingRef.current, [fetchingRef.current]);
  const offset = useRef(0);

  const fetchAvatars = async () => {
    if (fetchingRef.current || offset.current < 0) return;
    fetchingRef.current = true;
    try {
      const res = await vrc.avatarsApi.searchAvatars({
        offset: offset.current,
        n: NumPerReq,
        user: "me",
        releaseStatus: "all",
        sort: SortOption.Updated,
        order: OrderOption.Descending,
      });
      if (res.data.length === 0) {
        offset.current = -1; // reset offset if no more data
      } else {
        setAvatars(prev => [...prev, ...res.data]);
        offset.current += NumPerReq;
      }
    } catch (e) {
      showToast("error", "Error fetching own avatars", extractErrMsg(e));
    } finally {
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchAvatars();
  }, []);

  const reload = () => {
    offset.current = 0;
    setAvatars([]);
    fetchAvatars();
  };

  const renderItem = useCallback(({ item }: { item: Avatar }) => (
    <CardViewAvatar
      avatar={item}
      style={[styles.cardView, { width: `${100 / cardViewColumns}%` }]}
      onPress={() => routeToAvatar(item.id)}
    />
  ), []);
  const emptyComponent = useCallback(() => (
    <View style={{ alignItems: "center", marginTop: spacing.large }}>
      <Text style={{ color: theme.colors.text }}>
        {t("pages.resources.no_avatars")}
      </Text>
    </View>
  ), []);

  return (
    <View style={styles.tabpanel}>
      {isLoading && <LoadingIndicator absolute />}
      <FlatList
        // key={`avatar-list-col-${cardViewColumns}`} // to re-render on column change
        data={avatars}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={emptyComponent}
        numColumns={cardViewColumns}
        onEndReached={fetchAvatars}
        onEndReachedThreshold={0.5}
        onRefresh={reload}
        refreshing={isLoading}
        contentContainerStyle={styles.scrollContentContainer}
      />
    </View>
  );
});

const WorldsTab = memo(() => {
  const vrc = useVRChat();
  const theme = useTheme();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { settings } = useSetting();
  const cardViewColumns = settings.uiOptions.layouts.cardViewColumns;
  const NumPerReq = 50;
  
  const [worlds, setWorlds] = useState<LimitedWorld[]>([]);
  const fetchingRef = useRef(false);
  const isLoading = useMemo(() => fetchingRef.current, [fetchingRef.current]);
  const offset = useRef(0);

  const fetchWorlds = async () => {
    if (fetchingRef.current || offset.current < 0) return;
    fetchingRef.current = true;
    try {
      const res = await vrc.worldsApi.searchWorlds({
        offset: offset.current,
        n: NumPerReq,
        user: "me",
        releaseStatus: "all",
        sort: SortOption.Updated,
        order: OrderOption.Descending,
      });
      if (res.data.length === 0) {
        offset.current = -1; // reset offset if no more data
      } else {
        setWorlds(prev => [...prev, ...res.data]);
        offset.current += NumPerReq;
      }
    } catch (e) {
      showToast("error", "Error fetching own worlds", extractErrMsg(e));
    } finally {
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchWorlds();
  }, []);

  const reload = () => {
    offset.current = 0;
    setWorlds([]);
    fetchWorlds();
  }

  const renderItem = useCallback(({ item, index }: { item: LimitedWorld; index: number }) => (
    <CardViewWorld
      world={item}
      style={[styles.cardView, { width: `${100 / cardViewColumns}%` }]}
      onPress={() => routeToWorld(item.id)}
    />
  ), []);
  const emptyComponent = useCallback(() => (
    <View style={{ alignItems: "center", marginTop: spacing.large }}>
      <Text style={{ color: theme.colors.text }}>
        {t("pages.resources.no_worlds")}
      </Text>
    </View>
  ), []);

  return (
    <View style={styles.tabpanel}>
      {isLoading && <LoadingIndicator absolute />}
      <FlatList
        // key={`world-list-col-${cardViewColumns}`} // to re-render on column change
        data={worlds}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={emptyComponent}
        numColumns={cardViewColumns}
        onEndReached={fetchWorlds}
        onEndReachedThreshold={0.5}
        onRefresh={reload}
        refreshing={isLoading}
        contentContainerStyle={styles.scrollContentContainer}
      />
    </View>
  );
});
const PrintsTab = memo(() => {
  const vrc = useVRChat();
  const theme = useTheme();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { currentUser } = useData();
  const { settings } = useSetting();
  const cardViewColumns = settings.uiOptions.layouts.cardViewColumns;
  const NumPerReq = 50;

  const [prints, setPrints] = useState<Print[]>([]);
  const fetchingRef = useRef(false);
  const offset = useRef(0);
  const isLoading = useMemo(() => fetchingRef.current, [fetchingRef.current]);

  const [preview, setPreview] = useState<{ idx: number; open: boolean }>({ idx: 0, open: false });
  const [previewImageUrls, setPreviewImageUrls] = useState<string[]>([]);
  // prints, ...etc
  const fetchPrints = async () => {
    try {
      if (fetchingRef.current || offset.current < 0) return;
      fetchingRef.current = true;
      const res = await vrc.printsApi.getUserPrints({
        userId: currentUser.data?.id || "",
      }, {
        // API仕様にはないがoffsetとnを指定できるっぽい
        params: {
          offset: offset.current,
          n: NumPerReq,
          sort: SortOption.Updated,
          order: OrderOption.Descending,
        }
      });
      if (res.data.length === 0) {
        offset.current = -1; // reset offset if no more data
      } else {
        setPrints(prev => [...prev, ...res.data]);
        setPreviewImageUrls(prev => [...prev, ...res.data.map(print => print.files.image || "").filter(url => url.length > 0)]);
        offset.current += NumPerReq;
      }
    } catch (e) {
      showToast("error", "Error fetching own prints", extractErrMsg(e));
    } finally {
      fetchingRef.current = false;
    }
  };
  useEffect(() => {
    fetchPrints();
  }, []);
  const reload = () => {
    offset.current = 0;
    setPrints([]);
    setPreviewImageUrls([]);
    fetchPrints();
  };

  const renderItem = useCallback(({ item, index }: { item: Print; index: number }) => (
    <CardViewPrint print={item} style={[styles.cardView, { width: `${100 / cardViewColumns}%` }]} onPress={() => setPreview({ idx: index, open: true })} />
  ), []);
  const emptyComponent = useCallback(() => (
    <View style={{ alignItems: "center", marginTop: spacing.large }}>
      <Text style={{ color: theme.colors.text }}>
        {t("pages.resources.no_prints")}
      </Text>
    </View>
  ), []);

  return (
    <View style={styles.tabpanel}>
      {isLoading && <LoadingIndicator absolute />}
      <FlatList
        // key={`print-list-col-${cardViewColumns}`} // to re-render on column change
        data={prints}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={emptyComponent}
        numColumns={cardViewColumns}
        onEndReached={fetchPrints}
        onEndReachedThreshold={0.5}
        onRefresh={reload}
        refreshing={isLoading}
        contentContainerStyle={styles.scrollContentContainer}
      />
      
      {/* dialog and modals */}
      <ImagePreview imageUrls={previewImageUrls} initialIdx={preview.idx} open={preview.open} onClose={() => setPreview(prev => ({ ...prev, open: false }))} />
    </View>
  );
});


const styles = StyleSheet.create({
  tabpanel: {
    flex: 1,
  },
  cardView: {
    padding: spacing.small,
    width: "50%",
  },
  scrollContentContainer: {
    paddingBottom: navigationBarHeight,
  },
});
