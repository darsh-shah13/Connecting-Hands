import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6750a4',
    secondary: '#625b71',
    tertiary: '#7d5260',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#d0bcff',
    secondary: '#ccc7f0',
    tertiary: '#eaddcb',
  },
};

export const appTheme = {
  light: lightTheme,
  dark: darkTheme,
};
