import { Favorite, LimitedUserFriend } from "@/vrchat/api";
import { convertToLimitedUserInstance, InstanceLike, parseInstanceId, parseLocationString } from "../vrchat";

type LocationData = {
  location: string;
  friends?: LimitedUserFriend[];
  friendsCount?: number;
  hasFavoriteFriends?: boolean;
}

export function calcFriendsLocations(
  friends: LimitedUserFriend[], 
  favorites: Favorite[],
  onlyHasFavorites = false,
  includeUnlocatable = false,
): InstanceLike[] {
    if (!friends) return [];
    // create favoriteMap for quick lookup
    const favoriteMap: Record<string, boolean> = {};
    if (favorites) {
      for (const fav of favorites) {
        if (fav.type !== "friend") continue;
        favoriteMap[fav.favoriteId] = true;
      }
    }
    // group friends by instanceId
    // instanceId -> { friends: LimitedUserFriend[], length: number, hasFavorite: boolean }
    const map: Record<string, LocationData> = {};
    for (const friend of friends) {
      const location = friend.location;
      if (!includeUnlocatable && parseLocationString(location).parsedLocation == undefined) continue;
      if (!map[location]) {
        map[location] = { location, friends: [], friendsCount: 0, hasFavoriteFriends: false }
      };
      map[location].friends?.push(friend);
      map[location].friendsCount = (map[location].friendsCount ?? 0) + 1;
      if (favoriteMap[friend.id]) map[location].hasFavoriteFriends = true;

    }
    // convert to MinInstance[]
    const instanceFriends: (
      InstanceLike & {hasFavoriteFriends: boolean, friendsCount: number}
    )[] = [];
    Object.values(map).forEach((locData) => {
      if (onlyHasFavorites && !locData.hasFavoriteFriends) return;
      const { parsedLocation } = parseLocationString(locData.location);
      const parsedInstance = parseInstanceId(parsedLocation?.instanceId);
      if (!parsedLocation?.worldId || !parsedLocation?.instanceId || !parsedInstance) {
        if (includeUnlocatable) {
          locData.friends?.map(f => {
            const instance = {
              id: parsedLocation?.instanceId,
              instanceId: parsedLocation?.instanceId,
              worldId: parsedLocation?.worldId,
              location: locData.location,
              users: [convertToLimitedUserInstance(f)],
              n_users: -1,
              capacity: -1,
              type: parsedInstance?.type ?? "hidden",
              region: parsedInstance?.region ?? "unknown",
              name: parsedInstance?.name ?? "",
              // for sort, not from MinInstance interface
              hasFavoriteFriends: locData.hasFavoriteFriends ?? false,
              friendsCount: locData.friendsCount ?? 0,
            };

          }); 
        }
        return;
      }
      const instance = {
        id: parsedLocation?.instanceId,
        instanceId: parsedLocation?.instanceId,
        worldId: parsedLocation?.worldId,
        location: locData.location,
        users: locData.friends?.map(convertToLimitedUserInstance),
        n_users: -1,
        capacity: -1,
        type: parsedInstance?.type ?? "hidden",
        region: parsedInstance?.region ?? "unknown",
        name: parsedInstance?.name ?? "",
        // for sort, not from MinInstance interface
        hasFavoriteFriends: locData.hasFavoriteFriends ?? false,
        friendsCount: locData.friendsCount ?? 0,
      };
      instanceFriends.push(instance);
    });
    const sorted = instanceFriends.sort((a, b) => {
      if (a.hasFavoriteFriends && !b.hasFavoriteFriends) return -1;
      if (!a.hasFavoriteFriends && b.hasFavoriteFriends) return 1;
      // both have or both not have favorite, sort by length desc
      const aCount = a.friendsCount ?? 0;
      const bCount = b.friendsCount ?? 0;
      if (aCount !== bCount) return bCount - aCount;
      return a.type.localeCompare(b.type);
    });
    return sorted;
  }
