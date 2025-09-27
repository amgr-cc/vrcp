import globalStyles, { spacing } from "@/configs/styles";
import { StyleSheet, View } from "react-native";
import BaseListView from "./BaseListView";
import { PipelineMessage } from "@/vrchat/pipline/type";
import { dateToShortDatetime } from "@/libs/date";




interface Props {
  message: PipelineMessage;
  onPress?: () => void;
  onLongPress?: () => void;

  [key: string]: any;
}
const extractTitle = (data: PipelineMessage) => {
  const timestamp = data.timestamp ? dateToShortDatetime(new Date(data.timestamp)) : "";
  return `${timestamp}  ${data.type}`
}
const extractSubtitles = (data: PipelineMessage) => {
  return [];
};

const ListViewPipelineMessage = ({
  message,
  onPress,
  onLongPress,
  ...rest
}: Props) => {
  return (
    <BaseListView
      data={message}
      title={extractTitle}
      subtitles={extractSubtitles}
      onPress={onPress}
      onLongPress={onLongPress}
      ContainerStyle={styles.container}
      TitleStyle={globalStyles.description}
      SubtitleStyle={styles.subtitle}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.small,
  },
  title: {

    // borderColor: "blue", borderStyle: "dotted", borderWidth: 1
  },
  subtitle: {
    // borderColor: "blue", borderStyle: "dotted", borderWidth: 1
  },
  overlap: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    // borderColor: "red", borderStyle: "solid", borderWidth: 1,
  },
});
export default ListViewPipelineMessage;
