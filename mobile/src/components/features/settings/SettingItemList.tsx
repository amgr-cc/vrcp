import IconSymbol from "@/components/view/icon-components/IconView";
import { SupportedIconNames } from "@/components/view/icon-components/utils";
import globalStyles, { fontSize, spacing } from "@/configs/styles";
import { omitObject } from "@/libs/utils";
import { Text } from "@react-navigation/elements";
import { useTheme } from "@react-navigation/native";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import SettingItem, { SettingItemProps } from "./SettingItem";

interface SettingItemGroup {
  title: string;
  items: SettingItemProps[];
}
export type SettingItemListContents = SettingItemGroup[];

interface SettingItemListProps {
  contents: SettingItemListContents;
}

const SettingItemList = ({
  contents,
  ...rest
}: SettingItemListProps ) => {
  const theme = useTheme();
  return (
    <View {...rest}>
      {contents.map((grp) => (
        <View key={grp.title} style={styles.categoryContainer}>
          <Text style={[globalStyles.header, { color: theme.colors.text }]}>
            {grp.title}
          </Text>
          {grp.items.map((item, index) => (
            <SettingItem
              key={index}
              {...item}
            />
          ))}
        </View>
      ))}
    </View>
  );
}



const styles = StyleSheet.create({
  categoryContainer: {
    padding: spacing.medium,
  },
  listItemContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: spacing.medium,

    borderWidth: 1,
    borderStyle: "solid",
  },
  listItemLabel: {
    marginLeft: spacing.medium,
  },
});

export default SettingItemList
