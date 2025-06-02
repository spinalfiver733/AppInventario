import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

// Importaciones condicionales solo para plataformas nativas
let SQLite, Asset, FileSystem;
if (Platform.OS !== 'web') {
  SQLite = require('expo-sqlite');
  Asset = require('expo-asset').Asset;
  FileSystem = require('expo-file-system');
}

// Datos de ejemplo para web (simulando tu CSV de empleados)
const EMPLEADOS_EJEMPLO = [
  { no_emp: 859778, nombre: 'ROJAS HERNANDEZ ENRIQUE' },
  { no_emp: 19, nombre: 'VACANTE' },
  { no_emp: 186375, nombre: 'CHAVEZ ROSALES JOSE ARTURO' },
  { no_emp: 11, nombre: 'EMPLEADO DE PRUEBA' },
  { no_emp: 22, nombre: 'MARTINEZ GONZALEZ MARIA' },
  { no_emp: 33, nombre: 'LOPEZ RODRIGUEZ CARLOS' },
  { no_emp: 44, nombre: 'GARCIA SANCHEZ ANA LUCIA' },
  { no_emp: 55, nombre: 'HERNANDEZ MORALES PEDRO' },
  { no_emp: 66, nombre: 'RODRIGUEZ VAZQUEZ SOFIA' },
  { no_emp: 77, nombre: 'GONZALEZ JIMENEZ MIGUEL' },
  { no_emp: 88, nombre: 'FERNANDEZ CASTRO LAURA' },
  { no_emp: 99, nombre: 'MORALES GUTIERREZ JUAN' },
  { no_emp: 100, nombre: 'SANCHEZ TORRES DIANA' },
  { no_emp: 111, nombre: 'RAMIREZ FLORES ALBERTO' },
  { no_emp: 122, nombre: 'TORRES MENDEZ PATRICIA' },
  { no_emp: 133, nombre: 'JIMENEZ RAMOS LUIS ANTONIO' },
  { no_emp: 144, nombre: 'CASTILLO MORENO CARMEN ROSA' },
  { no_emp: 155, nombre: 'VARGAS HERRERA MIGUEL ANGEL' },
  { no_emp: 166, nombre: 'DELGADO SILVA ROSA MARIA' },
  { no_emp: 177, nombre: 'PEREIRA SANTOS FRANCISCO' },
  { no_emp: 188, nombre: 'AGUIRRE MENDOZA CLAUDIA' },
  { no_emp: 199, nombre: 'SALINAS ORTEGA EDUARDO' },
  { no_emp: 200, nombre: 'CAMPOS RIVERA ADRIANA' },
  { no_emp: 211, nombre: 'ESPINOZA CRUZ ROBERTO' },
  { no_emp: 222, nombre: 'NAVARRO TORRES BEATRIZ' },
  { no_emp: 233, nombre: 'MEDINA GUTIERREZ SERGIO' },
  { no_emp: 244, nombre: 'CORTEZ VALENCIA MONICA' },
  { no_emp: 255, nombre: 'RUIZ DOMINGUEZ ALEJANDRO' },
  { no_emp: 266, nombre: 'SILVA RAMIREZ PATRICIA' },
  { no_emp: 277, nombre: 'VEGA MORALES DANIEL' },
  { no_emp: 288, nombre: 'LEON CONTRERAS GABRIELA' },
  { no_emp: 299, nombre: 'PAREDES FLORES JESUS' },
  { no_emp: 300, nombre: 'MIRANDA LOPEZ VERONICA' },
  { no_emp: 311, nombre: 'GUERRERO SANCHEZ IVAN' },
  { no_emp: 322, nombre: 'RIOS HERNANDEZ LETICIA' },
  { no_emp: 500, nombre: 'DIRECTOR GENERAL ADMINISTRATIVO' },
  { no_emp: 501, nombre: 'SUBDIRECTOR DE RECURSOS HUMANOS' },
  { no_emp: 502, nombre: 'JEFE DE NOMINA' },
  { no_emp: 503, nombre: 'COORDINADOR DE SISTEMAS' },
  { no_emp: 504, nombre: 'ANALISTA PROGRAMADOR SENIOR' },
  { no_emp: 505, nombre: 'TECNICO EN SOPORTE' },
  { no_emp: 571, nombre: 'VAZQUEZ GAONA ISRAEL' },
];

/**
 * Hook personalizado para búsqueda de empleados
 * Compatible con web (array) y plataformas nativas (SQLite)
 */
