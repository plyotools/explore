import { createTheme, MantineColorsTuple } from '@mantine/core';

const purple: MantineColorsTuple = [
  '#EBD2FF', // 0 - lightest
  '#C18CFF', // 1
  '#A355FF', // 2
  '#8027F4', // 3 - Purple Rain (main action color)
  '#5E19B8', // 4
  '#5E19B8', // 5
  '#5E19B8', // 6
  '#5E19B8', // 7
  '#5E19B8', // 8
  '#0A082D', // 9 - darkest (dark blue)
];

// Dark color scale - from dark blue background to lighter shades for surfaces and text
const dark: MantineColorsTuple = [
  '#0A082D', // 0 - base dark blue (background)
  '#15133D', // 1 - slightly lighter for cards/surfaces
  '#1F1D4D', // 2 - card backgrounds
  '#2A275D', // 3 - elevated surfaces
  '#35316D', // 4 - hover states
  '#403B7D', // 5 - borders
  '#4B458D', // 6 - subtle borders
  '#564F9D', // 7 - disabled states
  '#6159AD', // 8 - very subtle text
  '#6B63BD', // 9 - dimmed text
];

export const theme = createTheme({
  primaryColor: 'purple',
  fontFamily: 'Roboto, sans-serif',
  headings: {
    fontFamily: 'Roboto, sans-serif',
  },
  colors: {
    purple,
    dark,
  },
  defaultRadius: 'md',
  black: '#0A082D', // Dark blue as black
  white: '#F0F2F9', // Light gray as white
  // Override default dark mode colors for better contrast
  other: {
    darkBlue: '#0A082D',
    cardBackground: '#15133D',
    textPrimary: '#F0F2F9',
    textSecondary: '#B2BAD3',
    textDimmed: '#8B92B0',
  },
});

