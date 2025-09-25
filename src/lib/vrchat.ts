import { Avatar, CurrentUser, FavoritedWorld, Group, GroupAccessType, Instance, InstanceRegion, InstanceType, LimitedGroup, LimitedUserFriend, LimitedUserInstance, LimitedUserSearch, LimitedWorld, User, UserState, World } from "@/vrchat/api";
export type UserLike = LimitedUserSearch | LimitedUserFriend | LimitedUserInstance | User | CurrentUser
export type WorldLike = LimitedWorld | FavoritedWorld | World
export type GroupLike = LimitedGroup | Group
export type AvatarLike = Avatar
export type InstanceLike = MinInstance | Instance


export type TrustRank = "legend" | "trusted" | "known" | "user" | "new_user" | "visitor" | "nuisance";

type StatusGettableUser = Exclude<UserLike, LimitedUserInstance>

// 最低限のInstance情報だけを持つ型 (Worldに付随した部分的なInstance情報に対応)
type MinInstance = Pick< Instance, "id" | "instanceId" | "worldId" | "name" | "n_users" | "capacity" | "type" | "groupAccessType" | "region"> 
  & Partial<Exclude< Instance, "id" | "instanceId" | "worldId" | "name" | "n_users" | "capacity" | "type" | "groupAccessType" | "region">>;


// get ImageUrls from user 

export function getUserIconUrl(user: UserLike): string {
  if (user.userIcon && user.userIcon.length > 0) {
    return user.userIcon;
  }
  if (user.profilePicOverride && user.profilePicOverride.length > 0) {
    return user.profilePicOverride;
  }
  return user.currentAvatarThumbnailImageUrl ?? user.currentAvatarImageUrl;
}
export function getUserProfilePicUrl(user: UserLike): string {
  if (user.profilePicOverride && user.profilePicOverride.length > 0) {
    return user.profilePicOverride;
  }
  return user.currentAvatarThumbnailImageUrl ?? user.currentAvatarImageUrl;
}


// parse location string

export function parseLocationString(location: string| undefined): 
{
  isOffline?: boolean;
  isPrivate?: boolean;
  isTraveling?: boolean;
  parsedLocation?: { 
    worldId?: string; 
    instanceId?: string;
  }
} {
  try {
    if (!location || location.length === 0) return {};
    if (location == "offline") return { isOffline: true };
    if (location == "private") return { isPrivate: true };
    if (location == "traveling") return { isTraveling: true };
    const splited = location.split(":");
    let worldId = undefined, instanceId = undefined;
    if (splited.length < 2) {
      if (splited[0].startsWith("wrld_")) {
        worldId = splited[0];
      } else {
        instanceId = splited[0];
      }
    } else {
      worldId = splited[0];
      instanceId = splited[1];
    }
    return {
      parsedLocation: { worldId, instanceId }
    };
  } catch (e) {
    return {};
  }
}

export function parseInstanceId(instanceId: string | undefined): {
  name: string; 
  type: InstanceType;
  groupAccessType?: GroupAccessType;
  region?: InstanceRegion

  hidden?: string;
  friends?: string;
  private?: string;
  group?: string;
} | undefined {
  if (!instanceId) return undefined;
  const splitedInst = instanceId.split("~");
  const name = splitedInst[0]; // 

  const parseByReg = (type: string) => {
    const regRes = splitedInst.find(s => s.startsWith(`${type}(`))?.match(/\((.+?)\)/)
    return regRes && regRes.length > 1 ? regRes[1] : undefined;
  }

  const parsed = {
    region : (parseByReg("region") ?? "unknown" )as InstanceRegion,
    groupAccessType: parseByReg("groupAccessType") as GroupAccessType | undefined,
    // types
    hidden : parseByReg("hidden"),
    friends : parseByReg("friends"),
    private : parseByReg("private"),
    group : parseByReg("group"),
  }

  const type = parsed.hidden ? "hidden" 
    : parsed.friends ? "friends" 
    : parsed.private ? "private" 
    : parsed.group ? "group" 
    : "public"; // default to public (no-type provide)

  return { name, type, ...parsed };
}

// Get instance type with DisplayName (ex.Friends+) 
export function getInstanceType(type:InstanceType, groupAccessType?: GroupAccessType) {
  if (type === "public") return "Public";
  if (type === "hidden") return "Friends+";
  if (type === "friends") return "Friends";
  if (type === "private") return "Private"; // Invite or Invite+
  if (type === "group") {// GroupOnly or Group+ or GroupPublic
    if (groupAccessType === "members") return "Group";
    if (groupAccessType === "plus") return "Group+";
    if (groupAccessType === "public") return "GroupPublic";
    return "Group";
  }
  return "unknown";
}

export function getState(user: LimitedUserFriend): UserState | undefined {
  if (user.platform == "web") return "active"; 
  if (user.status !== "offline" ) return "online"; 
  if (user.location != "") return "offline";
  return undefined;
}


