import { Theme } from '../types/theme';

export const getTheme = (): string => {
  let theme = localStorage.getItem('theme');
  if (!theme) {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? Theme.Night
      : Theme.Winter;
  }

  return theme;
};
