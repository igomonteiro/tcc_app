import { Button, Center, HStack, Icon, Text, VStack } from 'native-base';
import { ActivityIndicator, Alert } from 'react-native';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GeneralSettingsType, SensorSettingsType } from '../@types/settings';
import dayjs from 'dayjs';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';

type LocationType = {
  altitude: number;
  latitude: number;
  longitude: number;
}

type AccelerometerType = {
  x: number;
  y: number;
  z: number;
}

export function Measurement() {
  const [errorMsg, setErrorMsg] = useState(null);
  const [clientLocation, setClientLocation] = useState(null);
  const [location, setLocation] = useState<LocationType | null>(null);
  const [accelerometerData, setAccelerometerData] = useState<AccelerometerType | null>(null);
  const [gyroData, setGyroData] = useState<AccelerometerType | null>(null);
  const [speed, setSpeed] = useState(0);
  const [time, setTime] = useState(0);
  const [sensorSettings, setSensorSettings] = useState<SensorSettingsType | null>({
    sensors: ['ACCELEROMETER', 'GPS', 'GYRO']
  });
  const [generalSettings, setGeneralSettings] = useState<GeneralSettingsType | null>(null);
  const [isLoadingSensorSettings, setIsLoadingSensorSettings] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [accelerometerSubscription, setAccelerometerSubscription] = useState(null);
  const [gyroSubscription, setGyroSubscription] = useState(null);

  const accelerometerContent = useRef({
    header: 'x;y;z;date',
    data: [],
  });

  const gyroContent = useRef({
    header: 'x;y;z;date',
    data: [],
  });

  const gpsContent = useRef({
    header: 'lat;lon;kmh;date',
    data: [],
  });

  const onStartDate = useRef('');

  const accelerometerEnabled = sensorSettings.sensors.includes('ACCELEROMETER');
  const gpsEnabled = sensorSettings.sensors.includes('GPS');
  const gyroEnabled = sensorSettings.sensors.includes('GYRO');

  function _unsubscribe(subscription, setSubscription) {
    subscription && subscription.remove();
    setSubscription(null);
  }

  function getUpdateInterval(sensorType) {
    return (1 / Number(generalSettings?.sensor[`${sensorType}Rate`])) * 1000 || 1000;
  }

  function _subscribe(sensor, setSubscription, setData) {
    let sensorType = 'accelerometer';

    if (sensor === Gyroscope) {
      sensorType = 'gyro';
    }

    sensor.setUpdateInterval(getUpdateInterval(sensorType));
    setSubscription(sensor.addListener(setData));
  }

  async function handleOnStartMeasurement() {
    if (isMonitoring) {
      if (gpsEnabled) {
        stopLocationTracking();
      }

      if (accelerometerEnabled) {
        _unsubscribe(accelerometerSubscription, setAccelerometerSubscription);
      }

      if (gyroEnabled) {
        _unsubscribe(gyroSubscription, setGyroSubscription);
      }

      const accFilename = `${onStartDate.current}-Acc.txt`;
      const gpsFilename = `${onStartDate.current}-GPS.txt`;
      const gyroFilename = `${onStartDate.current}-Gyro.txt`;
      const configFilename = `${onStartDate.current}-Config.txt`;

      const dirpath = `${FileSystem.cacheDirectory}files/${onStartDate.current}`;

      let accelerometerContentString = accelerometerContent.current.header;
      let gyroContentString = gyroContent.current.header;
      let gpsContentString = gpsContent.current.header;

      accelerometerContent.current.data.forEach(el => {
        accelerometerContentString += `\n${el.x};${el.y};${el.z};${el.date}`;
      });

      gyroContent.current.data.forEach(el => {
        gyroContentString += `\n${el.x};${el.y};${el.z};${el.date}`;
      });

      gpsContent.current.data.forEach(el => {
        gpsContentString += `\n${el.lat};${el.lon};${el.kmh};${el.date}`;
      });

      await FileSystem.writeAsStringAsync(`${dirpath}/${accFilename}`, accelerometerContentString);
      await FileSystem.writeAsStringAsync(`${dirpath}/${gyroFilename}`, gyroContentString);
      await FileSystem.writeAsStringAsync(`${dirpath}/${gpsFilename}`, gpsContentString);
      if (generalSettings) {
        await FileSystem.writeAsStringAsync(`${dirpath}/${configFilename}`, JSON.stringify(generalSettings));
      }
    } else {
      if (gpsEnabled) {
        startLocationTracking();
      }

      if (accelerometerEnabled) {
        _subscribe(Accelerometer, setAccelerometerSubscription, setAccelerometerData);
      }

      if (gyroEnabled) {
        _subscribe(Gyroscope, setGyroSubscription, setGyroData);
      }

      onStartDate.current = dayjs().format('YYYY-MM-DD_HH-mm-ss');
      const dirpath = `${FileSystem.cacheDirectory}files/${onStartDate.current}`;
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

    if (!clientLocation) {
      const location = await Location.watchPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: Number(generalSettings?.sensor.gpsRate) || 5000
      },(newLocation) => {
        const { coords } = newLocation;
        const { altitude, latitude, longitude, speed } = coords;
        setLocation({
          altitude,
          latitude,
          longitude,
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
    if (!isMonitoring) return;
    if (accelerometerData?.x || accelerometerData?.y || accelerometerData?.z) {
      accelerometerContent.current.data.push({
        x: accelerometerData.x,
        y: accelerometerData.y,
        z: accelerometerData.z,
        date: formatDate()
      });
    }
  }, [accelerometerData?.x, accelerometerData?.y, accelerometerData?.z, isMonitoring]);

  useEffect(() => {
    if (!isMonitoring) return;
    if (gyroData?.x || gyroData?.y || gyroData?.z) {
      gyroContent.current.data.push({
        x: gyroData.x,
        y: gyroData.y,
        z: gyroData.z,
        date: formatDate()
      });
    }
  }, [gyroData?.x, gyroData?.y, gyroData?.z, isMonitoring]);

  useEffect(() => {
    if (!isMonitoring) return;
    if (!location) return;
    gpsContent.current.data.push({
      lat: location.latitude,
      lon: location.longitude,
      kmh: speed,
      date: formatDate()
    });
  }, [isMonitoring, location, speed]);

  const formatDate = () => {
    return dayjs().format('YY-MM-DD HH:mm:ss:sss');
  };

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
                <Text fontSize="md">x: { accelerometerData?.x.toFixed(6)  || '-'} m/s²</Text>
                <Text fontSize="md">y: { accelerometerData?.y.toFixed(6)  || '-'} m/s²</Text>
                <Text fontSize="md">z: { accelerometerData?.z.toFixed(6)  || '-'} m/s²</Text>
              </VStack>
            </HStack>
            <HStack justifyContent="space-between">
              <Text fontSize="md" fontWeight="medium">Giroscópio</Text>
              <VStack>
                <Text fontSize="md">x: { gyroData?.x.toFixed(6)  || '-'} °/s</Text>
                <Text fontSize="md">y: { gyroData?.y.toFixed(6)  || '-'} °/s</Text>
                <Text fontSize="md">z: { gyroData?.z.toFixed(6)  || '-'} °/s</Text>
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
