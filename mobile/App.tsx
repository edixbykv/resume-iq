import { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import { StyleSheet, SafeAreaView, Platform, StatusBar as RNStatusBar, View, Animated, Image, ActivityIndicator, BackHandler } from 'react-native';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const webViewRef = useRef<WebView>(null);

  // Animated variables for splash screen transition
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.4)).current;
  const containerFadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Entrance animation (fade in and scale up the brand icon)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();

    // 2. Exit animation (smooth fade out of the overlay)
    const timer = setTimeout(() => {
      Animated.timing(containerFadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setShowSplash(false);
      });
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

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
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
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
      />

      {showSplash && (
        <Animated.View style={[styles.splashContainer, { opacity: containerFadeAnim }]}>
          <StatusBar style="light" />
          <View style={styles.splashContent}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: fadeAnim }}>
              <Image 
                source={require('./assets/splash-icon.png')} 
                style={styles.logoImage} 
                resizeMode="contain"
              />
            </Animated.View>
            <ActivityIndicator size="small" color="#EAB308" style={styles.loader} />
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030F26', // Brand navy blue background
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#030F26', // Brand navy blue background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  splashContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 220,
    height: 220,
  },
  loader: {
    marginTop: 35,
  },
});

