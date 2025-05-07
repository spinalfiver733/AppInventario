// src/services/storageService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  PENDING_REGISTROS: 'pending_registros',
};

/**
 * Genera una firma única para un registro basada en sus campos clave
 * @param {Object} registro - El registro del que se creará la firma
 * @returns {String} - Una cadena única que representa el registro
 */
const generarFirmaRegistro = (registro) => {
  // Seleccionar campos clave que identifican unívocamente a un registro
  const camposUnicos = [
    registro.bien_informatico,
    registro.modelo,
    registro.numero_serie,
    registro.numero_inventario,
    registro.fecha_entrega,
    registro.responsable
  ];
  
  // Crear una cadena única usando estos campos
  return camposUnicos.filter(Boolean).join('|').toLowerCase();
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
    
    // Generar firma única para este registro
    const firmaRegistroNuevo = generarFirmaRegistro(registro);
    
    // Verificar si ya existe un registro similar
    const existeDuplicado = registrosActuales.some(reg => {
      const firmaRegistroExistente = generarFirmaRegistro(reg);
      return firmaRegistroExistente === firmaRegistroNuevo;
    });
    
    if (existeDuplicado) {
      console.warn('Se detectó un registro similar que ya está pendiente de sincronización. No se guardará como duplicado.');
      return false;
    }
    
    // Agregar un ID temporal local y timestamp
    const registroConId = {
      ...registro,
      tempId: `temp_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      createdAt: new Date().toISOString(),
    };
    
    // Agregar el nuevo registro a la lista
    const nuevosRegistros = [...registrosActuales, registroConId];
    
    // Guardar la lista actualizada
    await AsyncStorage.setItem(
      STORAGE_KEYS.PENDING_REGISTROS,
      JSON.stringify(nuevosRegistros)
    );
    
    console.log(`Registro guardado localmente con ID temporal: ${registroConId.tempId}`);
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
    const registrosPendientes = registrosPendientesJSON ? JSON.parse(registrosPendientesJSON) : [];
    
    // Verificar si hay duplicados y advertir en la consola
    const firmas = new Map();
    let duplicadosEncontrados = false;
    
    registrosPendientes.forEach(reg => {
      const firma = generarFirmaRegistro(reg);
      if (firmas.has(firma)) {
        console.warn(`Advertencia: Se encontró un posible duplicado con tempId: ${reg.tempId}`);
        duplicadosEncontrados = true;
      } else {
        firmas.set(firma, reg.tempId);
      }
    });
    
    if (duplicadosEncontrados) {
      console.warn('Se detectaron posibles duplicados en los registros pendientes. Considera limpiar el almacenamiento.');
    }
    
    return registrosPendientes;
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
    
    if (tempIds.length === 0) {
      console.log('No se especificaron IDs para eliminar');
      return true;
    }
    
    console.log(`Eliminando ${tempIds.length} registros con IDs:`, tempIds);
    
    // Filtrar los registros que NO estén en la lista de tempIds
    const registrosFiltrados = registros.filter(
      (registro) => !tempIds.includes(registro.tempId)
    );
    
    console.log(`Quedan ${registrosFiltrados.length} registros pendientes después de eliminar`);
    
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
    console.log('Se han eliminado todos los registros pendientes');
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

/**
 * Repara duplicados en los registros pendientes
 * @returns {Promise<Object>} - Resultado de la reparación
 */
export const repararDuplicadosPendientes = async () => {
  try {
    const registros = await obtenerRegistrosPendientes();
    
    // Usar un Map para rastrear firmas únicas y eliminar duplicados
    const firmasUnicas = new Map();
    const registrosSinDuplicados = [];
    const duplicadosEliminados = [];
    
    for (const registro of registros) {
      const firma = generarFirmaRegistro(registro);
      
      if (!firmasUnicas.has(firma)) {
        // Si es la primera vez que vemos esta firma, guardamos el registro
        firmasUnicas.set(firma, registro.tempId);
        registrosSinDuplicados.push(registro);
      } else {
        // Si ya habíamos visto esta firma, es un duplicado
        duplicadosEliminados.push(registro.tempId);
      }
    }
    
    // Si encontramos duplicados, actualizamos el almacenamiento
    if (duplicadosEliminados.length > 0) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.PENDING_REGISTROS,
        JSON.stringify(registrosSinDuplicados)
      );
      
      console.log(`Se eliminaron ${duplicadosEliminados.length} registros duplicados`);
      
      return {
        success: true,
        eliminados: duplicadosEliminados.length,
        total: registrosSinDuplicados.length
      };
    }
    
    return {
      success: true,
      eliminados: 0,
      total: registros.length,
      mensaje: 'No se encontraron duplicados que reparar'
    };
  } catch (error) {
    console.error('Error al reparar duplicados:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Exportación de todas las funciones
export default {
  guardarRegistroPendiente,
  obtenerRegistrosPendientes,
  eliminarRegistrosPendientes,
  limpiarRegistrosPendientes,
  contarRegistrosPendientes,
  repararDuplicadosPendientes
};