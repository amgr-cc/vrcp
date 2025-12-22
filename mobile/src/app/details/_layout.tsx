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
    </Stack>
  );
}
