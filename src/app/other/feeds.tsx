import GenericScreen from "@/components/layout/GenericScreen";
import ListViewPipelineMessage from "@/components/view/item-ListView/ListViewPipelineMessage";
import { navigationBarHeight, spacing } from "@/configs/styles";
import { useData } from "@/contexts/DataContext";
import { useTheme } from "@react-navigation/native";
import { FlatList, StyleSheet, Text, View } from "react-native";



export default function Feeds() {
  const theme = useTheme();
  const { pipelineMessages } = useData();

  return (
    <GenericScreen>
      <View style={styles.container} >
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
          contentContainerStyle={styles.flatlistInner}
        />
      </View>
    </GenericScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatlistInner: {
    paddingTop: spacing.medium,
    paddingBottom: navigationBarHeight
  },
  feed: {
    width: "100%",
  },
  cardView: {
    width: "50%",
  },
});