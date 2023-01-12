import { Button, VStack } from 'native-base';
import { useNavigation } from '@react-navigation/native';

export function Settings() {

  const { navigate } = useNavigation();

  return (
    <VStack>
      <Button
        size="lg"
        variant="ghost"
        colorScheme="amber"
        onPress={() => navigate('generalSettings')}
        justifyContent="flex-start"
        _text={{
          color: 'gray.900',
          fontWeight: 'medium',
          fontSize: 'lg'
        }}
      >
        Informações gerais
      </Button>
      <Button
        size="lg"
        variant="ghost"
        colorScheme="amber"
        onPress={() => navigate('sensorSettings')}
        justifyContent="flex-start"
        _text={{
          color: 'gray.900',
          fontWeight: 'medium',
          fontSize: 'lg'
        }}
      >
        Sensores
      </Button>
    </VStack>
  );
}
