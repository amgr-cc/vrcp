import GenericScreen from "@/components/layout/GenericScreen";
import globalStyles from "@/config/styles";
import texts from "@/config/texts";
import { useData } from "@/contexts/DataContext";
import { Button } from "@react-navigation/elements";
import { useTheme } from "@react-navigation/native";
import { navigate } from "expo-router/build/global-state/routing";
import { StyleSheet, Text } from "react-native";

export default function Home() {
  const theme = useTheme();
  const {currentUser} = useData();

  return (
    <GenericScreen>
      <Text style={[globalStyles.text, {color: theme.colors.text}]}>{texts.welcome}</Text>
      <Text style={[globalStyles.text, {color: theme.colors.subText, fontSize: 20}]}>
        Favorite friends and their Locations,
      </Text>
      <Button onPress={() => {navigate("/_sitemap")}} >SiteMap</Button>

      <Text style={[globalStyles.text, {color: theme.colors.subText}]}>
        [ToDo]  
        - Webhook for Feed,
        - GloballyStateControl for Favorite Friend, Active-Online-Offline Friends
      </Text>

      
      <Text style={[globalStyles.text, {color: theme.colors.text}]}>
        {currentUser.data ? `Logged in as ${currentUser.data.displayName} (${currentUser.data.id})` : "Not logged in" }
      </Text>
    </GenericScreen>
  );
}

const styles = StyleSheet.create({
  
})

