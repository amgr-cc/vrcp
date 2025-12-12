import { fontSize, spacing } from "@/configs/styles";
import { CachedImage } from "@/contexts/CacheContext";
import { omitObject } from "@/libs/utils";
import { Badge, InstanceRegion, Region } from "@/vrchat/api";

interface Props {
  badge: Badge;
  [key: string]: any;
}
const BadgeChip = ({ badge, ...rest }: Props) => {
  return (
    <CachedImage
      src={badge.badgeImageUrl}
      style={[{ margin: spacing.mini, aspectRatio: 1, height: 32 }, rest.style]}
      {...omitObject(rest, "style")}
    />
  );
};

export default BadgeChip;
