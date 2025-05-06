// src/services/syncService.js
import NetInfo from '@react-native-community/netinfo';
import { 
  obtenerRegistrosPendientes, 
  eliminarRegistrosPendientes 
} from './storageService';

// Esta función debería ser reemplazada por tu API real
const enviarRegistroAlServidor = async (registro) => {
  // Aquí iría tu lógica de API real
  // Por ejemplo: return api.post('/registros', registro);
  
  // Este es un ejemplo simulado
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Registro sincronizado con el servidor:', registro);
      resolve({ 
        success: true, 
        data: { 
          id: 'server_' + Date.now(),
          ...registro
        } 
      });
    }, 1000);
  });
};

/**
 * Sincroniza todos los registros pendientes con el servidor
 * @param {Function} onProgress - Callback para informar progreso (opcional)
 * @returns {Promise<{success: boolean, syncedCount: number, errors: Array}>}
 */
export const sincronizarRegistrosPendientes = async (onProgress = null) => {
  // Verificar si hay conexión a internet
  const netInfoState = await NetInfo.fetch();
  if (!netInfoState.isConnected || !netInfoState.isInternetReachable) {
    return { 
      success: false, 
      syncedCount: 0, 
      errors: ['No hay conexión a internet'] 
    };
  }
  
  // Obtener los registros pendientes
  const registrosPendientes = await obtenerRegistrosPendientes();
  
  if (registrosPendientes.length === 0) {
    return { 
      success: true, 
      syncedCount: 0, 
      errors: [] 
    };
  }
  
  // Para almacenar los IDs de los registros sincronizados exitosamente
  const registrosSincronizados = [];
  const errores = [];
  
  // Sincronizar uno por uno
  for (let i = 0; i < registrosPendientes.length; i++) {
    const registro = registrosPendientes[i];
    
    try {
      // Informar progreso si se proporcionó un callback
      if (onProgress) {
        onProgress({
          total: registrosPendientes.length,
          current: i + 1,
          percentage: Math.round(((i + 1) / registrosPendientes.length) * 100)
        });
      }
      
      // Enviar al servidor
      const respuesta = await enviarRegistroAlServidor(registro);
      
      if (respuesta.success) {
        registrosSincronizados.push(registro.tempId);
      } else {
        errores.push(`Error al sincronizar ${registro.tempId}: ${respuesta.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al sincronizar registro:', error, registro);
      errores.push(`Error al sincronizar ${registro.tempId}: ${error.message || error}`);
    }
  }
  
  // Eliminar los registros sincronizados exitosamente
  if (registrosSincronizados.length > 0) {
    await eliminarRegistrosPendientes(registrosSincronizados);
  }
  
  return {
    success: errores.length === 0,
    syncedCount: registrosSincronizados.length,
    errors: errores
  };
};

/**
 * Configura un intervalo para intentar sincronizar automáticamente 
 * @param {number} intervalMinutes - Minutos entre intentos de sincronización
 * @param {Function} onSyncComplete - Callback a ejecutar cuando se complete la sincronización
 * @returns {Function} - Función para detener la sincronización automática
 */
export const configurarSincronizacionAutomatica = (
  intervalMinutes = 15, 
  onSyncComplete = null
) => {
  const intervalMs = intervalMinutes * 60 * 1000;
  
  const intervalId = setInterval(async () => {
    const netInfoState = await NetInfo.fetch();
    
    // Solo intentar sincronizar si hay conexión a internet
    if (netInfoState.isConnected && netInfoState.isInternetReachable) {
      console.log('Iniciando sincronización automática...');
      const resultado = await sincronizarRegistrosPendientes();
      
      if (onSyncComplete) {
        onSyncComplete(resultado);
      }
    }
  }, intervalMs);
  
  // Devolver función para detener la sincronización automática
  return () => clearInterval(intervalId);
};

/**
 * Configura un listener para sincronizar cuando la conexión esté disponible
 * @param {Function} onSyncComplete - Callback a ejecutar cuando se complete la sincronización
 * @returns {Function} - Función para eliminar el listener
 */
export const sincronizarAlReconectar = (onSyncComplete = null) => {
  let isFirstConnect = true;
  
  const unsubscribe = NetInfo.addEventListener(async (state) => {
    // Evitar sincronización en la primera carga de la app
    if (isFirstConnect) {
      isFirstConnect = false;
      return;
    }
    
    // Si recuperamos la conexión, intentar sincronizar
    if (state.isConnected && state.isInternetReachable) {
      console.log('Conexión recuperada. Iniciando sincronización...');
      const resultado = await sincronizarRegistrosPendientes();
      
      if (onSyncComplete) {
        onSyncComplete(resultado);
      }
    }
  });
  
  return unsubscribe;
};