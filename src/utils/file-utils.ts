import { IMAGE_STORAGE_URL_PREFIX } from 'src/constants';

export const transformFiles = (files: Array<{ path: string }>): string[] => {
  return files.map(({ path }) => {
    return `${IMAGE_STORAGE_URL_PREFIX}${path}`;
  });
};
