import { Button, Text, VStack } from 'native-base';
import { useNavigation } from '@react-navigation/native';

export function Settings() {

  const { navigate } = useNavigation();

  return (
    <VStack>
      <Button
        size="lg"
        variant="ghost"
        justifyContent="start"
        onPress={() => navigate('generalSettings')}
      >
        <Text fontSize="xl" fontWeight="medium">Informações gerais</Text>
      </Button>
      <Button
        size="lg"
        variant="ghost"
        justifyContent="start"
        onPress={() => navigate('sensorSettings')}
      >
        <Text fontSize="xl" fontWeight="medium">Sensores</Text>
      </Button>
    </VStack>
  );
}
