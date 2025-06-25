import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

// Importaciones condicionales solo para plataformas nativas
let SQLite, Asset, FileSystem;
if (Platform.OS !== 'web') {
  try {
    SQLite = require('expo-sqlite');
    Asset = require('expo-asset').Asset;
    FileSystem = require('expo-file-system');
  } catch (error) {
    console.error('❌ Error cargando dependencias SQLite:', error);
  }
}

// Solo para demo en web (pocos empleados)
const EMPLEADOS_DEMO_WEB = [
  { no_emp: 859778, nombre: 'ROJAS HERNANDEZ ENRIQUE' },
  { no_emp: 19, nombre: 'VACANTE' },
  { no_emp: 186375, nombre: 'CHAVEZ ROSALES JOSE ARTURO' },
  { no_emp: 500, nombre: 'DIRECTOR GENERAL ADMINISTRATIVO' },
  { no_emp: 571, nombre: 'VAZQUEZ GAONA ISRAEL' },
];

export const useEmployeeSearch = () => {
  const [db, setDb] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(null);
  const [webEmployees, setWebEmployees] = useState([]);

  // Inicializar la base de datos
  const initializeDatabase = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (Platform.OS === 'web') {
        console.log('🌐 Inicializando datos para WEB (solo demo)...');
        const formattedEmployees = EMPLEADOS_DEMO_WEB.map(emp => ({
          ...emp,
          search_text: `${emp.no_emp} ${emp.nombre}`.toLowerCase()
        }));
        setWebEmployees(formattedEmployees);
        setDb('web-ready');
        console.log(`✅ Web inicializada con ${formattedEmployees.length} empleados demo`);
        return;
      }

      // Para nativo: usar tu base de datos SQLite existente
      console.log('📱 Conectando a base de datos SQLite...');
      
      if (!SQLite) {
        throw new Error('expo-sqlite no está disponible');
      }

      const dbName = 'employees.db';
      
      try {
        // Abrir tu base de datos existente
        const database = await SQLite.openDatabaseAsync(dbName);
        
        // Verificar que la tabla existe y tiene datos
        const tableCheck = await database.getFirstAsync(
          `SELECT name FROM sqlite_master WHERE type='table' AND name='employees'`
        );
        
        if (!tableCheck) {
          setError('La tabla employees no existe en la base de datos.');
          return;
        }

        // Verificar que tiene datos
        const countResult = await database.getFirstAsync('SELECT COUNT(*) as count FROM employees');
        const employeeCount = countResult?.count || 0;
        
        if (employeeCount === 0) {
          setError('La tabla employees está vacía.');
        } else {
          console.log(`✅ Conectado a base de datos con ${employeeCount} empleados`);
        }
        
        setDb(database);
        
      } catch (dbError) {
        console.error('❌ Error específico de SQLite:', dbError);
        setError(`Error SQLite: ${dbError.message}`);
        
        // Debug info
        console.log('📋 Debug info:');
        console.log('- Platform:', Platform.OS);
        console.log('- SQLite disponible:', !!SQLite);
      }
      
    } catch (err) {
      console.error('❌ Error inicializando:', err);
      setError(`Error de inicialización: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Buscar empleados
  const searchEmployees = useCallback(async (searchText = '', limit = 50) => {
    if (!searchText.trim()) {
      setEmployees([]);
      return [];
    }

    try {
      setIsSearching(true);
      setError(null);

      const searchTerm = searchText.toLowerCase().trim();
      let results = [];

      if (Platform.OS === 'web') {
        // Solo para demo en web
        results = webEmployees
          .filter(emp => 
            emp.no_emp.toString().includes(searchTerm) || 
            emp.nombre.toLowerCase().includes(searchTerm)
          )
          .slice(0, limit);
          
      } else {
        // Búsqueda en tu base de datos SQLite real
        if (!db) {
          throw new Error('Base de datos no conectada');
        }

        // Buscar en número de empleado y nombre
        const query = `
          SELECT no_emp, nombre 
          FROM employees 
          WHERE (
            CAST(no_emp AS TEXT) LIKE ? OR 
            LOWER(nombre) LIKE ?
          )
          ORDER BY no_emp ASC 
          LIMIT ?
        `;
        
        const searchPattern = `%${searchTerm}%`;
        results = await db.getAllAsync(query, [searchPattern, searchPattern, limit]);
      }
      
      // Formatear para el dropdown
      const formattedEmployees = results.map(employee => ({
        id: employee.no_emp,
        label: `${employee.no_emp} - ${employee.nombre}`,
        value: employee.no_emp,
        nombre: employee.nombre
      }));

      setEmployees(formattedEmployees);
      return formattedEmployees;
      
    } catch (err) {
      console.error('❌ Error en búsqueda:', err);
      setError(`Error buscando: ${err.message}`);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [db, webEmployees]);

  // Obtener empleado específico por número
  const getEmployeeByNumber = useCallback(async (no_emp) => {
    if (!no_emp) return null;

    try {
      let result = null;

      if (Platform.OS === 'web') {
        result = webEmployees.find(emp => emp.no_emp === no_emp);
      } else {
        if (!db) return null;
        const query = 'SELECT no_emp, nombre FROM employees WHERE no_emp = ?';
        result = await db.getFirstAsync(query, [no_emp]);
      }
      
      if (result) {
        return {
          id: result.no_emp,
          label: `${result.no_emp} - ${result.nombre}`,
          value: result.no_emp,
          nombre: result.nombre
        };
      }
      
      return null;
    } catch (err) {
      console.error('❌ Error obteniendo empleado:', err);
      return null;
    }
  }, [db, webEmployees]);

  // Estadísticas de la base de datos
  const getDatabaseStats = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        return { totalEmployees: webEmployees.length };
      } else {
        if (!db) return null;
        const result = await db.getFirstAsync('SELECT COUNT(*) as total FROM employees');
        return { totalEmployees: result.total };
      }
    } catch (err) {
      console.error('❌ Error obteniendo estadísticas:', err);
      return null;
    }
  }, [db, webEmployees]);

  // Cerrar conexión
  const closeDatabase = useCallback(async () => {
    if (Platform.OS !== 'web' && db && typeof db.closeAsync === 'function') {
      try {
        await db.closeAsync();
        setDb(null);
        console.log('✅ Conexión SQLite cerrada');
      } catch (err) {
        console.error('❌ Error cerrando base de datos:', err);
      }
    }
  }, [db]);

  // Inicializar al montar el hook
  useEffect(() => {
    initializeDatabase();
    
    return () => {
      if (Platform.OS !== 'web') {
        closeDatabase();
      }
    };
  }, [initializeDatabase]);

  return {
    // Estados
    isLoading,
    isSearching,
    employees,
    error,
    isReady: Platform.OS === 'web' ? !!webEmployees.length : !!db,
    
    // Funciones principales
    searchEmployees,
    getEmployeeByNumber,
    getDatabaseStats,
    
    // Control
    reinitialize: initializeDatabase,
    closeDatabase: Platform.OS === 'web' ? () => {} : closeDatabase
  };
};