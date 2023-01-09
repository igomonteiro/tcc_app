import { NativeBaseProvider, StatusBar } from 'native-base';
import { Routes } from './src/routes';
import { useFonts, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';

export default function App() {
  const [isFontsLoaded] = useFonts({ Roboto_400Regular, Roboto_500Medium, Roboto_700Bold });
  if (!isFontsLoaded) {
    return null;
  }

  return (
    <NativeBaseProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <Routes/>
    </NativeBaseProvider>
  );
}
