import React, { useState, useEffect } from 'react';
import { SafeAreaView, StatusBar, View, Text } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import RegistroBienesScreen from './src/screens/RegistroBienesScreen';

// Simple Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: 'red', fontSize: 18, fontWeight: 'bold' }}>¡Ups! Algo salió mal</Text>
          <Text style={{ marginTop: 10 }}>{this.state.error?.toString()}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Simular un tiempo de carga para asegurarnos de que todo se inicialice correctamente
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Función para manejar login
  const handleLogin = (userData) => {
    setUser(userData);
  };

  // Función para manejar logout
  const handleLogout = () => {
    setUser(null);
  };
  
  if (isLoading) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#7b1c34" translucent={false} />
        <SafeAreaView style={{ flex: 1, backgroundColor: '#7b1c34' }} />
      </>
    );
  }
  
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#7b1c34" translucent={false} />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#7b1c34' }}>
        <ErrorBoundary>
          {user ? (
            <RegistroBienesScreen userData={user} onLogout={handleLogout} />
          ) : (
            <LoginScreen onLogin={handleLogin} />
          )}
        </ErrorBoundary>
      </SafeAreaView>
    </>
  );
}