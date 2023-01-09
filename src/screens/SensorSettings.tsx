import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, Button, Checkbox, Divider, Text, VStack } from 'native-base';
import { useEffect } from 'react';
import { useState } from 'react';

const availableSensors = [
  {
    label: 'Acelerômetro',
    value: 'accelerometer',
  },
  {
    label: 'Localização',
    value: 'gps',
  },
  {
    label: 'Giroscópio',
    value: 'gyro',
  }
];

type SensorSettingsType = {
  sensors: Array<string>
};

export function SensorSettings() {
  const [sensors, setSensors] = useState(['accelerometer', 'gps', 'gyro']);
  const [isLoading, setIsLoading] = useState(false);

  async function handleOnSubmit() {
    const sensorSettings: SensorSettingsType = {
      sensors
    };
    try {
      setIsLoading(true);
      await AsyncStorage.setItem('sensorSettings', JSON.stringify(sensorSettings));
      setIsLoading(false);
    } catch(err) {
      console.log(err);
    }
  }

  useEffect(() => {
    async function setStorageStates() {
      try {
        const sensorInfo = await AsyncStorage.getItem('sensorSettings');
        console.log(sensorInfo);
        if (sensorInfo !== null) {
          const sensorInfoJson: SensorSettingsType = JSON.parse(sensorInfo);

          setSensors(sensorInfoJson.sensors);
        }
      } catch (err) {
        console.log(err);
      }
    }
    setStorageStates();
  }, []);

  return (
    <Box flex={1} display="flex" justifyContent="space-between" padding={4}>
      <VStack>
        <Text fontSize="lg" fontWeight="bold">Sensores ativos</Text>
        <Divider mb={2}/>
        <Checkbox.Group ml={4} onChange={setSensors} value={sensors} accessibilityLabel="choose sensors to activate/deactivate">
          {availableSensors.map((sensor, index) => (
            <Checkbox key={index} value={sensor.value} my={2} colorScheme="amber">
              {sensor.label}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </VStack>
      <Button colorScheme="amber" mt={4} onPress={handleOnSubmit} isLoading={isLoading}>Confirmar</Button>
    </Box>
  );
}
