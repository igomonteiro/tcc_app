import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button, Icon, useTheme } from 'native-base';
import { GeneralSettings } from '../screens/GeneralSettings';
import { SensorSettings } from '../screens/SensorSettings';
import { Feather } from '@expo/vector-icons';
import { TabRoutes } from './tab.routes';
import { Files } from '../screens/Files';

const { Navigator, Screen } = createNativeStackNavigator();

export function StackRoutes() {

  const { colors } = useTheme();

  return (
    <Navigator
      initialRouteName="home"
      screenOptions={{
        headerShown: true,
        headerBackTitle: '',
        headerTitleStyle: {
          color: colors.white,
          fontWeight: 'bold',
        },
        headerStyle: {
          backgroundColor: colors.gray[800],
        },
      }}
    >
      <Screen
        name="home"
        component={TabRoutes}
        options={{
          headerShown: false,
        }}
      ></Screen>
      <Screen
        name="generalSettings"
        component={GeneralSettings}
        options={{
          headerTitle: 'Configurações gerais'
        }}
      />
      <Screen
        name="files"
        component={Files}
        options={{
          headerTitle: 'Arquivos'
        }}
      />
      <Screen
        name="sensorSettings"
        component={SensorSettings}
        options={{
          headerTitle: 'Configurações de sensor'
        }}
      />
    </Navigator>
  );
}
