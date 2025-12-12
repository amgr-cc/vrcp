import BackButtonForHeader from '@/components/layout/BackButtonForHeader';
import { Stack, withLayoutContext } from 'expo-router';
import {
  createStackNavigator,
  StackNavigationEventMap,
  StackNavigationOptions,
} from "@react-navigation/stack";
import { ParamListBase, StackNavigationState } from "@react-navigation/native";
import { Platform } from 'react-native';
import MenuButtonForHeader from '@/components/layout/MenuButtonForHeader';
import { useTranslation } from 'react-i18next';

const { Navigator } = createStackNavigator();

// const JsStack = withLayoutContext<
//   StackNavigationOptions,
//   typeof Navigator,
//   StackNavigationState<ParamListBase>,
//   StackNavigationEventMap
// >(Navigator);

// const ModalStack = Platform.OS === 'ios' ? Stack : JsStack;

export default function ModalLayout() {
  const { t } = useTranslation();
  return (
    <Stack
      screenOptions={{ 
        presentation: 'modal',
        // headerShown: false, // 必要に応じてヘッダーの表示を制御
        headerLeft: BackButtonForHeader,
        headerRight: MenuButtonForHeader,
      }} 
    >
      <Stack.Screen
        name="user/[id]"
        options={{title: t("pages.detail_user.label") }}
      />
      <Stack.Screen
        name="world/[id]"
        options={{title: t("pages.detail_world.label") }}
      />
      <Stack.Screen
        name="instance/[id]"
        options={{title: t("pages.detail_instance.label") }}
      /> 
      <Stack.Screen
        name="avatar/[id]"
        options={{title: t("pages.detail_avatar.label") }}
      />
      <Stack.Screen
        name="group/[id]"
        options={{title: t("pages.detail_group.label") }}
      />

      <Stack.Screen
        name="events"
        options={{title: t("pages.events.label"), headerRight: undefined }}
      /><Stack.Screen
        name="feeds"
        options={{title: t("pages.feeds.label"), headerRight: undefined }}
      />
      <Stack.Screen
        name="friendlocations"
        options={{title: t("pages.friendlocations.label"), headerRight: undefined }}
      />
      <Stack.Screen
        name="search"
        options={{title: t("pages.search.label"), headerRight: undefined }}
      />
    </Stack>
  );
}