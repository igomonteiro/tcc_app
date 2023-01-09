import { NavigationContainer } from '@react-navigation/native';
import { useTheme } from 'native-base';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StackRoutes } from './stack.routes';

export function Routes() {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray[800] }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StackRoutes />
        </NavigationContainer>
      </SafeAreaProvider>
    </SafeAreaView>
  );
}
