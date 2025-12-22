import GenericModal from "@/components/layout/GenericModal";
import globalStyles, { spacing } from "@/configs/styles";
import { Button, Text } from "@react-navigation/elements";
import { useTheme } from "@react-navigation/native";
import Constants from "expo-constants";
import { useState } from "react";
import { Platform, View } from "react-native";
import PrivacyPolicyModal from "./about_innermodals/PrivacyPolicyModal";
import LicenseModal from "./about_innermodals/LicenseModal";
import ChangeLogModal from "./about_innermodals/ChangeLogModal";
import { useTranslation } from "react-i18next";
import TermsOfUseModal from "./about_innermodals/TermsOfUseModal";


interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AboutModal = ({ open, setOpen }: Props) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [ termsOfUseModal, setTermsOfUseModal ] = useState<boolean>(false);
  const [ privacyPolicyModal, setPrivacyPolicyModal ] = useState<boolean>(false);
  const [ licenseModal, setLicenseModal ] = useState<boolean>(false);
  const [ changeLogModal, setChangeLogModal ] = useState<boolean>(false);

  const devInfo = {
    version: Constants.expoConfig?.version,
    expoSdkVersion: Constants.expoConfig?.sdkVersion,
    deviceName: Constants.deviceName,
    platform: Platform.OS,
    packageName: Platform.select({
      android: Constants.expoConfig?.android?.package,
      ios: Constants.expoConfig?.ios?.bundleIdentifier,
    }),
  };

  const buttonItems = [
    {
      title: t("components.aboutModal.button_termsOfUse"),
      onPress: () => setTermsOfUseModal(true),
      flex: 1,
    },
    {
      title: t("components.aboutModal.button_privacyPolicy"),
      onPress: () => setPrivacyPolicyModal(true),
      flex: 1,
    },
    {
      title: t("components.aboutModal.button_Licenses"),
      onPress: () => setLicenseModal(true),
      flex: 1,
    },
    {
      title: t("components.aboutModal.button_ChangeLog"),
      onPress: () => setChangeLogModal(true),
      flex: 1,
    },
  ];

  return (
    <GenericModal
      title={t("components.aboutModal.label")}
      showCloseButton
      size="large"
      open={open}
      onClose={() => setOpen(false)}
      // buttonItems={buttonItems}
    >

      <Text style={[globalStyles.text, { color: theme.colors.text }]}>
        {Object.entries(devInfo)
          .map(([key, value]) => `${key}:   ${value}`)
          .join("\n")}
      </Text>

      <View style={{ marginTop: spacing.medium, gap: spacing.small }} >
      {buttonItems.map((item, index) => (
        <View key={index}>
          <Button onPress={item.onPress} >
            {item.title}
          </Button>
        </View>
      ))}
      </View>

      {/* Modal */}
      <TermsOfUseModal
        open={termsOfUseModal}
        setOpen={setTermsOfUseModal}
      />
      <PrivacyPolicyModal
        open={privacyPolicyModal}
        setOpen={setPrivacyPolicyModal}
      />
      <LicenseModal
        open={licenseModal}
        setOpen={setLicenseModal}
      />
      <ChangeLogModal
        open={changeLogModal}
        setOpen={setChangeLogModal}
      />

    </GenericModal>
  );
};

export default AboutModal;
