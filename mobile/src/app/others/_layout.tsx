import BackButtonForHeader from '@/components/layout/BackButtonForHeader';
import { Stack } from 'expo-router';
import MenuButtonForHeader from '@/components/layout/MenuButtonForHeader';
import { useTranslation } from 'react-i18next';

export default function ModalLayout() {
  const { t } = useTranslation();
  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        // headerShown: false,
        headerLeft: BackButtonForHeader,
        headerRight: MenuButtonForHeader,
      }}
    >
      {/* Profile > menus */}
      <Stack.Screen
        name="favorites"
        options={{title: t("pages.favorites.label"), headerRight: undefined }}
      />
      <Stack.Screen
        name="resources"
        options={{title: t("pages.resources.label"), headerRight: undefined }}
      />

      {/* Other > tabs */}
      <Stack.Screen
        name="calendar"
        options={{title: t("pages.calendar.label"), headerRight: undefined }} // no menu button
      />
      <Stack.Screen
        name="feeds"
        options={{title: t("pages.feeds.label"), headerRight: undefined }} // no menu button
      />
      <Stack.Screen
        name="notifications"
        options={{title: t("pages.notifications.label"), headerRight: undefined }} // no menu button
      />

      {/* Home */}
      <Stack.Screen
        name="friendlocations"
        options={{title: t("pages.friendlocations.label"), headerRight: undefined }} // no menu button
      />
      <Stack.Screen
        name="search"
        options={{title: t("pages.search.label"), headerRight: undefined }} // no menu button
      />
    </Stack>
  );
}
