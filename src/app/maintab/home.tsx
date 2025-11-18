import GenericScreen from "@/components/layout/GenericScreen";
import CardViewInstance from "@/components/view/item-CardView/CardViewInstance";
import ListViewPipelineMessage from "@/components/view/item-ListView/ListViewPipelineMessage";
import LoadingIndicator from "@/components/view/LoadingIndicator";
import { spacing } from "@/configs/styles";
import { useData } from "@/contexts/DataContext";
import { useVRChat } from "@/contexts/VRChatContext";
import SeeMoreContainer from "@/components/features/home/SeeMoreContainer";
import { calcFriendsLocations } from "@/libs/funcs/calcFriendLocations";
import { routeToEvents, routeToFeeds, routeToFriendLocations, routeToInstance, routeToWorld } from "@/libs/route";
import { InstanceLike } from "@/libs/vrchat";
import { PipelineMessage } from "@/vrchat/pipline/type";
import { useLocale, useTheme } from "@react-navigation/native";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Setting, useSetting } from "@/contexts/SettingContext";
import { CalendarEvent, PaginatedCalendarEventList } from "@/vrchat/api";
import { useToast } from "@/contexts/ToastContext";
import { extractErrMsg } from "@/libs/utils";
import { formatToDateStr, formatToTimeStr } from "@/libs/date";
import { useAuth } from "@/contexts/AuthContext";
import MonthlyCalendarView from "@/components/view/calendarView/MonthlyColendarView";

export default function Home() {
  const theme = useTheme();
  const { settings } = useSetting();
  const { homeTabTopVariant, homeTabBottomVariant, homeTabSeparatePos, cardViewColumns } = settings.uiOptions.layouts;
  
  if (homeTabTopVariant === homeTabBottomVariant || homeTabSeparatePos <= 0 || homeTabSeparatePos >= 100) {
    const singleVariant = homeTabTopVariant ?? homeTabBottomVariant;
    return (
      <GenericScreen>
        {singleVariant === 'feeds' ? (
          <FeedArea />
        ) : singleVariant === 'friend-locations' ? (
          <FriendLocationArea />
        ) : singleVariant === 'events' ? (
          <EventsArea />
        ) : null}
      </GenericScreen>
    );
  }

  return (
    <GenericScreen>
      {homeTabTopVariant === 'feeds' ? (
        <FeedArea style={{ maxHeight: `${homeTabSeparatePos}%` }} />
      ) : homeTabTopVariant === 'friend-locations' ? (
        <FriendLocationArea style={{ maxHeight: `${homeTabSeparatePos}%` }} />
      ) : homeTabTopVariant === 'events' ? (
        <EventsArea style={{ maxHeight: `${homeTabSeparatePos}%` }} />
      ) : null}
  
      {homeTabBottomVariant === 'feeds' ? (
        <FeedArea style={{ maxHeight: `${100 - homeTabSeparatePos}%` }} />
      ) : homeTabBottomVariant === 'friend-locations' ? (
        <FriendLocationArea style={{ maxHeight: `${100 - homeTabSeparatePos}%` }} />
      ) : homeTabBottomVariant === 'events' ? (
        <EventsArea style={{ maxHeight: `${100 - homeTabSeparatePos}%` }} />
      ) : null}

    </GenericScreen>
  );
}


const FeedArea = memo(({style}: { style?: any }) => {
  const theme = useTheme();
  const { pipelineMessages } = useData();

  const renderItem = useCallback(({ item }: { item: PipelineMessage }) => (
    <ListViewPipelineMessage message={item} style={styles.feed} />
  ), []);
  const emptyComponent = useCallback(() => (
    <View style={{ alignItems: "center", marginTop: spacing.large }}>
      <Text style={{ color: theme.colors.text }}>No feeds available.</Text>
    </View>
  ), [theme.colors.text]);
  return (
    <SeeMoreContainer
      title="Feeds"
      onPress={() => routeToFeeds()}
      style={style}
    >
      <FlatList
        data={pipelineMessages}
        keyExtractor={(item) => `${item.timestamp}-${item.type}`}
        renderItem={renderItem}
        ListEmptyComponent={emptyComponent}
        numColumns={1}
      />
    </SeeMoreContainer>
  );
});

