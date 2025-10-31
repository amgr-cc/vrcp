import GenericModal from "@/components/layout/GenericModal";
import LoadingIndicator from "@/components/view/LoadingIndicator";
import globalStyles, { spacing } from "@/configs/styles";
import { useCache } from "@/contexts/CacheContext";
import { Button, Text } from "@react-navigation/elements";
import { useTheme } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";


// term of service



interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TermOfServiceModal = ({ open, setOpen }: Props) => {
  const theme = useTheme();

  return (
    <GenericModal
      title="Terms of Service"
      showCloseButton
      size="full"
      open={open}
      onClose={() => setOpen(false)}
    >
      <Text>Terms of Service</Text>
    </GenericModal>
  );
};

const styles = StyleSheet.create({
  cacheContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default TermOfServiceModal;
