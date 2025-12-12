import { push } from "expo-router/build/global-state/routing";

export const routeToSearch = (search?:string) => {
  const q = []; 
  if (search) q.push(`search=${search}`);
  if (q.length) {
    push(`/other/search?${q.join("&")}`);
  } else {
    push(`/other/search`);
  }
};
export const routeToFriendLocations = () => push(`/other/friendlocations`);
export const routeToFeeds = () => push(`/other/feeds`);
export const routeToEvents = () => push(`/other/events`);

export const routeToUser = (id:string) => push(`/other/user/${id}`);
export const routeToWorld = (id:string) => push(`/other/world/${id}`);
export const routeToAvatar = (id:string) => push(`/other/avatar/${id}`);
export const routeToGroup = (id:string) => push(`/other/group/${id}`);
export const routeToInstance = (wrldId:string, instId: string) => push(`/other/instance/${wrldId}:${instId}`);