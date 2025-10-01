import AsyncStorage from "expo-sqlite/kv-store";
import { createContext, useContext, useEffect, useState } from "react";


// provide user settings globally,
// all data stored in async storage with prefix: "setting_"

type HomeTabMode = "default" | "friend-locations" | "feeds"| "calendar" ;
interface SearchOption {
  worlds: {sort?: string, order?: "asc" | "desc"};
  avatars: {sort?: string, order?: "asc" | "desc"};
  users: {sort?: string, order?: "asc" | "desc"};
}
interface ColorOption {
  useUserColor: boolean; 
  userColors: {[userId: string]: string}; // disabled if useUserColor is false
  useFriendColor: boolean;
  friendColor: string | undefined; // disabled if useFriendColor is false
  favoriteFriendsColors: {[favoriteGroupId: string]: string};// disabled if useFriendColor is false
}
interface NotificationOption {
  usePushNotification: boolean;
  allowedNotificationTypes: string[]; // e.g. ["friend-online" ]
}
interface PipelineOption {
  keepMsgNum:  number; // how many feeds to keep, default 100
}

interface Setting {
  homeTabMode: HomeTabMode;
  searchOptions: SearchOption;
  colorOptions: ColorOption;
  notificationOptions: NotificationOption;
  pipelineOptions: PipelineOption;
}

const defaultSettings: Setting = {
  homeTabMode: "default",
  searchOptions: {
    worlds: {},
    avatars: {},
    users: {},
  },
  colorOptions: {
    useUserColor: false,
    userColors: {},
    useFriendColor: false,
    friendColor: undefined,
    favoriteFriendsColors: {},
  },
  notificationOptions: {
    usePushNotification: false,
    allowedNotificationTypes: [],
  },
  pipelineOptions: {
    keepMsgNum: 100,
  },
}

interface SettingContextType {
  settings: Setting;
  saveSettings: (newSettings: Partial<Setting>) => Promise<void>;
  loadSettings: () => Promise<Setting>;
}
const Context = createContext<SettingContextType | undefined>(undefined);

const useSetting = () => {
  const context = useContext(Context);
  if (!context) throw new Error("useSetting must be used within a SettingContextProvider");
  return context;
} 

const SettingProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<Setting>(defaultSettings);
  useEffect(() => {
    // Load settings from async storage on mount
    loadSettings().then(loadedSettings => {
      setSettings(loadedSettings);
    });
  }, []);
  
  const saveSettings = async (newSettings: Partial<Setting>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    // Save settings to async storage
    const entries = Object.entries(newSettings).map(([key, value]) => [
      `setting_${key}`,
      JSON.stringify(value),
    ] as [string, string]);
    await AsyncStorage.multiSet(entries);
  };

  const loadSettings = async (): Promise<Setting> => {
    // Load settings from async storage
    const storedSettings = await AsyncStorage.multiGet([
      "setting_homeTabMode",
      "setting_searchOptions",
      "setting_colorOptions",
      "setting_notificationOptions",
    ]);
    const newSettings = { ...defaultSettings };
    storedSettings.forEach(([key, value]) => {
      if (value !== null) {
        const settingKey = key.replace("setting_", "") as keyof Setting;
        newSettings[settingKey] = JSON.parse(value);
      }
    });
    return newSettings;
  }

  return (
    <Context.Provider value={{
      settings,
      saveSettings,
      loadSettings,
    }}>
      {children}
    </Context.Provider>
  );
}

export { SettingProvider, useSetting };