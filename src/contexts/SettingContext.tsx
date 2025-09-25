import { createContext, useContext } from "react";


// provide user settings globally,
// all data stored in async storage with prefix: "setting_"


interface SettingContextType {
  homeTabMode?: "default" | "locations" | "feeds"; // default: favFriLocs and simpleFeeds
  searchOptions?: {
    worlds?: {sort?: string, order?: "asc" | "desc"};
    avatars?: {sort?: string, order?: "asc" | "desc"};
    users?: {sort?: string, order?: "asc" | "desc"};
  },
  colorOptions?: {
    favoriteFriendsColors?: {[favoriteGroupId: string]: string};
    trustRankColors?: {[rank: string]: string};
    userColors?: {[userId: string]: string};

  }
  // more settings to be added
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
  return (
    <Context.Provider value={{}}>
      {children}
    </Context.Provider>
  );
}

export { SettingProvider, useSetting };