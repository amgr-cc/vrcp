import GenericScreen from "@/components/layout/GenericScreen";
import globalStyles from "@/config/styles";
import { useVRChat } from "@/contexts/VRChatContext";
import { Button } from "@react-navigation/elements";
import { useTheme } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";

const TODO_TEXT = `
[ToDo]  
  - webhook for Feed,
  - globally state controll
    - how to handle data pagenation?
    - how to handle data update?
  - push notification for Feed update
`;

export default function Home() {
  const theme = useTheme();
  const vrc = useVRChat();

  const [msgs, setMsgs] = useState<{
    mode: "send" | "recv" | "info",
    data: string
  }[]>([]);

  useEffect(() => {
    if (!vrc.pipeline?.lastMessage) return ;
    const msg = vrc.pipeline.lastMessage;
    const ctt = JSON.stringify(msg.content, null, 2);
    setMsgs((prev) => [...prev, {mode: "recv", data: `[${msg.type}] ${ctt}`}]);
  }, [vrc.pipeline?.lastMessage])

  return (
    <GenericScreen>

      <Text style={[globalStyles.text, {color: theme.colors.text}]}>
        {TODO_TEXT}
      </Text>
      
      {/* Standard WebSocket Test */}
      <View >
        <View style={{display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <Button onPress={() => {
            setMsgs([]);
          }} > Clear </Button>
        </View>
        <FlatList
          data={msgs}
          renderItem={({ item }) => (
            <Text style={[globalStyles.text, {color: item.mode === "send" ? theme.colors.primary : item.mode === "recv" ? theme.colors.notification : theme.colors.text, marginBottom: 4}]}>
              [{item.mode}] {item.data}
            </Text>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    </GenericScreen>
  );
}