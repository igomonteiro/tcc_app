import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { Measurement } from '../screens/Measurement';
import { Settings } from '../screens/Settings';
import { Gear, Activity } from 'phosphor-react-native';
import { useTheme } from 'native-base';

const { Navigator, Screen } = createBottomTabNavigator();

export function TabRoutes() {
  const { colors, sizes } = useTheme();

  return (
    <Navigator screenOptions={{
      headerShown: true,
      headerTitleStyle: {
        color: colors.white,
        fontWeight: 'bold',
      },
      headerStyle: {
        backgroundColor: colors.gray[800],
      },
      tabBarLabelPosition: 'beside-icon',
      tabBarActiveTintColor: colors.amber[500],
      tabBarInactiveTintColor: colors.gray[300],
      tabBarStyle: {
        position: 'absolute',
        height: 70,
        borderTopWidth: 0,
        backgroundColor: colors.gray[800],
      },
      tabBarItemStyle: {
        position: 'relative',
        top: Platform.OS === 'android' ? -10 : 0
      }
    }}>
      <Screen name="measurement" component={Measurement} options={{
        headerTitle: 'Medição',
        tabBarIcon: ({ color }) => <Activity color={color} size={sizes[6]} />,
        tabBarLabel: 'Medição'
      }}/>
      <Screen name="settings" component={Settings} options={{
        headerTitle: 'Configurações',
        tabBarIcon: ({ color }) => <Gear color={color} size={sizes[6]} />,
        tabBarLabel: 'Configurações'
      }}/>
    </Navigator>
  );
}
