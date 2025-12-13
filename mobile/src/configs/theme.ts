import { DarkTheme, DefaultTheme } from "@react-navigation/native";

declare module "@react-navigation/native" {
  export function useTheme(): Theme;
}

export type Theme = typeof lightTheme | typeof darkTheme;

const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#11acd2ff",
    secondary: "#5fffbfff",
    error: "#ff5555ff",
    success: "#51a63dff",
    warning: "#fadb61ff",
    info: "#4385bfff",

    // text colors
    text: "#000000ff",
    subText: "#4d4d4dff",
    // border
    border: "#686868ff",
    // backgrounds
    card: "#afafafff",
    paper: "#dfdfdfff",
    background: "#f6f6f6ff",
  },
};

const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "#19c6ffff",
    secondary: "#5fffbfff",
    error: "#ff5555ff",
    success: "#51a63dff",
    warning: "#fadb61ff",
    info: "#4385bfff",

    // text colors
    text: "#ffffffff",
    subText: "#9f9f9fff",
    // border
    border: "#5a5a5aff",
    // backgrounds
    card: "#313131ff",
    paper: "#222222ff",
    background: "#101010ff",
  },
};



export { lightTheme, darkTheme };

