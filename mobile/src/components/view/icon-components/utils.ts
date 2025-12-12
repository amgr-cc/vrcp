import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

type MaterialIconsName = keyof typeof MaterialIcons.glyphMap;
type MaterialCommunityIconsName = keyof typeof MaterialCommunityIcons.glyphMap;

export type SupportedIconNames = MaterialIconsName | MaterialCommunityIconsName;

export const isMaterialIconsName = (iconName: string): iconName is MaterialIconsName => {
  return iconName in MaterialIcons.glyphMap;
};

