
import { User, World } from "@/api/vrchat";
import { omitObject } from "@/lib/objectUtils";
import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Image } from "react-native";
import { useVRChat } from "./VRChatContext";

// Image Cache in Storage
interface Cache<T> {
  expiredAt: string; // ISO formated date, if empty-string, never expire
  value: T;
}
interface CacheWrapper<T> {
  get: (id: string) => Promise<T>;
  set: (id: string, data: T) => Promise<void>;
  del: (id: string) => Promise<void>;
}

interface CacheContextType {
  clearCache: () => Promise<void>;
  getCacheInfo: () => Promise<{size: number, count: number}>;
  //
  user: CacheWrapper<User>;
  world: CacheWrapper<World>;
}

const Context = createContext<CacheContextType | undefined>(undefined)

const cacheRootDir = `${FileSystem.documentDirectory}cache/`; // root-directory for cache

// get local file uri from key (id or url), subDirName must end with /
const getLocalUri = async (key: string, subDirName: string, encryptKey?: boolean) => {
  if (encryptKey) {
    const cryptKey = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, key)
    return cacheRootDir + subDirName + cryptKey;
  }
  return cacheRootDir + subDirName + key;
}


const useCache = () => {
  const context = useContext(Context)
  if (!context) {
    throw new Error("useCache must be used within a CacheProvider")
  }
  return context
}
const CacheProvider: React.FC<{ children?: ReactNode }> = ({children}) => {  
  const initTrigger = useRef(0);
  const vrc = useVRChat();
  // create cache dir if not exist
  useEffect(() => {
    FileSystem.getInfoAsync(cacheRootDir)
    .then((dirInfo) => {
      if (!dirInfo.exists) FileSystem.makeDirectoryAsync(cacheRootDir, { intermediates: true });
    })
    .catch((error) => {
      console.error("Error creating cache directory:", error);
    });
  }, [])

  /// Cache Getters
  const getWorld = async (id: string) => (await vrc.worldsApi.getWorld(id)).data;
  const getUser = async (id: string) => (await vrc.usersApi.getUser(id)).data;
  // Initialize cached images (called when clear cache and on mount)
  useEffect(initCachedImage, [initTrigger.current]); // for images
  const wrappers = useMemo(() => ({ // for other data
    user: initCacheWrapper<User>("users/", getUser),
    world: initCacheWrapper<World>("worlds/", getWorld),
  }), [initTrigger.current, vrc.config]); 
  

  const clearCache = async () => {
    // delete all files in cache root-dir and recreate it
    await FileSystem.deleteAsync(cacheRootDir, { idempotent: true });
    await FileSystem.makeDirectoryAsync(cacheRootDir, { intermediates: true });
    // re-initiate all cache wrappers (with creating sub directories)
    initTrigger.current += 1;
  }
  const getCacheInfo = async () => {
    // recursively get total size and count of files in cache root-dir
    const countFileRecursive = async (dir: string): Promise<number> => {
      let totalCount = 0;
      const items = await FileSystem.readDirectoryAsync(dir);
      for (const item of items) {
        const itemPath = dir + item;
        const info = await FileSystem.getInfoAsync(itemPath);
        if (info.isDirectory) {
          const subDirTotal = await countFileRecursive(itemPath + "/");
          totalCount += subDirTotal;
        } else {
          totalCount += 1;
        }
      }
      return totalCount;
    }
    const rootInfo = await FileSystem.getInfoAsync(cacheRootDir);
    const rootSize = rootInfo.exists ? rootInfo.size || 0 : 0;
    const rootCount = rootInfo.exists ? await countFileRecursive(cacheRootDir) : 0;
    return { size: rootSize, count: rootCount };
  }

  return (
    <Context.Provider value={{
      clearCache,
      getCacheInfo,
      ...wrappers
    }}>
      {children}
    </Context.Provider>
  )
} 

