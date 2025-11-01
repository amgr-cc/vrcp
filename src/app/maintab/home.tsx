import GenericScreen from "@/components/layout/GenericScreen";
import CardViewInstance from "@/components/view/item-CardView/CardViewInstance";
import ListViewPipelineMessage from "@/components/view/item-ListView/ListViewPipelineMessage";
import LoadingIndicator from "@/components/view/LoadingIndicator";
import { spacing } from "@/configs/styles";
import { useData } from "@/contexts/DataContext";
import { useVRChat } from "@/contexts/VRChatContext";
import SeeMoreContainer from "@/components/features/home/SeeMoreContainer";
import { calcFriendsLocations } from "@/libs/funcs/calcFriendLocations";
import { routeToFeeds, routeToFriendLocations, routeToInstance, routeToWorld } from "@/libs/route";
import { InstanceLike } from "@/libs/vrchat";
import { PipelineMessage } from "@/vrchat/pipline/type";
import { useTheme } from "@react-navigation/native";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { Setting, useSetting } from "@/contexts/SettingContext";
import { CalendarEvent, PaginatedCalendarEventList } from "@/vrchat/api";

type HomeTabMode = Setting["uiOptions"]["layouts"]["homeTabMode"]

export default function Home() {
  const theme = useTheme();
  const { settings } = useSetting();
  const { homeTabMode, cardViewColumns } = settings.uiOptions.layouts;
  const { pipelineMessages } = useData();
  const { friends, favorites } = useData();

  const instances = useMemo<InstanceLike[]>(() => {
      return calcFriendsLocations(friends.data, favorites.data, true, false);
  }, [friends.data, favorites.data]);


  const FeedArea = ({style}: {style?: any}) => {
    return (
      <SeeMoreContainer
        title="Feeds"
        onPress={() => routeToFeeds()}
        style={style}
      >
        <FlatList
          data={pipelineMessages}
          keyExtractor={(item) => `${item.timestamp}-${item.type}`}
          renderItem={({ item }) => (
            <ListViewPipelineMessage message={item} style={styles.feed} />
          )} 
          ListEmptyComponent={() => (
            <View style={{ alignItems: "center", marginTop: spacing.large }}>
              <Text style={{ color: theme.colors.text }}>No feeds available.</Text>
            </View>
          )}
          numColumns={1}
        />
      </SeeMoreContainer>
    );
  }

  const FriendLocationArea = ({style}: {style?: any}) => {
    return (
      <SeeMoreContainer
        title="Friends Locations"
        onPress={() => routeToFriendLocations()}
        style={style}
      >
        {friends.isLoading && (<LoadingIndicator absolute />)}
        <FlatList
          data={instances}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CardViewInstance instance={item} style={styles.cardView} onPress={() => routeToInstance(item.worldId, item.instanceId)} />
          )}
          ListEmptyComponent={() => (
            <View style={{ alignItems: "center", marginTop: spacing.large }}>
              <Text style={{ color: theme.colors.text }}>No friends online in instances.</Text>
            </View>
          )}
          numColumns={2}
        />
      </SeeMoreContainer>
    );
  }

  const CalendarArea = ({style}: {style?: any}) => {
    const vrc = useVRChat();
    const [ events, setEvents ] = useState<CalendarEvent[]>([]);
    const offset = useRef(0);
    const fetchingRef = useRef(false);
    const npr = 100;
    const fetchEvents = async () => {
      fetchingRef.current = true;
      try {
        const res = await vrc.calendarApi.getCalendarEvents({
          date: new Date().toISOString(), // month only affects the returned events
          n: npr,
          offset: offset.current,
        });
        const paginated: PaginatedCalendarEventList = res.data;
        if (paginated.results) {
          setEvents(prev => [...prev, ...paginated.results ?? []]);
        }
        if (paginated.hasNext && (paginated.totalCount ?? 0 > offset.current + npr)) {
          offset.current += npr;
          void fetchEvents();
        } else {
          fetchingRef.current = false;
        }
      } catch (e) {
        fetchingRef.current = false;
        console.error("Error fetching calendar events:", e);
      }
    };

    const reload = () => {
      setEvents([]);
      offset.current = 0;
      void fetchEvents();
    };
    return (
      <></>
    );
  } 

  
  return (
    <GenericScreen>
      { homeTabMode === "feeds" ? (
        <>
          <FeedArea />
        </>
      ) : homeTabMode === "calendar" ? (
        <>
          <CalendarArea />
        </>
      ) : homeTabMode === "friend-locations" ? (
        <>
          <FriendLocationArea />
        </>
      ) : ( // default mode
        <>
          <FeedArea
            style={{maxHeight: "30%" }}
          />
          <FriendLocationArea
            style={{maxHeight: "70%" }}
          />
        </>
      )}
    </GenericScreen>
  );
}

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