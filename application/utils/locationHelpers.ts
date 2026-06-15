import * as Location from 'expo-location';

export interface LocationData {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  address: string | null;
  error?: string;
}

export const getCurrentLocation = async (): Promise<LocationData> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      return { 
        latitude: null, 
        longitude: null, 
        accuracy: null, 
        address: null,
        error: 'Permission to access location was denied' 
      };
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    let addressStr = '';
    try {
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      if (geocode && geocode.length > 0) {
        const addr = geocode[0];
        // Combine available address components
        addressStr = [
          addr.name,
          addr.street,
          addr.district,
          addr.city,
          addr.region,
          addr.postalCode
        ].filter(Boolean).join(', ');
      }
    } catch (e) {
      console.warn('Reverse geocoding failed:', e);
    }

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      address: addressStr || null,
    };
  } catch (error: any) {
    console.error('Error fetching location:', error);
    return { 
      latitude: null, 
      longitude: null, 
      accuracy: null, 
      address: null,
      error: error?.message || 'Unknown error fetching location' 
    };
  }
};
