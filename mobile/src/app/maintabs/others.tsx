import GenericScreen from "@/components/layout/GenericScreen";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { MenuItem } from "@/components/layout/type";
import Feeds from "../others/feeds";
import Events from "../others/events";
import Notifications from "../others/notifications";

export default function Others() {
  const theme = useTheme();
  const { t } = useTranslation ();
  const MaterialTab = createMaterialTopTabNavigator();


  const menuItems: MenuItem[] = [
    {
      icon: "bell-outline",
      title: t("pages.others.menuLabel_notifications"),
      onPress: () => {}
    }
  ];

  return (
    <GenericScreen menuItems={menuItems}>
      <MaterialTab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: theme.colors.background },
          tabBarIndicatorStyle: { backgroundColor: theme.colors.primary },
        }}
      >
        <MaterialTab.Screen
          name="events"
          options={{ tabBarLabel: t("pages.others.tabLabel_events") }}
          component={Events} //
        />
        <MaterialTab.Screen
          name="feeds"
          options={{ tabBarLabel: t("pages.others.tabLabel_feeds") }}
          component={Feeds} //
        />
        <MaterialTab.Screen
          name="notifications"
          options={{ tabBarLabel: t("pages.others.tabLabel_notifications") }}
          component={Notifications} //
        />
      </MaterialTab.Navigator>
    </GenericScreen>
  );
};


