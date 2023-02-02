import { Button, Center, HStack, Icon, Text, VStack } from 'native-base';
import { ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GeneralSettingsType, SensorSettingsType } from '../@types/settings';
import * as FileSystem from 'expo-file-system';
import dayjs from 'dayjs';
import { useFocusEffect } from '@react-navigation/native';

type LocationType = {
  altitude: number;
  latitude: number;
  longitude: number;
  timestamp: number;
}

type AccelerometerType = {
  x: number;
  y: number;
  z: number;
}

export function Measurement() {
  const [errorMsg, setErrorMsg] = useState(null);
  const [clientLocation, setClientLocation] = useState(null);
  const [sensorSettings, setSensorSettings] = useState<SensorSettingsType | null>({
    sensors: ['ACCELEROMETER', 'GPS', 'GYRO']
  });
  const [generalSettings, setGeneralSettings] = useState<GeneralSettingsType | null>(null);
  const [isLoadingSensorSettings, setIsLoadingSensorSettings] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [location, setLocation] = useState<LocationType | null>(null);
  const [accelerometer, setAccelerometerData] = useState<AccelerometerType>({
    x: 0,
    y: 0,
    z: 0
  });
  const [gyro, setGyroData] = useState<AccelerometerType>({
    x: 0,
    y: 0,
    z: 0
  });
  const [speed, setSpeed] = useState(0);
  const [accelerometerSubscription, setAccelerometerSubscription] = useState(null);
  const [gyroSubscription, setGyroSubscription] = useState(null);
  const [time, setTime] = useState(0);

  const accelerometerContent = useRef('');
  const gpsContent = useRef('');
  const gyroContent = useRef('');
  const onStartDate = useRef('');

  const accelerometerEnabled = sensorSettings.sensors.indexOf('ACCELEROMETER') > -1;
  const gpsEnabled = sensorSettings.sensors.indexOf('GPS') > -1;
  const gyroEnabled = sensorSettings.sensors.indexOf('GYRO') > -1;

  function _unsubscribeFromAccelerometer() {
    accelerometerSubscription && accelerometerSubscription.remove();
    setAccelerometerSubscription(null);
  }

  function _unsubscribeFromGyro() {
    gyroSubscription && gyroSubscription.remove();
    setGyroSubscription(null);
  }

  function _subscribeToAccelerometer() {
    const updateInterval = (1/Number(generalSettings?.sensor.accelerometerRate)) * 1000;
    Accelerometer.setUpdateInterval(updateInterval || 1000);
    setAccelerometerSubscription(
      Accelerometer.addListener(setAccelerometerData)
    );
  }

  function _subscribeToGyro() {
    const updateInterval = (1/Number(generalSettings?.sensor.accelerometerRate)) * 1000;
    Gyroscope.setUpdateInterval(updateInterval || 1000);
    setGyroSubscription(
      Gyroscope.addListener(setGyroData)
    );
  }

  async function handleOnStartMeasurement() {
    if (isMonitoring) {
      if (accelerometerEnabled) {
        _unsubscribeFromAccelerometer();
      }

      if (gyroEnabled) {
        _unsubscribeFromGyro();
      }

      if (gpsEnabled) {
        stopLocationTracking();
      }

      const accFilename = `${onStartDate.current}-Acc.txt`;
      const gpsFilename = `${onStartDate.current}-GPS.txt`;
      const gyroFilename = `${onStartDate.current}-Gyro.txt`;
      const configFilename = `${onStartDate.current}-Config.txt`;

      const dirpath = `${FileSystem.documentDirectory}files/${onStartDate.current}`;
      await FileSystem.writeAsStringAsync(dirpath + '/' + accFilename, accelerometerContent.current);
      await FileSystem.writeAsStringAsync(dirpath + '/' + gpsFilename, gpsContent.current);
      await FileSystem.writeAsStringAsync(dirpath + '/' + gyroFilename, gyroContent.current);
      if (generalSettings) {
        await FileSystem.writeAsStringAsync(dirpath + '/' + configFilename, JSON.stringify(generalSettings));
      }
    } else {
      if (accelerometerEnabled) {
        _subscribeToAccelerometer();
      }

      if (gyroEnabled) {
        _subscribeToGyro();
      }

      if (gpsEnabled) {
        startLocationTracking();
      }
      onStartDate.current = dayjs().format('YYYY-MM-DD_HH-mm-ss');
      const dirpath = `${FileSystem.documentDirectory}files/${onStartDate.current}`;
      await FileSystem.makeDirectoryAsync(dirpath, { intermediates: true });
    }

    setIsMonitoring((prevState) => !prevState);
  }

  async function startLocationTracking() {
    const { granted: fgGranted } = await Location.requestForegroundPermissionsAsync();

    if (!fgGranted) {
      setErrorMsg('Sem permissão');
      return;
    }

    const { granted: bgGranted } = await Location.requestBackgroundPermissionsAsync();

    if (!bgGranted) {
      Alert.alert(
        'Sem autorização',
        'Você não autorizou o uso da localização pelo aplicativo, portanto só serão capturados os dados de GPS caso esteja com o aplicativo aberto'
      );
    }

    if (!clientLocation) {
      const location = await Location.watchPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: Number(generalSettings?.sensor.gpsRate) || 5000
      },(newLocation) => {
        const { coords, timestamp } = newLocation;
        const { altitude, latitude, longitude, speed } = coords;
        setLocation({
          altitude,
          latitude,
          longitude,
          timestamp
        });
        setSpeed(speed * 3.6);
      });
      setClientLocation(location);
    }
  }

  async function stopLocationTracking() {
    if (clientLocation) {
      await clientLocation.remove();
    }
  }

  async function loadSensorSettings() {
    setIsLoadingSensorSettings(true);
    const sensorSettings = await AsyncStorage.getItem('sensorSettings');
    const generalSettings = await AsyncStorage.getItem('generalSettings');
    if (sensorSettings) {
      const sensorSettingsJson: SensorSettingsType = JSON.parse(sensorSettings);
      setSensorSettings(sensorSettingsJson);
    }

    if (generalSettings) {
      const generalSettingsJson: GeneralSettingsType = JSON.parse(generalSettings);
      setGeneralSettings(generalSettingsJson);
    }
    setIsLoadingSensorSettings(false);
  }

  useFocusEffect(useCallback(() => {
    loadSensorSettings();
  }, []));

  useEffect(() => {
    let interval;
    if (isMonitoring) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1000);
      }, 1000);
    } else {
      setTime(0);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isMonitoring]);

  useEffect(() => {
    let content;
    if (isMonitoring) {
      if (!accelerometerContent.current) {
        // set headers
        accelerometerContent.current = 'x;y;z;date';
      } else {
        content = `\n${accelerometer.x};${accelerometer.y};${accelerometer.z};${dayjs().format('YY-MM-DD HH:mm:ss:sss')}`;
        accelerometerContent.current += content;
      }
    }
  }, [accelerometer.x, accelerometer.y, accelerometer.z, accelerometerContent, isMonitoring]);

  useEffect(() => {
    let content;
    if (isMonitoring) {
      if (!gyroContent.current) {
        // set headers
        gyroContent.current = 'x;y;z;date';
      } else {
        content = `\n${gyro.x};${gyro.y};${gyro.z};${dayjs().format('YY-MM-DD HH:mm:ss:sss')}`;
        gyroContent.current += content;
      }
    }
  }, [gyro.x, gyro.y, gyro.z, gyroContent, isMonitoring]);

  useEffect(() => {
    let content;
    if (isMonitoring) {
      if (!gpsContent.current) {
        // set headers
        gpsContent.current = 'lat;lon;kmh;date';
      } else {
        content = `\n${location.latitude};${location.longitude};${speed};${dayjs().format('YY-MM-DD HH:mm:ss:sss')}`;
        gpsContent.current += content;
      }
    }
  }, [isMonitoring, location?.latitude, location?.longitude, location?.timestamp, speed]);


  return (
    <>
      {isLoadingSensorSettings ? (
        <Center flex={1}>
          <ActivityIndicator size="large"/>
        </Center>

      ) :
        (
          <VStack flex={1} space={3} padding={4}>
            <HStack justifyContent="space-between">
              <Text fontSize="md" fontWeight="medium">Tempo decorrido</Text>
              <Text fontSize="md">
                {('0' + Math.floor((time / 3600000) % 60)).slice(-2)}:
                {('0' + Math.floor((time / 60000) % 60)).slice(-2)}:
                {('0' + Math.floor((time / 1000) % 60)).slice(-2)}
              </Text>
            </HStack>
            <HStack justifyContent="space-between">
              <Text fontSize="md" fontWeight="medium">Acelerômetro</Text>
              <VStack>
                <Text fontSize="md">x: { accelerometer.x.toFixed(6)  || '-'} m/s²</Text>
                <Text fontSize="md">y: { accelerometer.y.toFixed(6)  || '-'} m/s²</Text>
                <Text fontSize="md">z: { accelerometer.z.toFixed(6)  || '-'} m/s²</Text>
              </VStack>
            </HStack>
            <HStack justifyContent="space-between">
              <Text fontSize="md" fontWeight="medium">Giroscópio</Text>
              <VStack>
                <Text fontSize="md">x: { gyro.x.toFixed(6)  || '-'} °/s</Text>
                <Text fontSize="md">y: { gyro.y.toFixed(6)  || '-'} °/s</Text>
                <Text fontSize="md">z: { gyro.z.toFixed(6)  || '-'} °/s</Text>
              </VStack>
            </HStack>
            <HStack justifyContent="space-between">
              <Text fontSize="md" fontWeight="medium">Velocidade</Text>
              <Text fontSize="md">{speed < 0 ? '0' : speed.toFixed(2)} km/h</Text>
            </HStack>

            <HStack justifyContent="space-between">
              <Text fontSize="md" fontWeight="medium">GPS</Text>
              {errorMsg ? (
                <Text>{errorMsg}</Text>
              ):
                (
                  <VStack>
                    <Text textAlign="right" fontSize="md">Latitude: {location?.latitude?.toFixed(6) || '-'}</Text>
                    <Text textAlign="right" fontSize="md">Longitude: {location?.longitude?.toFixed(6) || '-'}</Text>
                    <Text textAlign="right" fontSize="md">Altitude: {location?.altitude?.toFixed(6) || '-'}</Text>
                  </VStack>
                )}
            </HStack>

            <Button
              leftIcon={<Icon as={FontAwesome} name={!isMonitoring ? 'play' : 'stop'} size="sm" />}
              colorScheme={!isMonitoring ? 'green' : 'red'} size="lg"
              onPress={handleOnStartMeasurement}
              _text={{
                textTransform: 'uppercase',
                fontWeight: 'bold',
              }}>
              {!isMonitoring ? 'Iniciar' : 'Parar'}
            </Button>
          </VStack>
        )}
    </>
  );
}
