import { darkTheme, lightTheme } from "@/configs/theme";
import { AuthProvider } from "@/contexts/AuthContext";
import { CacheProvider } from "@/contexts/CacheContext";
import { DataProvider } from "@/contexts/DataContext";
import { DBProvider } from "@/contexts/DBContext";
import { MenuProvider } from "@/contexts/MenuContext";
import { SettingProvider } from "@/contexts/SettingContext";
import { VRChatProvider } from "@/contexts/VRChatContext";
import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/query-persist-client-core';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from "expo-sqlite/kv-store";
import * as Constants from "expo-constants";

function RootLayout() {
  return (
    <Stack initialRouteName="index" screenOptions={{ headerShown: false, gestureEnabled: true }}>
      <Stack.Screen name="maintab" options={{ headerShown: false }} />
      <Stack.Screen name="modals" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="tmp" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function Root() {
  const queryClient = new QueryClient();
  const asyncStoragePersister = createAsyncStoragePersister({
    storage: AsyncStorage
  });
  persistQueryClient({
    queryClient: queryClient,
    persister: asyncStoragePersister,
    buster: Constants.default.expoConfig?.version
  });
  return (
    <SettingProvider>
      {/* <DBProvider> */}
      <VRChatProvider>
        <AuthProvider>
          <CacheProvider>
            <DataProvider>
              <MenuProvider>
                <SafeAreaProvider>
                  <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                      <ThemeProvider
                        value={useColorScheme() !== "dark" ? lightTheme : darkTheme}
                      >
                        <RootLayout />
                        <StatusBar style="auto" />
                      </ThemeProvider>
                    </GestureHandlerRootView>
                  </SafeAreaView>
                </SafeAreaProvider>
              </MenuProvider>
            </DataProvider>
          </CacheProvider>
        </AuthProvider>
      </VRChatProvider>
      {/* </DBProvider> */}
    </SettingProvider>
  );
}