// create and init cache wrapper from getter function
function initCacheWrapper<T>(
  subDir: string, 
  getter: (id: string) => Promise<T>, 
  options?: {
    expiration?: number, // in milliseconds
    encrypt?: boolean,
    type?: "json" | "raw"
  }
): CacheWrapper<T> {
  const opt = {
    expiration: options?.expiration ?? 24 * 60 * 60 * 1000, // default: 24 hours, if set to 0, never expire
    encrypt: options?.encrypt ?? false, // default: no encrypt, use raw key as filename
    type: options?.type ?? "json" // default: json
  }
  const { expiration, encrypt, type } = opt;

  if (subDir.startsWith("/") || !subDir.endsWith("/")) throw new Error("subDir must not start with / and must end with /: " + subDir);
  if (type !== "json") throw new Error("not-implemented cache type: " + type);

  // initiate cache sub-directory
  FileSystem.getInfoAsync(cacheRootDir + subDir)
  .then((dirInfo) => {
    if (!dirInfo.exists) FileSystem.makeDirectoryAsync(cacheRootDir + subDir, { intermediates: true });
  })
  .catch((error) => {
    console.error(`Error creating cache sub-dir: ${cacheRootDir + subDir}`, error);
  });

  const get = async (id: string): Promise<T> => {
    const localUri = await getLocalUri(id, subDir, encrypt);
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    if (fileInfo.exists) {
      const fileContent = await FileSystem.readAsStringAsync(localUri);
      const cache: Cache<T> = JSON.parse(fileContent);
      if (cache.expiredAt == "" || new Date() < new Date(cache.expiredAt)) {
        return cache.value;
      } 
    } 
    // no-cached or cached-but-expired, get and set with new data
    const data = await getter(id);
    const newCache: Cache<T> = {
      expiredAt: expiration > 0 ? new Date(Date.now() + expiration).toISOString() : "",
      value: data
    };
    await FileSystem.writeAsStringAsync(localUri, JSON.stringify(newCache));
    return data;
  }
  const set = async (id: string, data: T) => {
    const localUri = await getLocalUri(id, subDir, encrypt);
    const newCache: Cache<T> = {
      expiredAt: expiration > 0 ? new Date(Date.now() + expiration).toISOString() : "",
      value: data
    };
    await FileSystem.writeAsStringAsync(localUri, JSON.stringify(newCache));
  }
  const del = async (id: string) => {
    const localUri = await getLocalUri(id, subDir, encrypt);
    await FileSystem.deleteAsync(localUri, { idempotent: true });
  }
  return { get, set, del };

}

// Cached Image Component, use this instead of Default Image Component, 
// cache dir "images/" is used for this component
function initCachedImage() { // create sub-directory for images
  const subDir = "images/"; // must end with /
  FileSystem.getInfoAsync(cacheRootDir + subDir).then((dirInfo) => {
    if (!dirInfo.exists) FileSystem.makeDirectoryAsync(cacheRootDir + subDir, { intermediates: true });
  }).catch((error) => {
    console.error(`Error creating cache sub-dir: ${cacheRootDir + subDir}`, error);
  });
}
const CachedImage = ({src:remoteUri , ...rest}: {src: string, [key: string]: any}) => {
  const [src, setSrc] = useState<string | undefined>();
  const headers = useVRChat().config?.baseOptions["headers"] || {};
  const childDir = "images/" // must end with /
  const load = async () => {
    try {
      const localUri = await getLocalUri(remoteUri, childDir, true);
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      if (fileInfo.exists) { 
        setSrc(localUri);
      } else {
        const { uri } = await FileSystem.downloadAsync(remoteUri, localUri, { headers: headers});
        setSrc(uri);
      }
    } catch (error) {
      console.log("Error loading image:", error);
    }
  }
  useEffect(() => {
    load();
  }, [remoteUri])
  return (
    <Image
      source={{ uri: src }}
      progressiveRenderingEnabled={true}
      style={[{ resizeMode: "cover" }, rest.style]}
      {...omitObject(rest, "style")}
    />
  );
};



export { CachedImage, CacheProvider, useCache };

