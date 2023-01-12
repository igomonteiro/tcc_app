import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Measurement } from '../screens/Measurement';
import { Settings } from '../screens/Settings';
import { Folders } from '../screens/Folders';
import { Gear, Activity, FolderOpen } from 'phosphor-react-native';
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
        height: 77,
        backgroundColor: colors.gray[800],
      },
    }}>
      <Screen name="measurement" component={Measurement} options={{
        headerTitle: 'Medição',
        tabBarIcon: ({ color }) => <Activity color={color} size={sizes[6]} />,
        tabBarLabel: 'Medição'
      }}/>
      <Screen name="folders" component={Folders} options={{
        headerTitle: 'Pastas',
        tabBarIcon: ({ color }) => <FolderOpen color={color} size={sizes[6]} />,
        tabBarLabel: 'Pastas'
      }}/>
      <Screen name="settings" component={Settings} options={{
        headerTitle: 'Configurações',
        tabBarIcon: ({ color }) => <Gear color={color} size={sizes[6]} />,
        tabBarLabel: 'Configurações'
      }}/>
    </Navigator>
  );
}
