import GenericModal from "@/components/layout/GenericModal";
import { useTheme } from "@react-navigation/native";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DevelopperModal = ({ open, setOpen }: Props) => {
  const theme = useTheme();

  return (
    <GenericModal
      title="Developper Options"
      buttonItems={[{ title: "Close", onPress: () => setOpen(false), flex: 1 }]}
      open={open}
      onClose={() => setOpen(false)}
    >
      <></>
    </GenericModal>
  );
};

export default DevelopperModal;
