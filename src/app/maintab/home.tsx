import GenericScreen from "@/components/layout/GenericScreen";
import CardViewInstance from "@/components/view/item-CardView/CardViewInstance";
import ListViewPipelineMessage from "@/components/view/item-ListView/ListViewPipelineMessage";
import LoadingIndicator from "@/components/view/LoadingIndicator";
import { spacing } from "@/configs/styles";
import { useData } from "@/contexts/DataContext";
import { useVRChat } from "@/contexts/VRChatContext";
import SeeMoreContainer from "@/features/home/SeeMoreContainer";
import { calcFriendsLocations } from "@/libs/funcs/calcFriendLocations";
import { routeToFeeds, routeToFriendLocations, routeToInstance, routeToWorld } from "@/libs/route";
import { InstanceLike } from "@/libs/vrchat";
import { PipelineMessage } from "@/vrchat/pipline/type";
import { useTheme } from "@react-navigation/native";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";



export default function Home() {
  const theme = useTheme();
  const { pipelineMessages } = useData();
  const { friends, favorites } = useData();

  const instances = useMemo<InstanceLike[]>(() => {
    return calcFriendsLocations(friends.data, favorites.data, true, false);
  }, [friends.data, favorites.data]);


  return (
    <GenericScreen>
      {/* Feeds */}
      <SeeMoreContainer
        title="Feeds"
        onPress={() => routeToFeeds()}
        style={{maxHeight: "30%" }}
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

      {/* FriendLocation */}
      <SeeMoreContainer
        title="Friends Locations"
        onPress={() => routeToFriendLocations()}
        style={{maxHeight: "70%" }}
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