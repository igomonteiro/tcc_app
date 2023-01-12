import { FileInfo } from 'expo-file-system';

export type File = FileInfo & {
  name: string;
}
