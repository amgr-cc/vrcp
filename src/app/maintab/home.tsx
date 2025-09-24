import GenericScreen from "@/components/layout/GenericScreen";
import CardViewLocation, { LocationData } from "@/components/view/item-CardView/CardViewLocation";
import globalStyles, { spacing } from "@/config/styles";
import { useData } from "@/contexts/DataContext";
import { useVRChat } from "@/contexts/VRChatContext";
import { parseLocationString } from "@/lib/vrchatUtils";
import { LimitedUserFriend } from "@/vrchat/api";
import { Button } from "@react-navigation/elements";
import { useTheme } from "@react-navigation/native";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";


export default function Home() {
  const theme = useTheme();
  const vrc = useVRChat();  
  const { friends, favorites } = useData();

  const locationData = useMemo<LocationData[]>(() => {
    if (!friends.data) return [];
    // create favoriteMap for quick lookup
    const favoriteMap: Record<string, boolean> = {};
    if (favorites.data) {
      for (const fav of favorites.data) {
        if (fav.type !== "friend") continue;
        favoriteMap[fav.favoriteId] = true;
      }
    }
    // group friends by instanceId
    // instanceId -> { friends: LimitedUserFriend[], length: number, hasFavorite: boolean }
    const map: Record<string, LocationData> = {};
    for (const friend of friends.data) {
      const location = friend.location;
      if (parseLocationString(location).parsedLocation == undefined) continue;
      if (!map[location]) {
        map[location] = { location, friends: [], friendsCount: 0, hasFavoriteFriends: false }
      };
      map[location].friends?.push(friend);
      map[location].friendsCount = (map[location].friendsCount ?? 0) + 1;
      if (favoriteMap[friend.id]) map[location].hasFavoriteFriends = true;

    }
    const instanceFriends = Object.values(map).map(({ location, friends, friendsCount, hasFavoriteFriends }) => ({ location, friends, friendsCount, hasFavoriteFriends }));
    const sorted = instanceFriends.sort((a, b) => {
      if (a.hasFavoriteFriends && !b.hasFavoriteFriends) return -1;
      if (!a.hasFavoriteFriends && b.hasFavoriteFriends) return 1;
      // both have or both not have favorite, sort by length desc
      const aCount = a.friendsCount ?? 0;
      const bCount = b.friendsCount ?? 0;
      if (aCount !== bCount) return bCount - aCount;
      return a.location.localeCompare(b.location);
    });
    return sorted;
  }, [friends.data, favorites.data]);

  return (
    <GenericScreen>
      <View style={styles.container}>
        <FlatList
          data={locationData}
          keyExtractor={(item) => item.location}
          renderItem={({ item }) => (
            <CardViewLocation locationData={item} style={styles.cardView} />
          )}
          ListEmptyComponent={() => (
            <View style={{ alignItems: "center", marginTop: spacing.large }}>
              <Text style={{ color: theme.colors.text }}>No friends online in instances.</Text>
            </View>
          )}
          numColumns={2}
        />
      </View>
    </GenericScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.mini,
    // borderStyle:"dotted", borderColor:"red",borderWidth:1
  },
  cardView: {
    padding: spacing.small,
    width: "50%",
  },
});