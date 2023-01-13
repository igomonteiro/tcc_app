import { useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Box, Button, Divider, FlatList, HStack, ScrollView, Text, useTheme, VStack} from 'native-base';
import { File } from '../@types/files';
import { Export, FileText } from 'phosphor-react-native';
import { Modal, TouchableOpacity } from 'react-native';


type RouteParams = {
  uri: string;
}

export function Files() {
  const [files, setFiles] = useState<File[] | []>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File>(null);
  const [fileContent, setFileContent] = useState('');
  const route = useRoute();
  const { uri } = route.params as RouteParams;
  const { sizes, colors } = useTheme();

  async function handleOnShare(uri: string) {
    await Sharing.shareAsync(uri);
  }

  function handleOnFileClick(file: File) {
    setSelectedFile(file);
    setModalVisible(true);
  }

  useEffect(() => {
    async function setFolderFiles() {
      const dirFiles = await FileSystem.readDirectoryAsync(`${uri}`);
      const files = [];
      for (const file of dirFiles) {
        const fileInfo = await FileSystem.getInfoAsync(`${uri}/${file}`);
        files.push({
          ...fileInfo,
          name: file
        });
      }
      setFiles(files);
    }
    setFolderFiles();
  }, [uri]);

  useEffect(() => {
    async function getFileContent() {
      if (selectedFile) {
        const content = await FileSystem.readAsStringAsync(selectedFile.uri);
        setFileContent(content);
      }
    }
    getFileContent();
  }, [selectedFile]);

  return (
    <Box flex={1} padding={4}>
      <FlatList data={files} renderItem={({
        item
      }) => <Box my={2}>
        <HStack justifyContent="space-between" alignItems="center">
          <TouchableOpacity onPress={() => handleOnFileClick(item)}>
            <HStack alignItems="center" space={2}>
              <FileText color={colors.amber['600']} size={sizes[10]}></FileText>
              <VStack>
                <Text fontSize="lg" numberOfLines={1} maxW={250}>{item.name}</Text>
                <Text color="gray.400">{item.size/1000} kB</Text>
              </VStack>
            </HStack>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleOnShare(item.uri)}>
            <Export color={colors.gray['600']} size={sizes[8]}></Export>
          </TouchableOpacity>
        </HStack>
      </Box>} keyExtractor={item => item.uri} ItemSeparatorComponent={() => (<Divider/>)}/>

      <Modal presentationStyle='pageSheet' visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <ScrollView p={4}>
          <Text>{fileContent}</Text>
        </ScrollView>
      </Modal>
    </Box>
  );
}
