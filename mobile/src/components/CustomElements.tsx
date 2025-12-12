import { TouchableOpacity as _TouchableOpacity, TouchableOpacityProps } from "react-native"


/* Override Default Components Settings */


// use This instead of TouchableOpacity directly 
export const TouchableOpacity = (props: TouchableOpacityProps) => {
    return (
      <_TouchableOpacity activeOpacity={0.7} {...props} />
    )
}