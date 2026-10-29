import { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import { StyleSheet, SafeAreaView, Platform, StatusBar as RNStatusBar, View, Animated, Image, ActivityIndicator, BackHandler } from 'react-native';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const [pageLoaded, setPageLoaded] = useState(false);
  const [minTimeDone, setMinTimeDone] = useState(false);

  // Splash overlay picks up exactly where the native splash leaves off (same logo, same spot)
  const loaderFadeAnim = useRef(new Animated.Value(0)).current;
  const containerFadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(loaderFadeAnim, {
      toValue: 1,
      duration: 400,
      delay: 300,
      useNativeDriver: true,
    }).start();

    const minTimer = setTimeout(() => setMinTimeDone(true), 1200);
    // Never hold the user on the splash if the site is slow or offline
    const maxTimer = setTimeout(() => setPageLoaded(true), 8000);
    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
    };
  }, []);

  useEffect(() => {
    if (!showSplash || !pageLoaded || !minTimeDone) return;
    Animated.timing(containerFadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => setShowSplash(false));
  }, [pageLoaded, minTimeDone]);

  useEffect(() => {
    const handleBackPress = () => {
      if (webViewRef.current && canGoBack) {
        webViewRef.current.goBack();
        return true; // Prevents default back (closing the app)
      }
      return false; // Closes the app if on home screen
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => subscription.remove();
  }, [canGoBack]);

  return (
    <View style={styles.rootContainer}>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <WebView
          ref={webViewRef}
          source={{ uri: 'https://resume.kvai.in' }}
          javaScriptEnabled
          domStorageEnabled
          allowsFullscreenVideo
          sharedCookiesEnabled
          startInLoadingState
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
          }}
          onLoadEnd={() => setPageLoaded(true)}
        />
      </SafeAreaView>

      {showSplash && (
        <Animated.View style={[styles.splashContainer, { opacity: containerFadeAnim }]}>
          <StatusBar style="light" />
          <Image
            source={require('./assets/splash-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Animated.View style={[styles.loader, { opacity: loaderFadeAnim }]}>
            <ActivityIndicator size="small" color="#EAB308" />
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#030F26', // Brand navy blue background
  },
  container: {
    flex: 1,
    backgroundColor: '#030F26', // Brand navy blue background
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  splashContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#030F26', // Brand navy blue background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  // Same 288dp box as the Android splash icon, so the logo does not move
  logoImage: {
    width: 288,
    height: 288,
  },
  loader: {
    position: 'absolute',
    bottom: '22%',
  },
});

