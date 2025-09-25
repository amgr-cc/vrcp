import { fontSize, radius, spacing } from "@/config/styles";
import { CachedImage } from "@/contexts/CacheContext";
import { omitObject } from "@/lib/utils";
import { getStatusColor, getTrustRankColor, getUserIconUrl, UserLike } from "@/lib/vrchat";
import { Text } from "@react-navigation/elements";
import React from "react";
import { StyleSheet, View } from "react-native";
import IconSymbol from "../icon-components/IconView";
import { useTheme } from "@react-navigation/native";
import { SupportedIconNames } from "../icon-components/utils";



interface Props {
  user: UserLike;
  optional?: boolean; //
  size?: number; // default 32
  textSize?: number;
  textColor?: string;
  icon?: SupportedIconNames;
  [key: string]: any;
}

const UserChip = ({ user, icon, textSize, textColor, size = 32, ...rest }: Props) => {
  const theme = useTheme()
  return (
    <View style={[styles.container, rest.style]}>
      
      {icon && (
        <IconSymbol name={icon} size={size/2} style={styles.option} />
      )}

      <CachedImage
        src={getUserIconUrl(user)}
        style={[styles.icon, { height: size, borderColor: getStatusColor(user)}, rest.style]}
        {...omitObject(rest, "style")}
      />
      <Text numberOfLines={1} style={[styles.text, { color: textColor ?? theme.colors.text, fontSize: textSize ?? fontSize.medium }]}>{user.displayName}</Text>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    flexGrow: 1,
    flexShrink: 1,
    marginRight: spacing.small,
    marginLeft: spacing.mini,
    // borderColor: "red", borderStyle: "dotted", borderWidth: 1,
  },
  icon : {
    borderRadius: radius.all,
    aspectRatio: 1,
    margin: spacing.small
  },
  option: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
  }
});

export default React.memo(UserChip);