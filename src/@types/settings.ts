export type SensorSettingsType = {
  sensors: Array<'GPS' | 'ACCELEROMETER' | 'GYRO'>
};

export type GeneralSettingsType = {
  device: {
    brand: string;
    model: string;
    mountType?: 'MAGNETIC' | 'CLIP' | 'NO_MOUNT' | '';
  },
  vehicle: {
    brand?: string;
    km?: string;
  },
  sensor: {
    gpsRate?: string;
    accelerometerRate?: string;
    gyroRate: string;
  }
}