const FriendLocationArea = memo(({ style }: { style?: any }) => {
  const theme = useTheme();
  const { friends, favorites } = useData();

  const instances = useMemo<InstanceLike[]>(() => {
      return calcFriendsLocations(friends.data, favorites.data, true, false);
  }, [friends.data, favorites.data]);

  const renderItem = useCallback(({ item }: { item: InstanceLike }) => (
    <CardViewInstance instance={item} style={styles.cardView} onPress={() => routeToInstance(item.worldId, item.instanceId)} />
  ), []);
  const emptyComponent = useCallback(() => (
    <View style={{ alignItems: "center", marginTop: spacing.large }}>
      <Text style={{ color: theme.colors.text }}>No friends online in instances.</Text>
    </View>
  ), [theme.colors.text]);
  return (
    <SeeMoreContainer
      title="Friends Locations"
      onPress={() => routeToFriendLocations()}
      style={style}
    >
      <FlatList
        data={instances}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={emptyComponent}
        numColumns={2}
        onRefresh={friends.fetch}
        refreshing={friends.isLoading}
      />
    </SeeMoreContainer>
  );
});

const EventsArea = memo(({ style }: {
  style?: any
}) => {
  const auth = useAuth();
  const theme = useTheme();
  const vrc = useVRChat();
  const { showToast } = useToast();
  const eventsRef = useRef<CalendarEvent[]>([]);
  const [ todayEvents, setTodayEvents ] = useState<CalendarEvent[]>([]);
  const offset = useRef(0);
  const fetchingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const npr = 60;

  const getDateKey = (date: Date) => {
    const res = formatToDateStr(date);
    return res;
  }

  const fetchEvents = async () => {
    fetchingRef.current = true;
    setIsLoading(true);
    try {
      while (fetchingRef.current) {
        const res = await vrc.calendarApi.getCalendarEvents({
          date: new Date().toISOString(), // month only affects the returned events
          n: npr,
          offset: offset.current,
        });
        const paginated: PaginatedCalendarEventList = res.data;
        if (paginated.results) {
          eventsRef.current = [...eventsRef.current, ...paginated.results ?? []];
        }
        if (paginated.hasNext && (paginated.totalCount ?? 0 > offset.current + npr)) {
          offset.current += npr;
        } else {
          setTodayEvents(eventsRef.current.filter(event => getDateKey(new Date(event.startsAt ?? "")) === getDateKey(new Date()))); // update grouped events
          fetchingRef.current = false;
          setIsLoading(false);
        }
      }
    } catch (e) {
      fetchingRef.current = false;
      setIsLoading(false);
      showToast("error", "Error fetching calendar events", extractErrMsg(e));
    }
  };

  const reload = () => {
    eventsRef.current = [];
    offset.current = 0;
    void fetchEvents();
  };

  useEffect(() => {
    reload();
  },[auth.user]);

  const renderItem = useCallback(({ item }: { item: CalendarEvent }) => {
    return (
      <View key={item.id} style={{ backgroundColor: theme.colors.card, padding: spacing.small, margin: spacing.small, borderRadius: 8 }}>
        <View style={{ paddingHorizontal: spacing.small, flexDirection: "row", gap: spacing.small, alignItems: "center" }}>
          <Text style={{ color: theme.colors.text, marginTop: spacing.mini }}>
            {`${item.startsAt ? formatToTimeStr(item.startsAt) : "N/A"} ~ ${item.endsAt ? formatToTimeStr(item.endsAt) : "N/A"}`}
          </Text>
          <View style={{ flex: 1 }} >
            <Text numberOfLines={1} style={{ color: theme.colors.text, fontSize: 16, fontWeight: "bold" }}>{item.title}</Text>
          </View>
        </View>
        <Text numberOfLines={3} style={{ color: theme.colors.subText, marginTop: spacing.mini, marginLeft: spacing.small }}>
          {item.description}
        </Text>
      </View>
    );
  }, []);
  
  const emptyComponent = useCallback(() => (
    <View style={{ alignItems: "center", marginTop: spacing.large }}>
      <Text style={{ color: theme.colors.text }}>No events available.</Text>
    </View>
  ), [theme.colors.text]);

  return (
    <SeeMoreContainer
      title="Events Today"
      onPress={() => routeToEvents()}
      style={style}
    >
      <FlatList
        data={todayEvents}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={emptyComponent}
        numColumns={2}
        onRefresh={reload}
        refreshing={isLoading}
      />
    </SeeMoreContainer>
  );
});


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.mini,
    // borderStyle:"dotted", borderColor:"red",borderWidth:1
  },
  feed: {
    width: "100%",
  },
  cardView: {
    width: "50%",
  },
});