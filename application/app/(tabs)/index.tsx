import TodaySitesCard from '@/components/Home/TodaySitesCard';
import { useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AttendanceCard from '../../components/Home/AttendanceCard';
import CameraModal from '../../components/Home/CameraModal';
import Header from '../../components/common/Header';
import SiteModal from '../../components/Home/SiteModal';
import { checkIn as apiCheckIn, checkOut as apiCheckOut, getAttendance } from '../../services/attendance.service';
import { getFormattedDate, getFormattedTime, getGreeting, getDatabaseFormatTime, convertToIST, extractTime, getISTDate, toUTCDate } from '../../utils/timeHelpers';
import { getCurrentLocation } from '../../utils/locationHelpers';

import LoadingOverlay from '../../components/common/LoadingOverlay';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const [currentTime, setCurrentTime] = useState(getFormattedTime());
  const [currentDate] = useState(getFormattedDate());
  const [greeting, setGreeting] = useState(getGreeting());

  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [workingHrs, setWorkingHrs] = useState('0h 0m');
  const checkInDate = React.useRef<Date | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [siteModalOpen, setSiteModalOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [punchType, setPunchType] = useState<'in' | 'out'>('in');
  const [currentAttendanceId, setCurrentAttendanceId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const [todaySites, setTodaySites] = useState<{ site: string; checkIn: string; checkOut?: string }[]>([]);
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();

  // Photo capture not used in stats, but logged to console
  const [, setPunchLog] = useState<{
    punchInTime: string | null;
    punchInPhoto: { uri: string; width: number; height: number } | null;
    punchOutTime: string | null;
  }>({
    punchInTime: null,
    punchInPhoto: null,
    punchOutTime: null,
  });


  const locationPromise = React.useRef<Promise<import('../../utils/locationHelpers').LocationData> | null>(null);
  const locationResult = React.useRef<import('../../utils/locationHelpers').LocationData | null>(null);

  const fetchTodayAttendance = async () => {
    try {
      const now = getISTDate();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const yy = now.getUTCFullYear(), mm = pad(now.getUTCMonth() + 1), dd = pad(now.getUTCDate());
      const startOfDay = `${yy}-${mm}-${dd} 00:00:00`;
      const endOfDay = `${yy}-${mm}-${dd} 23:59:59`;

      const response = await getAttendance({ startDate: startOfDay, endDate: endOfDay });
      
      if (response?.success && response?.data) {
        const sortedTodayRecords = [...response.data].sort((a: any, b: any) => new Date(a.CheckInTime).getTime() - new Date(b.CheckInTime).getTime());

        const mappedSites = sortedTodayRecords.map((r: any) => ({
          site: r.Address || r.DynamicAddress || 'Unknown Site',
          checkIn: r.CheckInTime ? extractTime(r.CheckInTime) : '--:--',
          checkOut: r.CheckOutTime ? extractTime(r.CheckOutTime) : undefined,
        }));
        
        setTodaySites(mappedSites);

        if (sortedTodayRecords.length > 0) {
          const lastRecord = sortedTodayRecords[sortedTodayRecords.length - 1];
          
          if (lastRecord.CheckInTime) {
            setCheckInTime(extractTime(lastRecord.CheckInTime)); 
          }
          
          let totalMs = 0;
          if (lastRecord.CheckInTime && lastRecord.CheckOutTime) {
            totalMs = toUTCDate(lastRecord.CheckOutTime!).getTime() - toUTCDate(lastRecord.CheckInTime!).getTime();
          } else if (lastRecord.CheckInTime && !lastRecord.CheckOutTime) {
            totalMs = getISTDate().getTime() - toUTCDate(lastRecord.CheckInTime!).getTime();
          }
          const totalMins = Math.floor(totalMs / 60000);
          setWorkingHrs(`${Math.floor(totalMins / 60)}h ${totalMins % 60}m`);

          if (!lastRecord.CheckOutTime) {
             setIsPunchedIn(true);
             setCurrentAttendanceId(lastRecord.AttendanceId.toString());
             if (lastRecord.CheckInTime) {
               checkInDate.current = toUTCDate(lastRecord.CheckInTime);
             }
             setCheckOutTime(null);
          } else {
             setIsPunchedIn(false);
             setCheckOutTime(lastRecord.CheckOutTime ? extractTime(lastRecord.CheckOutTime) : null);
          }
        } else {
          setIsPunchedIn(false);
          setCheckInTime(null);
          setCheckOutTime(null);
          setWorkingHrs('0h 0m');
          setTodaySites([]);
        }
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTodayAttendance();
    }, [])
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getFormattedTime());
      setGreeting(getGreeting());
      
      if (isPunchedIn && checkInDate.current) {
         const diffMs = getISTDate().getTime() - checkInDate.current.getTime();
         const totalMins = Math.floor(diffMs / 60000);
         setWorkingHrs(`${Math.floor(totalMins / 60)}h ${totalMins % 60}m`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isPunchedIn]);

  const handlePunch = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert('Permission Denied', 'Camera permission is required.');
        return;
      }
    }
    locationResult.current = null;
    locationPromise.current = null;
    setPunchType(isPunchedIn ? 'out' : 'in');

    // Show loader while GPS fetches
    setProcessing(true);
    setLoadingMessage('Fetching GPS location...');
    try {
      const loc = await getCurrentLocation();
      locationResult.current = loc;
    } finally {
      setProcessing(false);
    }

    // GPS done — open camera
    setCameraOpen(true);
  };

  const handleCapture = (photoUri: string) => {
    setCapturedPhoto(photoUri);
    setCameraOpen(false);

    if (punchType === 'out') {
      // Get the site from the last check-in
      const activeSite = todaySites.length > 0 ? todaySites[todaySites.length - 1].site : 'Unknown Site';
      // Bypass the SiteModal and directly submit
      handleSiteSubmit(activeSite, photoUri);
    } else {
      setSiteModalOpen(true);
    }
  };

  const handleSiteSubmit = async (site: string, photoToSubmit?: string) => {
    const finalPhoto = photoToSubmit || capturedPhoto;
    const time = getFormattedTime();
    const dbTime = getDatabaseFormatTime();

    setProcessing(true); // Start Loader
    setLoadingMessage(punchType === 'in' ? 'Checking in...' : 'Checking out...');

    try {
      // Use cached GPS result (already fetched before camera opened)
      const loc = locationResult.current ?? await getCurrentLocation();
      locationResult.current = null;

      if (loc.error) {
        console.warn('Location error:', loc.error);
      }

      const lat = loc.latitude ? loc.latitude.toString() : '';
      const lng = loc.longitude ? loc.longitude.toString() : '';

      // Normalize URI for React Native FormData
      const getNormalizedUri = (uri: string) => {
        if (Platform.OS === 'android' && !uri.startsWith('file://')) {
          return `file://${uri}`;
        }
        return uri;
      };

      if (punchType === 'in') {
        const payload: import('../../services/attendance.service').CheckInPayload = {
          CheckInTime: dbTime,
          CheckInLatitude: lat,
          CheckInLongitude: lng,
          IsWithinGeoFence: true,
          Remarks: '',
          DynamicAddress: loc.address || site, // Use fetched address or fallback to site
          LocationSource: 'GPS',
          AccuracyMeters: loc.accuracy ? Math.round(loc.accuracy) : 5,
          FaceVerified: true,
          ImageTimestamp: dbTime,
          DeviceInfo: 'Android',
          LocalId: `${Date.now()}`,
          Address: site,
        };

        if (finalPhoto) {
          payload.checkInImage = {
            uri: getNormalizedUri(finalPhoto),
            name: `checkin-${Date.now()}.jpg`,
            type: 'image/jpeg',
          };
        }


        try {
          const response = await apiCheckIn(payload);
          setSiteModalOpen(false);
          setCameraOpen(false);
          await fetchTodayAttendance();
          Alert.alert('Success', 'Attendance checked in successfully.');
        } catch (err: unknown) {
          const error = err as any;
          const apiResponse = error?.response?.data;
          if (apiResponse && apiResponse.error && Array.isArray(apiResponse.error)) {
            const errorMessages = apiResponse.error.map((e: any) => `${e.field}: ${e.message}`).join('\n');
            Alert.alert('Check-In Failed', apiResponse.message + '\n\n' + errorMessages);
          } else if (apiResponse && apiResponse.message) {
            Alert.alert('Check-In Failed', apiResponse.message);
          } else {
            Alert.alert('Check-In Failed', 'Unable to store attendance. Please try again.');
          }
        }
      } else {
        // Check-Out
        const payload: import('../../services/attendance.service').CheckOutPayload = {
          CheckOutTime: dbTime,
          CheckOutLatitude: lat,
          CheckOutLongitude: lng,
          Remarks: '',
          DynamicAddress: loc.address || site,
          LocationSource: 'GPS',
          AccuracyMeters: loc.accuracy ? Math.round(loc.accuracy) : 5,
          FaceVerified: true,
          ImageTimestamp: dbTime,
          DeviceInfo: 'Android',
          Address: site,
        };

        if (finalPhoto) {
          payload.checkOutImage = {
            uri: getNormalizedUri(finalPhoto),
            name: `checkout-${Date.now()}.jpg`,
            type: 'image/jpeg',
          };
        }

        try {
          const idToUse: any = currentAttendanceId;

          const response = await apiCheckOut(idToUse, payload);

          if (response?.success) {
            setSiteModalOpen(false);
            setCameraOpen(false);
            await fetchTodayAttendance();
            Alert.alert('Success', response.message || 'Check-out successful.');
          } else {
            Alert.alert('Error', response?.message || 'Something went wrong');
          }

        } catch (err: unknown) {
          const error = err as any;
          const apiResponse = error?.response?.data;
          console.error('Attendance check-out failed:', apiResponse || error?.message || error);

          if (apiResponse && apiResponse.error && Array.isArray(apiResponse.error)) {
            const errorMessages = apiResponse.error.map((e: any) => `${e.field}: ${e.message}`).join('\n');
            Alert.alert('Check-Out Failed', apiResponse.message + '\n\n' + errorMessages);
          } else if (apiResponse && apiResponse.message) {
            Alert.alert('Check-Out Failed', apiResponse.message);
          } else {
            Alert.alert('Check-Out Failed', 'Unable to store checkout attendance. Please try again.');
          }
        }
      }
    } finally {
      setProcessing(false); // Stop Loader
    }
  };

  return (
    <>
      <LoadingOverlay visible={processing} message={loadingMessage} />
      <CameraModal visible={cameraOpen} onClose={() => setCameraOpen(false)} onCapture={handleCapture} />
      <SiteModal visible={siteModalOpen} onSubmit={handleSiteSubmit} onClose={() => setSiteModalOpen(false)} />
      <LinearGradient colors={['#f8f9fa', '#f1f3f5', '#e9ecef']} style={styles.root}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: insets.top + 10,
              paddingBottom: insets.bottom + 100,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Header greeting={greeting} />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Attendance</Text>
            <Pressable onPress={() => router.push('/attendance')}>
              <Text style={styles.seeAll}>View Details</Text>
            </Pressable>
          </View>

          <AttendanceCard
            currentTime={currentTime}
            currentDate={currentDate}
            isPunchedIn={isPunchedIn}
            checkInTime={checkInTime}
            checkOutTime={checkOutTime}
            workingHrs={workingHrs}
            onPunch={handlePunch}
          />

          {/* Today's Site Visits */}
          <TodaySitesCard sites={todaySites} isPunchedIn={isPunchedIn} />

          <View style={{ height: 24 }} />
        </ScrollView>
      </LinearGradient>
    </>
  );
}

// Styles (keep what's missing)
const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingVertical: 10 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
    marginTop: 10,
  },
  sectionTitle: { color: '#111827', fontSize: 18, fontWeight: '800' },
  seeAll: { color: '#6b7280', fontSize: 13, fontWeight: '600' },
});