export function getStatusColor(user: StatusGettableUser) {
  if (user.status == "join me") return "#00bbffff" // join me
  if (user.status == "active") return "#59ff00ff" // online
  if (user.status == "ask me") return "#ff7b00ff" // ask me
  if (user.status == "busy") return "#b10000ff" // don't disturb
  if (user.status == "offline") return "#595959ff" // offline
  return "#000000ff";
}

// get trust rank color (and friend color)
export function getTrustRankColor(user: UserLike, useFriendColor: boolean = false, useRankColor: boolean = true): string {
  if (useFriendColor && user.isFriend) return "#ffee00ff"; // friend
  if (useRankColor) {
    const tags = user.tags;
    if (tags.includes("system_troll")) return "#363636ff"; // Nuisance

    if (tags.includes("system_trust_legend")) return "#ff0101ff"; // legend (unused?)
    if (tags.includes("system_trust_veteran")) return "#aa01ffff"; // trusted
    if (tags.includes("system_trust_trusted")) return "#ff8800ff"; // known
    if (tags.includes("system_trust_known")) return "#26ff00ff"; // User
    if (tags.includes("system_trust_basic")) return "#004cffff"; // NewUser
  }
  return "#ffffffff"; // Visitor
}


// get trust rank string from Tags
export function getTrustRank(user: UserLike): TrustRank {
  const tags = user.tags;
  if (tags.includes("system_troll")) return "nuisance";
  if (tags.includes("system_trust_legend")) return "legend"; // (unused?)
  if (tags.includes("system_trust_veteran")) return "trusted";
  if (tags.includes("system_trust_trusted")) return "known";
  if (tags.includes("system_trust_known")) return "user";
  if (tags.includes("system_trust_basic")) return "new_user";
  return "visitor";
}

// VRC+ Subscriber
export function isSupporter(user: UserLike): boolean {
  const tags = user.tags;
  return tags.includes("system_supporter");
}

export function getAuthorTags(data: AvatarLike | WorldLike): string[] {
  const tags = data.tags?.filter(t => t.startsWith("author_tag_"));
  return tags?.map(t => t.replace("author_tag_", "")) ?? [];
}


export function getReleaseStatusColor(data: AvatarLike | WorldLike) {
  if (data.releaseStatus == "public") return "rgba(95, 164, 255, 1)"; // public
  if (data.releaseStatus == "private") return "#ff8636ff"; // private
  if (data.releaseStatus == "hidden") return "#3d3c3cff"; // hidden
  return "#000000ff";
}

export function getAvatarPlatform (data: AvatarLike) {
  const platforms: string[] = []
  if (data.performance.standalonewindows) platforms.push("standalonewindows");
  if (data.performance.android) platforms.push("android");
  if (data.performance.ios) platforms.push("ios");
  return platforms;
}
export function getWorldPlatform (data: WorldLike) {
  const platforms: string[] = []
  if (data.unityPackages?.some(pkg => pkg.platform == "standalonewindows")) platforms.push("standalonewindows");
  if (data.unityPackages?.some(pkg => pkg.platform == "android")) platforms.push("android");
  if (data.unityPackages?.some(pkg => pkg.platform == "ios")) platforms.push("ios");
  return platforms;
}


// converter
// Convert User to LimitedUserFriend (for DataContext etc...)
export function convertToLimitedUserFriend(user: UserLike): LimitedUserFriend {
  const obj = Object(user);
  return {
    ...user,
    imageUrl: user?.currentAvatarThumbnailImageUrl ?? user?.currentAvatarImageUrl,
    location: obj.location ?? "offline",
    friendKey: obj.friendKey ?? "",
    last_mobile: obj.last_mobile ?? "",
    last_login: obj.last_login ?? "",
    last_activity: obj.last_activity ?? "",
    platform: obj.platform ?? "",
    
  };
}
// Convert User to LimitedUserInstance (for DataContext etc...)
export function convertToLimitedUserInstance(user: UserLike): LimitedUserInstance {
  const obj = Object(user);
  return {
    ...user,
    pronouns: obj.pronouns ?? "",
    currentAvatarThumbnailImageUrl: user?.currentAvatarThumbnailImageUrl ?? user?.currentAvatarImageUrl,
    currentAvatarTags: obj.currentAvatarTags ?? [],
    ageVerified: obj.ageVerificationStatus ?? false,
    ageVerificationStatus: obj.ageVerificationStatus ?? "hidden",
    allowAvatarCopying: obj.allowAvatarCopying ?? false,
    date_joined: obj.date_joined ?? "",
    friendKey: obj.friendKey ?? "",
    state: obj.state ?? undefined,
    last_mobile: obj.last_mobile ?? "",
    last_activity: obj.last_activity ?? "",
  };
} 