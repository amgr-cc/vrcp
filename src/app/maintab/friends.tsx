import { CurrentUser, FavoriteGroup, LimitedUserFriend } from "@/api/vrchat";
import GenericScreen from "@/components/layout/GenericScreen";
import ListViewUser from "@/components/view/item-ListView/ListViewUser";
import LoadingIndicator from "@/components/view/LoadingIndicator";
import { spacing } from "@/config/styles";
import { useVRChat } from "@/contexts/VRChatContext";
import { extractErrMsg } from "@/lib/extractErrMsg";
import { routeToUser } from "@/lib/route";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useTheme } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet } from "react-native";

export default function Friends() {
  const vrc = useVRChat();
  const theme = useTheme();
  const NumPerReq = 50;

  const MaterialTab = createMaterialTopTabNavigator();

  const [isLoadingCurrentUser, setIsLoadingCurrentUser] = useState<boolean>(false);
  const [isLoadingFavoriteGroups, setIsLoadingFavoriteGroups] = useState<boolean>(false);
  const currentUser = useRef<CurrentUser | null>(null);// not for render, use refs
  const [favoriteGroups, setFavoriteGroups] = useState<FavoriteGroup[]>([]);
  const numPerReqForFavorites = useRef<number>(150); // default 150 is max limit of favorite-friends per group , (2025/09/05)
  // separate loading with online,active and offline friends
  const [onlineFriends, setOnlineFriends] = useState<LimitedUserFriend[]>([]);
  const [activeFriends, setActiveFriends] = useState<LimitedUserFriend[]>([]);
  const [offlineFriends, setOfflineFriends] = useState<LimitedUserFriend[]>([]);
  const offsetOnlineOrActive = useRef(0);
  const offsetOffline = useRef(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);


  // Fetch current user to get online/active/offline friends list
  // called once on mount and when pull-to-refresh
  const fetchCurrentUser = async () => {
    try {
      const res = await vrc.authenticationApi.getCurrentUser();
      currentUser.current = res.data;
    } catch (e) {
      console.error("Error fetching current user:", extractErrMsg(e));
    }
  };
  const fetchFavoriteGroups = async () => {
    try { // favorite friend group , and favorite friends per group limit fetch
      const [ resGroup, resLimit ] = await Promise.all([
        vrc.favoritesApi.getFavoriteGroups(),
        vrc.favoritesApi.getFavoriteLimits(),
      ]);
      setFavoriteGroups(resGroup.data.filter(g => g.type === "friend"));
      numPerReqForFavorites.current = resLimit.data.maxFavoritesPerGroup.friend;
    } catch (e) {
      console.error("Error fetching favorite friends groups:", extractErrMsg(e));
    }
  };
  // Fetch friends list with pagination
  // called on mount, when end reached, and when pull-to-refresh
  const fetchOnlineOrActiveFriends = async () => {
    try {
      const {onlineFriends, activeFriends} = currentUser.current || {};
      const res = await vrc.friendsApi.getFriends(offsetOnlineOrActive.current, NumPerReq, false);
      if (res.data) {
        // console.log(`fetched: ${res.data.length}, offset: ${offsetOnlineOrActive.current}, total online: ${onlineFriends?.length}, total active: ${activeFriends?.length}`);
        setOnlineFriends((prev) => [...prev, ...res.data.filter(f => onlineFriends?.some(id => id === f.id))]);
        setActiveFriends((prev) => [...prev, ...res.data.filter(f => activeFriends?.some(id => id === f.id))]);
        offsetOnlineOrActive.current += NumPerReq;
      }
    } catch (e) {
      console.error("Error fetching friends:", extractErrMsg(e));
    }
  };
  const fetchOfflineFriends = async () => {
    try {
      const res = await vrc.friendsApi.getFriends(offsetOffline.current, NumPerReq, true);
      if (res.data) {
        setOfflineFriends((prev) => [...prev, ...res.data]);
        offsetOffline.current += NumPerReq;
      }
    } catch (e) {
      console.error("Error fetching friends:", extractErrMsg(e));
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([// currentUser must be fetched first
        fetchCurrentUser(), 
        // fetchFavoriteGroups(),
      ]);
      await Promise.all([
        fetchOnlineOrActiveFriends(),
        fetchOfflineFriends(),
      ]);
    } catch (e) {
      console.error("Error fetching friends data:", extractErrMsg(e));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const refresh = () => { // pull-to-refresh
    if (isLoading) return;
    offsetOffline.current = 0;
    offsetOnlineOrActive.current = 0;
    setOfflineFriends([]);
    setActiveFriends([]);
    setOnlineFriends([]);
    fetchData();
  }

  const loadMoreOffline = () => { // onEndReached
    if (isLoading || offlineFriends.length >= (currentUser.current?.offlineFriends?.length ?? 0)) return;
    fetchOfflineFriends();
  }
  const loadMoreOnlineOrActive = () => { // onEndReached
    if (isLoading || onlineFriends.length >= (currentUser.current?.onlineFriends?.length ?? 0) && activeFriends.length >= (currentUser.current?.activeFriends?.length ?? 0)) return;
    fetchOnlineOrActiveFriends();
  }


  // const FavoriteFriendsTab = () => { // 親componentでfetchしたfriendsを使い回す
  //   const [onlineFavoriteFriends, setOnlineFavoriteFriends] = useState<LimitedUserFriend[]>([]);
  //   const [activeFavoriteFriends, setActiveFavoriteFriends] = useState<LimitedUserFriend[]>([]);
  //   const [offlineFavoriteFriends, setOfflineFavoriteFriends] = useState<LimitedUserFriend[]>([]);
  //   const [isLoadingFavorite, setIsLoadingFavorite] = useState<boolean>(false);
  //   const [userState, setUserState] = useState<UserState>("online");
  //   const fetchFavorites = async () => {
  //     try {
  //       setIsLoadingFavorite(true);
  //       const resFavoritesList = await Promise.all(
  //         favoriteGroups.map( group => 
  //           vrc.favoritesApi.getFavorites(numPerReqForFavorites.current, 0, "friend", group.name) // fetch all
  //         )
  //       );
  //       const allFriendTypeFavorite = resFavoritesList.flatMap(res => res.data);
  //       const onlineOrActiveFF = onlineOrActiveFriends.filter(f => allFriendTypeFavorite.some(r => r.favoriteId === f.id));
  //       const offlineFF = offlineFavoriteFriends.filter(f => allFriendTypeFavorite.some(r => r.favoriteId === f.id));
  //       setOnlineFavoriteFriends(onlineOrActiveFF.filter(f => currentUser?.onlineFriends?.some(id => id === f.id)));
  //       setActiveFavoriteFriends(onlineOrActiveFF.filter(f => currentUser?.activeFriends?.some(id => id === f.id)));
  //       setOfflineFavoriteFriends(offlineFF);
  //     } catch (e) {
  //       console.error("Error fetching friends:", extractErrMsg(e));
  //     } finally {
  //       setIsLoadingFavorite(false);
  //     }
  //   };

  //   useEffect(() => {
  //     fetchFavorites();
  //   }, [onlineOrActiveFriends, offlineFriends]);

  //   return (
  //     <View style={{ flex: 1 }}>
  //       { (isLoadingFavorite || isLoading) && <LoadingIndicator absolute /> }
  //       <SelectGroupButton
  //         style={styles.selectGroupButton}
  //         data={["online", "active", "offline"] as UserState[]}
  //         value={userState}
  //         onChange={setUserState}
  //         nameExtractor={(item) => item}
  //       />
  //       <FlatList
  //         data={userState === "online" ? onlineFavoriteFriends : userState === "active" ? activeFavoriteFriends : offlineFavoriteFriends}
  //         keyExtractor={(item) => item.id}
  //         renderItem={({ item }) => (
  //           <ListViewUser user={item} style={styles.cardView} onPress={() => routeToUser(item.id)} />
  //         )}
  //         numColumns={1}
  //         onEndReached={userState === "offline" ? loadMoreOffline : loadMoreOnlineOrActive}
  //         onEndReachedThreshold={0.3}
  //         refreshing={isLoadingFavorite || isLoading}
  //         onRefresh={refresh}
  //       />

  //     </View>
  //   )
  // }
  const OnlineFriendsTab = () => {
    return (
      <>
        { isLoading && <LoadingIndicator absolute /> }
        <FlatList
          data={onlineFriends}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ListViewUser user={item} style={styles.cardView} onPress={() => routeToUser(item.id)} />
          )}
          numColumns={1}
          onEndReached={loadMoreOnlineOrActive}
          onEndReachedThreshold={0.3}
          refreshing={isLoading}
          onRefresh={refresh}
        />
      </>
    )
  }
  const ActiveFriendsTab = () => {
    return (
      <>
        { isLoading && <LoadingIndicator absolute /> }
        <FlatList
          data={activeFriends}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ListViewUser user={item} style={styles.cardView} onPress={() => routeToUser(item.id)} />
          )}
          numColumns={1}
          onEndReached={loadMoreOnlineOrActive}
          onEndReachedThreshold={0.3}
          refreshing={isLoading}
          onRefresh={refresh}
        />
      </>
    )
  }
  const OfflineFriendsTab = () => {
    return (
      <>
        { isLoading && <LoadingIndicator absolute /> }
        <FlatList
          data={offlineFriends}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ListViewUser user={item} style={styles.cardView} onPress={() => routeToUser(item.id)} />
          )}
          numColumns={1}
          onEndReached={loadMoreOffline}
          onEndReachedThreshold={0.3}
          refreshing={isLoading}
          onRefresh={refresh}
        />
      </>
    )
  }
  return (
    <GenericScreen>
      <MaterialTab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: theme.colors.background },
          tabBarIndicatorStyle: { backgroundColor: theme.colors.primary },
        }}
      >
        {/* <MaterialTab.Screen 
          name="favorite" 
          options={{tabBarLabel: "Favorite"}}
          component={FavoriteFriendsTab} 
        /> */}
        <MaterialTab.Screen 
          name="online" 
          options={{tabBarLabel: "Online"}}
          component={OnlineFriendsTab} 
        />
        <MaterialTab.Screen 
          name="active" 
          options={{tabBarLabel: "Active"}}
          component={ActiveFriendsTab} 
        />
        <MaterialTab.Screen 
          name="offline" 
          options={{tabBarLabel: "Offline"}}
          component={OfflineFriendsTab} 
        />
      </MaterialTab.Navigator>
    </GenericScreen>
  );
}

const styles = StyleSheet.create({
  cardView: {
    padding: spacing.small,
    width: "100%",
  },
  selectGroupButton: {
    padding: spacing.small,
    marginTop: spacing.medium,
  },
});
