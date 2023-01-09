import { Box, Button, Divider, Input, Select, Text, useTheme, VStack } from 'native-base';
import { useState } from 'react';
import { Check } from 'phosphor-react-native';

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
  const [selectedAssembly, setSelectedAssembly] = useState('');

  return (
    <Box padding={4}>
      <Text fontSize="lg" fontWeight="bold">Celular</Text>
      <Divider mb={4}/>
      <VStack space={4}>
        <Input placeholder="Marca" size="lg"/>
        <Input placeholder="Modelo" size="lg"/>
        <Select selectedValue={selectedAssembly} accessibilityLabel="Escolha o tipo de montagem" placeholder="Escolha o tipo de montagem" size="lg" _selectedItem={{
          bg: 'gray.400',
          endIcon: <Check size={sizes[6]} />
        }} onValueChange={itemValue => setSelectedAssembly(itemValue)}>
          {assemblyOptions.map((assembly, index) => (
            <Select.Item key={index} label={assembly.label} value={assembly.value} />
          ))}
        </Select>
      </VStack>

      <Text fontSize="lg" fontWeight="bold" mt={4}>Veículo</Text>
      <Divider mb={4}/>
      <VStack space={4}>
        <Input placeholder="Marca/modelo" size="lg"/>
        <Input placeholder="Km" size="lg" keyboardType="numeric"/>
      </VStack>

      <Text fontSize="lg" fontWeight="bold" mt={4}>GPS/Acelerômetro</Text>
      <Divider mb={4}/>
      <VStack space={4}>
        <Input placeholder="Taxa GPS (ms)" size="lg" keyboardType="numeric"/>
        <Input placeholder="Taxa acelerômetro (Hz)" size="lg" keyboardType="numeric"/>
      </VStack>

      <Button colorScheme="amber" mt={4}>Confirmar</Button>
    </Box>
  );
}
