import { TouchableOpacity } from "@/components/CustomElements";
import GenericModal from "@/components/layout/GenericModal";
import { ButtonItemForFooter } from "@/components/layout/type";
import IconSymbol from "@/components/view/icon-components/IconView";
import { SupportedIconNames } from "@/components/view/icon-components/utils";
import { fontSize, radius, spacing } from "@/configs/styles";
import { Setting } from "@/contexts/SettingContext";
import { Text } from "@react-navigation/elements";
import { useTheme } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

type HomeTopVariant = Setting["uiOptions"]["layouts"]["homeTabTopVariant"];
type HomeBottomVariant = Setting["uiOptions"]["layouts"]["homeTabBottomVariant"];
type HomeSepPos = Setting["uiOptions"]["layouts"]["homeTabSeparatePos"];

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
  defaultValue: {
    top?: HomeTopVariant;
    bottom?: HomeBottomVariant;
    sepPos?: HomeSepPos;
  } | undefined;
  onSubmit?: (value: {
    top: HomeTopVariant;
    bottom: HomeBottomVariant;
    sepPos: HomeSepPos;
  }) => void;
}

export const getIconName = (v: HomeTopVariant | HomeBottomVariant): SupportedIconNames => {
  if (v === 'friend-locations') return 'map';
  if (v === 'feeds') return 'rss';
  if (v === 'events') return 'calendar';
  return 'home';
};

const getButtonText = (v: HomeTopVariant | HomeBottomVariant): string => {
  if (v === 'friend-locations') return "Locations";
  if (v === 'feeds') return "Feeds";
  if (v === 'events') return "Events";
  return "";
}

const getTextLabel = (v: HomeTopVariant | HomeBottomVariant): string => {
  if (v === 'friend-locations') return "Friend Locations";
  if (v === 'feeds') return "Feeds of your friends";
  if (v === 'events') return "Group Events";
  return "It may require restarting the app.";
}

const HomeTabModeModal = ({ open, setOpen, defaultValue, onSubmit }: Props) => {
  const theme = useTheme();
  const [ selectedValue, setSelectedValue ] = useState<{ top: HomeTopVariant; bottom: HomeBottomVariant; sepPos: HomeSepPos }>({
    top: defaultValue?.top || 'feeds',
    bottom: defaultValue?.bottom || 'friend-locations',
    sepPos: defaultValue?.sepPos || 30,
  });

  useEffect(() => {
    if (!defaultValue) return;
    const newvalue = {
      top: defaultValue.top || 'feeds',
      bottom: defaultValue.bottom || 'friend-locations',
      sepPos: defaultValue.sepPos || 30,
    }
    setSelectedValue(newvalue);
  }, [defaultValue]);

  const buttonItems: ButtonItemForFooter[] = [
    {
      // use button as text display only
      title: getTextLabel(selectedValue.top ?? "events"),
      flex: 1,
      variant: "plain",
    },
    {
      title: "Apply",
      onPress: () => {
        onSubmit?.(selectedValue);
        setOpen(false);
      },
    },
  ];


  

  return (
      <GenericModal
        showCloseButton
        open={open}
        onClose={() => setOpen(false)}
        buttonItems={buttonItems}
      >
        <View style={styles.container }>
          <View style={styles.variantsContainer}>
            <View>
              <Text style={{ color: theme.colors.subText, textAlign: "center" }}>
                top section
              </Text>
              <View style={styles.iconButtonContainer}>
                {['friend-locations', 'feeds', 'events' ].map((value) => (
                  <TouchableOpacity
                    key={`color-schema-option-${value}`}
                    style={[styles.item, { borderColor: value === selectedValue.top ? theme.colors.primary : theme.colors.border }]}
                    onPress={() => {
                      setSelectedValue(prev => ({
                        ...prev,
                        top: value as HomeTopVariant,
                      }));
                    }}
                  >
                    <IconSymbol
                      name={getIconName(value as HomeTopVariant)}
                      size={32}
                      color={theme.colors.text}
                    />
                    <Text style={[{ color: theme.colors.text, fontSize: fontSize.small }]}>
                      {getButtonText(value as HomeTopVariant)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View>
              <Text style={{ color: theme.colors.subText, textAlign: "center" }}>
                bottom section
              </Text>
              <View style={styles.iconButtonContainer}>
                {['friend-locations', 'feeds', 'events' ].map((value) => (
                  <TouchableOpacity
                    key={`color-schema-option-${value}`}
                    style={[styles.item, { borderColor: value === selectedValue.bottom ? theme.colors.primary : theme.colors.border }]}
                    onPress={() => {
                      setSelectedValue(prev => ({
                        ...prev,
                        bottom: value as HomeBottomVariant,
                      }));
                    }}
                  >
                    <IconSymbol
                      name={getIconName(value as HomeBottomVariant)}
                      size={32}
                      color={theme.colors.text}
                    />
                    <Text style={[{ color: theme.colors.text, fontSize: fontSize.small }]}>
                      {getButtonText(value as HomeBottomVariant)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          
          <View style={styles.sepPosContainer}>  
            <Text style={{ color: theme.colors.subText, textAlign: "center" }}>
              Separator Position: {selectedValue.sepPos ?? 30}%
            </Text>
          </View>
        </View>
      </GenericModal>
  )
}




const styles = StyleSheet.create({
    // innermodal styles
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.medium,
  },
  variantsContainer: {
    width: "75%",
    gap: spacing.medium,
  },
  sepPosContainer:{
    width: "20%",
  },
  iconButtonContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  item: {
    width: "32%",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.small,
    borderStyle: "solid", 
    borderWidth: 1,
    borderRadius: radius.small,
  },
  icon: {},
});


export default HomeTabModeModal;