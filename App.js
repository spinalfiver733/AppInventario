import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import RegistroBienesScreen from './src/screens/RegistroBienesScreen'; // Ajusta la ruta según tu estructura
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <RegistroBienesScreen />
        <StatusBar style="light" />
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7b1c34',
  },
});