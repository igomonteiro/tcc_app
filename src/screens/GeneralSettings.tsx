import { Box, Button, Divider, Input, Select, Text, useTheme, VStack } from 'native-base';
import { useState } from 'react';
import { Check } from 'phosphor-react-native';
import * as Device from 'expo-device';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GeneralSettingsType } from '../@types/settings';

const assemblyOptions = [
  {
    label: 'Sem suporte',
    value: 'NO_SUPPORT',
  },
  {
    label: 'Magnético',
    value: 'MAGNETIC',
  },
  {
    label: 'Clip',
    value: 'CLIP'
  }
];

export function GeneralSettings() {
  const { sizes } = useTheme();
  const [deviceBrand, setDeviceBrand] = useState(Device.brand);
  const [deviceModel, setDeviceModel] = useState(Device.modelName);
  const [deviceMount, setDeviceMount] = useState('');
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [vehicleKm, setVehicleKm] = useState('');
  const [gpsRate, setGpsRate] = useState('1000');
  const [accelerometerRate, setAccelerometerRate] = useState('1');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit() {
    const generalInfo: GeneralSettingsType = {
      device: {
        brand: deviceBrand,
        model: deviceModel,
        mountType: deviceMount
      },
      sensor: {
        gpsRate,
        accelerometerRate
      },
      vehicle: {
        brand: vehicleBrand,
        km: vehicleKm
      }
    };

    try {
      setIsLoading(true);
      await AsyncStorage.setItem('generalSettings', JSON.stringify(generalInfo));
      setIsLoading(false);
    } catch(err) {
      console.log(err);
    }
  }

  useEffect(() => {
    async function setStorageStates() {
      try {
        const generalInfo = await AsyncStorage.getItem('generalSettings');
        console.log(generalInfo);
        if (generalInfo !== null) {
          const generalInfoJson: GeneralSettingsType = JSON.parse(generalInfo);

          setDeviceBrand(generalInfoJson.device.brand || Device.brand);
          setDeviceModel(generalInfoJson.device.model || Device.modelName);
          setDeviceMount(generalInfoJson.device.mountType || '');
          setVehicleBrand(generalInfoJson.vehicle.brand);
          setVehicleKm(generalInfoJson.vehicle.km);
          setGpsRate(generalInfoJson.sensor.gpsRate || '1000');
          setAccelerometerRate(generalInfoJson.sensor.accelerometerRate || '1');
        }
      } catch (err) {
        console.log(err);
      }
    }
    setStorageStates();
  }, []);

  return (
    <Box padding={4}>
      <Text fontSize="lg" fontWeight="bold">Celular</Text>
      <Divider mb={4}/>
      <VStack space={4}>
        <Input placeholder="Marca" size="lg" defaultValue={deviceBrand} onChangeText={setDeviceBrand} />
        <Input placeholder="Modelo" size="lg" defaultValue={deviceModel} onChangeText={setDeviceModel}/>
        <Select defaultValue={deviceMount} selectedValue={deviceMount} accessibilityLabel="Escolha o tipo de montagem" placeholder="Escolha o tipo de montagem" size="lg" _selectedItem={{
          bg: 'gray.400',
          endIcon: <Check size={sizes[6]} />
        }} onValueChange={itemValue => setDeviceMount(itemValue)}>
          {assemblyOptions.map((assembly, index) => (
            <Select.Item key={index} label={assembly.label} value={assembly.value} />
          ))}
        </Select>
      </VStack>

      <Text fontSize="lg" fontWeight="bold" mt={4}>Veículo</Text>
      <Divider mb={4}/>
      <VStack space={4}>
        <Input placeholder="Marca/modelo" size="lg" defaultValue={vehicleBrand} onChangeText={setVehicleBrand}/>
        <Input placeholder="Km" size="lg" keyboardType="numeric" defaultValue={vehicleKm} onChangeText={setVehicleKm}/>
      </VStack>

      <Text fontSize="lg" fontWeight="bold" mt={4}>GPS/Acelerômetro</Text>
      <Divider mb={4}/>
      <VStack space={4}>
        <Input placeholder="Taxa GPS (ms)" size="lg" keyboardType="numeric" defaultValue={gpsRate} onChangeText={setGpsRate}/>
        <Input placeholder="Taxa acelerômetro (Hz)" size="lg" keyboardType="numeric" defaultValue={accelerometerRate} onChangeText={setAccelerometerRate}/>
      </VStack>

      <Button isLoading={isLoading} colorScheme="amber" mt={4} onPress={handleSubmit}>
        Confirmar
      </Button>
    </Box>
  );
}
