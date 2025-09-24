import { fontSize, radius, spacing } from "@/config/styles";
import { CachedImage } from "@/contexts/CacheContext";
import { omitObject } from "@/lib/objectUtils";
import { getStatusColor, getUserIconUrl, UserLike } from "@/lib/vrchatUtils";
import { Text } from "@react-navigation/elements";
import React from "react";
import { StyleSheet, View } from "react-native";



interface Props {
  user: UserLike;
  size?: number; // default 32
  textSize?: number;
  [key: string]: any;
}

const UserChip = ({ user, textSize, size = 32, ...rest }: Props) => {
  return (
    <View style={[styles.container, rest.style]}>
      <CachedImage
        src={getUserIconUrl(user)}
        style={[styles.icon, { height: size, borderColor: getStatusColor(user)}, rest.style]}
        {...omitObject(rest, "style")}
      />
      <Text numberOfLines={1} style={[styles.text, { fontSize: textSize ?? fontSize.medium }]}>{user.displayName}</Text>
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
  }
});

export default React.memo(UserChip);