export const useEmployeeSearch = () => {
  const [db, setDb] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(null);
  const [webEmployees, setWebEmployees] = useState([]);

  // Inicializar la base de datos o datos de ejemplo
  const initializeDatabase = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (Platform.OS === 'web') {
        console.log('🌐 Inicializando datos para WEB...');
        
        // Para web: usar array de datos de ejemplo
        const formattedEmployees = EMPLEADOS_EJEMPLO.map(emp => ({
          ...emp,
          search_text: `${emp.no_emp} ${emp.nombre}`.toLowerCase()
        }));
        
        setWebEmployees(formattedEmployees);
        setDb('web-ready'); // Marcador para indicar que está listo
        console.log(`✅ Web inicializada con ${formattedEmployees.length} empleados de ejemplo`);
        
      } else {
        console.log('📱 Inicializando base de datos SQLite para NATIVO...');
        
        const dbName = 'employees.db';
        const dbFilePath = `${FileSystem.documentDirectory}SQLite/${dbName}`;

        // Crear directorio SQLite si no existe
        const dbDirPath = `${FileSystem.documentDirectory}SQLite`;
        const dirInfo = await FileSystem.getInfoAsync(dbDirPath);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(dbDirPath, { intermediates: true });
        }

        // Verificar si la base de datos ya existe
        const dbFileInfo = await FileSystem.getInfoAsync(dbFilePath);
        
        if (!dbFileInfo.exists) {
          try {
            // Intentar cargar desde assets
            console.log('📦 Intentando cargar base de datos desde assets...');
            const dbAsset = Asset.fromModule(require('../assets/database/employees.db'));
            await dbAsset.downloadAsync();
            await FileSystem.copyAsync({
              from: dbAsset.localUri,
              to: dbFilePath,
            });
            console.log('✅ Base de datos copiada exitosamente');
          } catch (assetError) {
            console.log('⚠️ No se pudo cargar desde assets, creando base de datos con datos de ejemplo...');
            
            // Crear base de datos con datos de ejemplo
            const database = await SQLite.openDatabaseAsync(dbName);
            await database.execAsync(`
              CREATE TABLE IF NOT EXISTS employees (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                no_emp INTEGER NOT NULL UNIQUE,
                nombre TEXT NOT NULL,
                search_text TEXT NOT NULL
              );
              CREATE INDEX IF NOT EXISTS idx_no_emp ON employees(no_emp);
              CREATE INDEX IF NOT EXISTS idx_nombre ON employees(nombre);
              CREATE INDEX IF NOT EXISTS idx_search_text ON employees(search_text);
            `);
            
            // Insertar datos de ejemplo
            for (const emp of EMPLEADOS_EJEMPLO) {
              const searchText = `${emp.no_emp} ${emp.nombre}`.toLowerCase();
              await database.runAsync(
                'INSERT OR IGNORE INTO employees (no_emp, nombre, search_text) VALUES (?, ?, ?)',
                [emp.no_emp, emp.nombre, searchText]
              );
            }
            
            await database.closeAsync();
            console.log('✅ Base de datos creada con datos de ejemplo');
          }
        }

        // Abrir conexión a la base de datos
        const database = await SQLite.openDatabaseAsync(dbName);
        setDb(database);
        
        // Verificar contenido
        const result = await database.getFirstAsync('SELECT COUNT(*) as count FROM employees');
        console.log(`✅ Base de datos nativa inicializada con ${result?.count || 0} empleados`);
      }
      
    } catch (err) {
      console.error('❌ Error inicializando:', err);
      setError(`Error al inicializar: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Buscar empleados (diferente para web y nativo)
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
        // Búsqueda en array para web
        results = webEmployees
          .filter(emp => emp.search_text.includes(searchTerm))
          .slice(0, limit)
          .sort((a, b) => a.no_emp - b.no_emp);
          
      } else {
        // Búsqueda en SQLite para nativo
        if (!db) {
          console.warn('⚠️ Base de datos no inicializada');
          return [];
        }

        const query = `
          SELECT no_emp, nombre 
          FROM employees 
          WHERE search_text LIKE ? 
          ORDER BY no_emp ASC 
          LIMIT ?
        `;
        
        results = await db.getAllAsync(query, [`%${searchTerm}%`, limit]);
      }
      
      // Formatear resultados para el dropdown
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
      setError('Error al buscar empleados');
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [db, webEmployees]);

  // Obtener empleado por número
  const getEmployeeByNumber = useCallback(async (no_emp) => {
    if (!no_emp) return null;

    try {
      let result = null;

      if (Platform.OS === 'web') {
        // Buscar en array para web
        result = webEmployees.find(emp => emp.no_emp === no_emp);
      } else {
        // Buscar en SQLite para nativo
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

  // Obtener estadísticas de la base de datos
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

  // Cerrar conexión (solo para nativo)
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
    
    // Cleanup al desmontar (solo para nativo)
    return () => {
      if (Platform.OS !== 'web') {
        closeDatabase();
      }
    };
  }, [initializeDatabase, closeDatabase]);

  return {
    // Estados
    isLoading,
    isSearching,
    employees,
    error,
    isReady: Platform.OS === 'web' ? !!webEmployees.length : !!db,
    
    // Funciones
    searchEmployees,
    getEmployeeByNumber,
    getDatabaseStats,
    
    // Funciones de control
    reinitialize: initializeDatabase,
    closeDatabase: Platform.OS === 'web' ? () => {} : closeDatabase
  };
};