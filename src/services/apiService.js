// src/services/apiService.js
import axios from "axios";

// URL base de la API
const API_URL = 'http://www.intranet.gamadero.cdmx.gob.mx/INVENTARIOGAM/public/api';

/**
 * Función para manejar errores de red y formatearlos
 * @param {Error} error - Error capturado
 * @returns {Object} Objeto de error formateado
 */
const handleError = (error) => {
  console.error('Error de API:', error);
  
  let errorMessage = 'Error al conectar con la API';
  let errorDetails = null;
  
  if (error.response) {
    console.log('Datos del error:', error.response.data);
    console.log('Estado del error:', error.response.status);
    console.log('Detalles completos del error:', JSON.stringify(error.response.data, null, 2));
    
    errorMessage = `Error ${error.response.status}: ${error.response.statusText || 'Error del servidor'}`;
    errorDetails = error.response.data;
    
    // Mostrar detalles adicionales para errores
    if (error.response.status === 500) {
      console.log('Error 500 (Error interno del servidor)');
      if (error.response.data && error.response.data.message) {
        console.log('Mensaje del error:', error.response.data.message);
      }
    }
    
    // Mostrar errores de validación
    if (error.response.data && error.response.data.errors) {
      console.log('Errores de validación:', error.response.data.errors);
      console.log('Detalles de errores:');
      Object.entries(error.response.data.errors).forEach(([campo, errores]) => {
        console.log(` ${campo}: ${errores.join(', ')}`);
      });
    }
  } else if (error.request) {
    // Error de solicitud (no se pudo enviar la solicitud al servidor)
    console.log('Petición sin respuesta:', error.request);
    errorMessage = 'No se pudo establecer conexión con el servidor';
  } else {
    // Cualquier otro tipo de error
    console.log('Mensaje de error:', error.message);
    errorMessage = error.message || 'Error desconocido';
  }
  
  return {
    success: false,
    data: null,
    error: errorMessage,
    details: errorDetails
  };
};

/**
 * Verifica si hay conexión a Internet
 * @returns {Promise<boolean>} - True si hay conexión, false si no
 */
export const checkConnection = async () => {
  try {
    // Usamos Axios para verificar si podemos hacer una solicitud a la API
    await axios.head(`${API_URL}/inventariocomputo`, {
      timeout: 5000
    });
    return true;
  } catch (error) {
    console.log('Error de conexión:', error);
    return false;
  }
};

/**
 * Obtiene todos los registros de inventario
 * @returns {Promise<Object>} Respuesta con los registros
 */
export const getInventario = async () => {
  try {
    console.log('Obteniendo lista de inventario...');
    
    const response = await axios.get(`${API_URL}/inventariocomputo`);
    
    console.log('Datos recibidos:', response.data);
    
    return {
      success: true,
      data: response.data,
      error: null
    };
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Obtiene un equipo específico por ID
 * @param {number} id - ID del equipo a obtener
 * @returns {Promise<Object>} Respuesta con el registro
 */
export const getEquipoById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/inventariocomputo/${id}`);
    
    return {
      success: true,
      data: response.data,
      error: null
    };
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Registra un nuevo equipo en el inventario
 * @param {Object} datos - Datos del equipo a registrar
 * @returns {Promise<Object>} Respuesta con el resultado de la operación
 */
export const registrarEquipo = async (datos) => {
  try {
    console.log('Registrando nuevo equipo...');
    
    // Formatear los datos según la estructura esperada por la API
    const datosFormateados = {
      bien_informatico: datos.bien_informatico,
      modelo: datos.modelo,
      numero_serie: datos.numero_serie,
      numero_inventario: datos.numero_inventario,
      contrato_adquisicion: datos.contrato_adquisicion || '',
      fecha_entrega: datos.fecha_entrega,
      responsable: datos.responsable,
      ubicacion: datos.ubicacion,
      area_asignada: datos.area_asignada,
      estatus: datos.estatus,
      fecha_captura: datos.fecha_captura
    };
    
    console.log('Enviando datos a la ruta correcta:', datosFormateados);
    
    // Usar exactamente la ruta definida en routes/api.php
    const response = await axios.post(
      `${API_URL}/inventariocomputo/Create`, // Nota: 'Create' con C mayúscula como está en tu ruta
      datosFormateados,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('Respuesta del servidor:', response.data);
    
    return {
      success: true,
      data: response.data,
      error: null,
      method: 'POST a Create'
    };
  } catch (error) {
    console.error("Error registrando equipo:", error);
    return handleError(error);
  }
};

/**
 * Actualiza un equipo existente
 * @param {number} id - ID del equipo a actualizar
 * @param {Object} datos - Datos actualizados
 * @returns {Promise<Object>} Respuesta con el resultado de la operación
 */
export const actualizarEquipo = async (id, datos) => {
  try {
    // Formatear los datos según la estructura esperada por la API
    const datosFormateados = {
      bien_informatico: datos.bien_informatico,
      modelo: datos.modelo,
      numero_serie: datos.numero_serie,
      numero_inventario: datos.numero_inventario,
      contrato_adquisicion: datos.contrato_adquisicion || '',
      fecha_entrega: datos.fecha_entrega,
      responsable: datos.responsable,
      ubicacion: datos.ubicacion,
      area_asignada: datos.area_asignada,
      estatus: datos.estatus,
      fecha_captura: datos.fecha_captura
    };
    
    // Basado en las convenciones de Laravel, probablemente la ruta de actualización es
    const response = await axios.get(`${API_URL}/inventariocomputo/editar/${id}`, {
      params: datosFormateados
    });
    
    return {
      success: true,
      data: response.data,
      error: null
    };
  } catch (error) {
    // Si la primera forma falla, intentamos con otra convención común
    try {
      const response = await axios.get(`${API_URL}/inventariocomputo/actualizar/${id}`, {
        params: datos
      });
      
      return {
        success: true,
        data: response.data,
        error: null
      };
    } catch (error2) {
      return handleError(error);
    }
  }
};

/**
 * Elimina un equipo del inventario
 * @param {number} id - ID del equipo a eliminar
 * @returns {Promise<Object>} Respuesta con el resultado de la operación
 */
export const eliminarEquipo = async (id) => {
  try {
    // Basado en las convenciones de Laravel, probablemente la ruta de eliminación es
    const response = await axios.get(`${API_URL}/inventariocomputo/eliminar/${id}`);
    
    return {
      success: true,
      data: response.data,
      error: null
    };
  } catch (error) {
    return handleError(error);
  }
};

// Exportación por defecto
export default {
  checkConnection,
  getInventario,
  getEquipoById,
  registrarEquipo,
  actualizarEquipo,
  eliminarEquipo
};