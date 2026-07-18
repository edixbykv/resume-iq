import { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import { StyleSheet, SafeAreaView, Platform, StatusBar as RNStatusBar, View, Text, ActivityIndicator, BackHandler } from 'react-native';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleBackPress = () => {
      if (webViewRef.current && canGoBack) {
        webViewRef.current.goBack();
        return true; // Prevents the default back action (closing the app)
      }
      return false; // default behavior (close app if no history)
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => subscription.remove();
  }, [canGoBack]);

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar style="light" />
        <View style={styles.splashContent}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>ResumeIQ</Text>
          </View>
          <Text style={styles.tagline}>AI Resume Intelligence</Text>
          <ActivityIndicator size="small" color="#6366f1" style={styles.loader} />
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>build by kvai.in</Text>
        </View>
      </View>
    );
  }

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 50,
  },
  splashContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBadge: {
    backgroundColor: '#1e1b4b',
    borderWidth: 1,
    borderColor: '#4338ca',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  loader: {
    marginTop: 30,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
    letterSpacing: 1,
  },
});

