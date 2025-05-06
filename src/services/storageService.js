// src/services/storageService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  PENDING_REGISTROS: 'pending_registros',
};

/**
 * Guarda registros pendientes en el almacenamiento local
 * @param {Object} registro - Registro a guardar
 * @returns {Promise<boolean>} - True si se guardó correctamente
 */
export const guardarRegistroPendiente = async (registro) => {
  try {
    // Obtener los registros pendientes actuales
    const registrosActuales = await obtenerRegistrosPendientes();
    
    // Agregar un ID temporal local y timestamp
    const registroConId = {
      ...registro,
      tempId: `temp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    
    // Agregar el nuevo registro a la lista
    const nuevosRegistros = [...registrosActuales, registroConId];
    
    // Guardar la lista actualizada
    await AsyncStorage.setItem(
      STORAGE_KEYS.PENDING_REGISTROS,
      JSON.stringify(nuevosRegistros)
    );
    
    return true;
  } catch (error) {
    console.error('Error al guardar registro pendiente:', error);
    return false;
  }
};

/**
 * Obtiene todos los registros pendientes
 * @returns {Promise<Array>} - Array con los registros pendientes
 */
export const obtenerRegistrosPendientes = async () => {
  try {
    const registrosPendientesJSON = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_REGISTROS);
    return registrosPendientesJSON ? JSON.parse(registrosPendientesJSON) : [];
  } catch (error) {
    console.error('Error al obtener registros pendientes:', error);
    return [];
  }
};

/**
 * Elimina registros pendientes específicos por tempId
 * @param {Array<string>} tempIds - Array de IDs temporales a eliminar
 * @returns {Promise<boolean>} - True si se eliminaron correctamente
 */
export const eliminarRegistrosPendientes = async (tempIds) => {
  try {
    // Obtener todos los registros pendientes
    const registros = await obtenerRegistrosPendientes();
    
    // Filtrar los registros que NO estén en la lista de tempIds
    const registrosFiltrados = registros.filter(
      (registro) => !tempIds.includes(registro.tempId)
    );
    
    // Guardar la lista actualizada
    await AsyncStorage.setItem(
      STORAGE_KEYS.PENDING_REGISTROS,
      JSON.stringify(registrosFiltrados)
    );
    
    return true;
  } catch (error) {
    console.error('Error al eliminar registros pendientes:', error);
    return false;
  }
};

/**
 * Limpia todos los registros pendientes
 * @returns {Promise<boolean>} - True si se limpiaron correctamente
 */
export const limpiarRegistrosPendientes = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_REGISTROS);
    return true;
  } catch (error) {
    console.error('Error al limpiar registros pendientes:', error);
    return false;
  }
};

/**
 * Cuenta la cantidad de registros pendientes
 * @returns {Promise<number>} - Número de registros pendientes
 */
export const contarRegistrosPendientes = async () => {
  try {
    const registros = await obtenerRegistrosPendientes();
    return registros.length;
  } catch (error) {
    console.error('Error al contar registros pendientes:', error);
    return 0;
  }
};