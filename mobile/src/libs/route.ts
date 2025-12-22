import { push, replace } from "expo-router/build/global-state/routing";


export const routeToIndex = () => replace("/"); // use replace to avoid going back to login screen
export const routeToHome = () => replace("/maintabs/home"); // use replace to avoid going back to login screen

// Detail routes
export const routeToUser = (id:string) => push(`/details/user/${id}`);
export const routeToWorld = (id:string) => push(`/details/world/${id}`);
export const routeToAvatar = (id:string) => push(`/details/avatar/${id}`);
export const routeToGroup = (id:string) => push(`/details/group/${id}`);
export const routeToInstance = (wrldId:string, instId: string) => push(`/details/instance/${wrldId}:${instId}`);

// Settings routes
export const routeToAppearanceSettings = () => push(`/settings/appearance`);
export const routeToDatabaseSettings = () => push(`/settings/database`);
export const routeToNotificationSettings = () => push(`/settings/notifications`);

// Others routes
export const routeToSearch = (search?:string) => {
  const q = [];
  if (search) q.push(`search=${search}`);
  push(`/others/search?${q.join("&")}`);
};
export const routeToFavorites = () => push(`/others/favorites`);
export const routeToResources = () => push(`/others/resources`);
export const routeToFriendLocations = () => push(`/others/friendlocations`);
export const routeToEvents = () => push(`/others/events`);
export const routeToFeeds = () => push(`/others/feeds`);
export const routeToNotifications = () => push(`/others/notifications`);
