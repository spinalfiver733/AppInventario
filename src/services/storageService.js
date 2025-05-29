// src/services/storageService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  PENDING_REGISTROS: 'pending_registros',
  USER_COUNTERS: 'user_counters'  // Nueva clave para almacenar contadores
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
 * Obtiene el siguiente contador para un usuario específico
 * @param {string} usuarioId - ID del usuario (ej: T10-U01)
 * @returns {Promise<string>} - Contador formateado (ej: 0001)
 */
export const obtenerSiguienteContador = async (usuarioId) => {
  try {
    // Obtener contadores existentes
    const contadoresJSON = await AsyncStorage.getItem(STORAGE_KEYS.USER_COUNTERS);
    const contadores = contadoresJSON ? JSON.parse(contadoresJSON) : {};
    
    // Obtener el último contador para este usuario o inicializar en 0
    let ultimoContador = contadores[usuarioId] || 0;
    
    // Incrementar el contador
    ultimoContador += 1;
    
    // Guardar el nuevo contador
    contadores[usuarioId] = ultimoContador;
    await AsyncStorage.setItem(STORAGE_KEYS.USER_COUNTERS, JSON.stringify(contadores));
    
    // Formatear el contador con ceros a la izquierda
    return ultimoContador.toString().padStart(4, '0');
  } catch (error) {
    console.error('Error al obtener siguiente contador:', error);
    // En caso de error, usar timestamp como fallback
    const fallback = Date.now().toString().slice(-4);
    return fallback;
  }
};

/**
 * Genera un ID único para un registro basado en el usuario
 * @param {string} usuarioId - ID del usuario (ej: T10-U01)
 * @returns {Promise<string>} - ID único (ej: T10-U01-0001)
 */
export const generarIdUnicoRegistro = async (usuarioId) => {
  if (!usuarioId) {
    return `SIN-USUARIO-${Date.now().toString().slice(-8)}`;
  }
  
  const contador = await obtenerSiguienteContador(usuarioId);
  return `${usuarioId}-${contador}`;
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
    
    // Generar ID único para este registro basado en el usuario
    let idRegistro = 'SIN-ID';
    if (registro.usuario_id) {
      idRegistro = await generarIdUnicoRegistro(registro.usuario_id);
    }
    
    // Agregar un ID temporal local, timestamp y el ID único
    const registroConId = {
      ...registro,
      tempId: `temp_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      createdAt: new Date().toISOString(),
      id_registro: idRegistro
    };
    
    // Agregar el nuevo registro a la lista
    const nuevosRegistros = [...registrosActuales, registroConId];
    
    // Guardar la lista actualizada
    await AsyncStorage.setItem(
      STORAGE_KEYS.PENDING_REGISTROS,
      JSON.stringify(nuevosRegistros)
    );
    
    console.log(`Registro guardado localmente con ID: ${idRegistro} (tempId: ${registroConId.tempId})`);
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

/**
 * Reinicia todos los contadores de usuarios
 * @returns {Promise<boolean>} - True si se reiniciaron correctamente
 */
export const reiniciarContadores = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_COUNTERS);
    console.log('Se han reiniciado todos los contadores de usuarios');
    return true;
  } catch (error) {
    console.error('Error al reiniciar contadores:', error);
    return false;
  }
};

// Exportación de todas las funciones
export default {
  guardarRegistroPendiente,
  obtenerRegistrosPendientes,
  eliminarRegistrosPendientes,
  limpiarRegistrosPendientes,
  contarRegistrosPendientes,
  repararDuplicadosPendientes,
  generarIdUnicoRegistro,
  obtenerSiguienteContador,
  reiniciarContadores
};