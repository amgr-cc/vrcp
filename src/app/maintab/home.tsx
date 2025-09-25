import GenericScreen from "@/components/layout/GenericScreen";
import CardViewInstance from "@/components/view/item-CardView/CardViewInstance";
import globalStyles, { spacing } from "@/config/styles";
import { useData } from "@/contexts/DataContext";
import { useVRChat } from "@/contexts/VRChatContext";
import { calcFriendsLocations } from "@/lib/funcs/calcFriendLocations";
import { routeToInstance, routeToWorld } from "@/lib/route";
import { convertToLimitedUserInstance, getInstanceType, InstanceLike, parseInstanceId, parseLocationString } from "@/lib/vrchat";
import { Favorite, LimitedUserFriend } from "@/vrchat/api";
import { Button } from "@react-navigation/elements";
import { useTheme } from "@react-navigation/native";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";



export default function Home() {
  const theme = useTheme();
  const vrc = useVRChat();  
  const { friends, favorites } = useData();

  const instances = useMemo<InstanceLike[]>(() => {
    return calcFriendsLocations(friends.data, favorites.data, true, false);
  }, [friends.data, favorites.data]);

  return (
    <GenericScreen>
      <View style={styles.container}>
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