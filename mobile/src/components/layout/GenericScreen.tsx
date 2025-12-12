import { spacing } from "@/configs/styles";
import { DrawerRouter, useTheme } from "@react-navigation/native";
import { useFocusEffect, usePathname, useRootNavigationState, useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SupportedIconNames } from "../view/icon-components/utils";
import { useMenu } from "@/contexts/MenuContext";
import { Drawer } from 'react-native-drawer-layout';
import { Text } from "@react-navigation/elements";
import { useCallback, useEffect } from "react";
import IconSymbol from "../view/icon-components/IconView";
import { MenuItem } from "./type";
import { ScrollView } from "react-native-gesture-handler";

interface Props {
  menuItems?: MenuItem[];
  scrollable?: boolean;
  children: React.ReactNode;
}

const GenericScreen = ({
  menuItems,
  scrollable = false,
  children,
}: Props) => {
  const theme = useTheme();
  const pathname = usePathname();
  const { openMenu, setOpenMenu } = useMenu();

  useEffect(() => {
    if (!openMenu) return;
    setOpenMenu(false); // close menu on path change
  }, [pathname]);

  if (menuItems !== undefined) {
    return (
      <View style={styles.screenRoot}>
        
        <Drawer
          direction="rtl"
          drawerStyle={[styles.drawer, { backgroundColor: theme.colors.card }]}
          open={openMenu}
          onOpen={() => setOpenMenu(true)}
          onClose={() => setOpenMenu(false)}
          renderDrawerContent={() => (
            <DrawerContent menuItems={menuItems} setOpenMenu={setOpenMenu} />
          )}
        >
          <ChildContainer scrollable={scrollable}>{children}</ChildContainer>
        </Drawer>
      </View>
    );
  } else {
    return (
      <View style={styles.screenRoot}>
        <ChildContainer scrollable={scrollable}>{children}</ChildContainer>
      </View>
    );
  } 
};

const ChildContainer = ({ scrollable, children }: { scrollable: boolean; children: React.ReactNode }) => {
  if (scrollable) {
    return (
      <ScrollView
        contentContainerStyle={styles.screenContainer}
      >
        {children}
      </ScrollView>
    );
  } else {
    return (
      <View 
        style={styles.screenContainer}
      >
        {children}
      </View>
    );
  }
};

const DrawerContent = ({
  menuItems,
  setOpenMenu,
}: {
  menuItems?: MenuItem[];
  setOpenMenu: (open: boolean) => void;
}) => {
  const theme = useTheme();
  return (
    <View>
      {menuItems?.map((item, index) => {
        if (item.hidden) { // skip hidden items
          return null;
        }
        // handle divider
        if (item.type === "divider") {
          return (
            <View key={`menu-item-${index}-${item.title}`} style={[styles.drawerItemDivider, { borderBottomColor: theme.colors.subText }]} />
          );
        }
        // handle normal item(= button)
        const onPress = () => {
          item.onPress?.();
          setOpenMenu(false);
        }
        return (
          <TouchableOpacity key={`menu-item-${index}-${item.title}`} onPress={onPress} style={styles.drawerItemContainer}>
            {item.icon && (
              <IconSymbol name={item.icon} size={20} color={theme.colors.text} />
            )}
            <Text style={{ color: theme.colors.text }}>{item.title}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    // attach to Root-View
    flex: 1,
  },
  drawer: {
    right: 0,
    width: 200,
    maxWidth: "66%",
    // borderColor: "red", borderStyle: "dashed", borderWidth: 1,
  },
  drawerItemContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.medium,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.large,
    // borderColor: "blue", borderStyle: "dashed", borderWidth: 1,
  },
  drawerItemDivider: {
    marginHorizontal: spacing.medium,
    borderBottomWidth: 1,
    marginVertical: spacing.small,
  },
  screenContainer: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
    paddingHorizontal: spacing.small,

    // borderColor: "blue", borderStyle: "dashed", borderWidth: 1,
  },
});

export default GenericScreen;
