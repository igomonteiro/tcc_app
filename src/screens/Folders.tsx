import { AlertDialog, Box, Button, FlatList, HStack, Text, useTheme, VStack} from 'native-base';
import { TouchableOpacity } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useCallback, useRef, useState } from 'react';
import { Folder, Trash } from 'phosphor-react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { File } from '../@types/files';

export function Folders() {
  const [folders, setFolders] = useState<File[] | []>([]);

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const cancelRef = useRef(null);
  const toBeDeletedFolder = useRef<File>(null);

  const { sizes, colors } = useTheme();
  const { navigate } = useNavigation();

  async function setFoldersList() {
    const folders = [];
    const directories = await FileSystem.readDirectoryAsync(`${FileSystem.documentDirectory}files`);
    if (directories) {
      for (const dir of directories) {
        const folderInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}files/${dir}`);
        folders.push({
          ...folderInfo,
          name: dir
        });
      }
    }
    setFolders(folders);
  }

  async function handleOnConfirmRemove(uri: string) {
    setIsLoading(true);
    await FileSystem.deleteAsync(uri);
    setIsLoading(false);
    setIsOpen(false);
    setFolders((prevState) =>  prevState.filter((folder: File) => folder.uri !== uri));
  }

  function handleOnRemove(folder: File) {
    toBeDeletedFolder.current = folder;
    setIsOpen(true);
  }

  useFocusEffect(useCallback(() => {
    setFoldersList();
  }, []));

  return (
    <Box flex={1} padding={4}>
      <FlatList data={folders} renderItem={({
        item
      }) => <Box mb={4}>
        <TouchableOpacity onPress={() => navigate('files', { uri: item.uri})}>
          <HStack justifyContent="space-between" alignItems="center">
            <HStack alignItems="center" space={2}>
              <Folder color={colors.amber['600']} size={sizes[10]}></Folder>
              <VStack>
                <Text fontSize="lg">{item.name}</Text>
                <Text color="gray.400">{item.size/1000} kB</Text>
              </VStack>
            </HStack>
            <TouchableOpacity onPress={() => handleOnRemove(item)}>
              <Trash color={colors.gray['600']} size={sizes[8]}></Trash>
            </TouchableOpacity>
          </HStack>
        </TouchableOpacity>
      </Box>} keyExtractor={item => item.uri} />

      <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Remover pasta</AlertDialog.Header>
          <AlertDialog.Body>
            Esta ação irá remover a pasta e todos os arquivos que estão dentro dela e não pode ser revertida.
            Deseja mesmo continuar?
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button
                variant="unstyled"
                colorScheme="coolGray"
                onPress={() => setIsOpen(false)}
                ref={cancelRef}
              >
                Cancelar
              </Button>
              <Button
                isLoading={isLoading}
                colorScheme="danger"
                onPress={() => handleOnConfirmRemove(toBeDeletedFolder.current.uri)}
              >
                Remover
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Box>
  );
}
