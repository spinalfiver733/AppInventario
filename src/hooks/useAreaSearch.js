import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

// Importaciones condicionales solo para plataformas nativas
let SQLite, Asset, FileSystem;
if (Platform.OS !== 'web') {
  SQLite = require('expo-sqlite');
  Asset = require('expo-asset').Asset;
  FileSystem = require('expo-file-system');
}

// Datos de ejemplo para web (simulando tu CSV de áreas)
const AREAS_EJEMPLO = [
  { num_area: 5510000000, nombre_area: 'ALCALDIA' },
  { num_area: 5510100000, nombre_area: 'Secretaria Particular' },
  { num_area: 5510100001, nombre_area: 'J.U.D. de Control de Agenda y Logística' },
  { num_area: 5510100002, nombre_area: 'J.U.D. de Correspondencia y Archivo' },
  { num_area: 5510200000, nombre_area: 'Direccion Ejecutiva de Comunicación Social e Imagen Institucional' },
  { num_area: 5510300000, nombre_area: 'Direccion General de Administración' },
  { num_area: 5510400000, nombre_area: 'Direccion General de Gobierno' },
  { num_area: 5510500000, nombre_area: 'Direccion General de Obras y Desarrollo Urbano' },
  { num_area: 5510600000, nombre_area: 'Direccion General de Servicios Urbanos' },
  { num_area: 5510700000, nombre_area: 'Direccion General de Desarrollo Social' },
];

/**
 * Hook personalizado para búsqueda de áreas
 * Compatible con web (array) y plataformas nativas (SQLite)
 */
export const useAreaSearch = () => {
  const [db, setDb] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [areas, setAreas] = useState([]);
  const [error, setError] = useState(null);
  const [webAreas, setWebAreas] = useState([]);

  // Inicializar la base de datos o datos de ejemplo
  const initializeDatabase = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (Platform.OS === 'web') {
        console.log('🌐 Inicializando datos de áreas para WEB...');
        
        // Para web: usar array de datos de ejemplo
        const formattedAreas = AREAS_EJEMPLO.map(area => ({
          ...area,
          search_text: `${area.num_area} ${area.nombre_area}`.toLowerCase()
        }));
        
        setWebAreas(formattedAreas);
        setDb('web-ready'); // Marcador para indicar que está listo
        console.log(`✅ Web inicializada con ${formattedAreas.length} áreas de ejemplo`);
        
      } else {
        console.log('📱 Inicializando base de datos SQLite de áreas para NATIVO...');
        
        const dbName = 'areas.db';
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
            console.log('📦 Intentando cargar base de datos de áreas desde assets...');
            const dbAsset = Asset.fromModule(require('../assets/database/areas.db'));
            await dbAsset.downloadAsync();
            await FileSystem.copyAsync({
              from: dbAsset.localUri,
              to: dbFilePath,
            });
            console.log('✅ Base de datos de áreas copiada exitosamente');
          } catch (assetError) {
            console.log('⚠️ No se pudo cargar desde assets, creando base de datos con datos de ejemplo...');
            
            // Crear base de datos con datos de ejemplo
            const database = await SQLite.openDatabaseAsync(dbName);
            await database.execAsync(`
              CREATE TABLE IF NOT EXISTS areas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                num_area INTEGER NOT NULL UNIQUE,
                nombre_area TEXT NOT NULL,
                search_text TEXT NOT NULL
              );
              CREATE INDEX IF NOT EXISTS idx_num_area ON areas(num_area);
              CREATE INDEX IF NOT EXISTS idx_nombre_area ON areas(nombre_area);
              CREATE INDEX IF NOT EXISTS idx_search_text ON areas(search_text);
            `);
            
            // Insertar datos de ejemplo
            for (const area of AREAS_EJEMPLO) {
              const searchText = `${area.num_area} ${area.nombre_area}`.toLowerCase();
              await database.runAsync(
                'INSERT OR IGNORE INTO areas (num_area, nombre_area, search_text) VALUES (?, ?, ?)',
                [area.num_area, area.nombre_area, searchText]
              );
            }
            
            await database.closeAsync();
            console.log('✅ Base de datos de áreas creada con datos de ejemplo');
          }
        }

        // Abrir conexión a la base de datos
        const database = await SQLite.openDatabaseAsync(dbName);
        setDb(database);
        
        // Verificar contenido
        const result = await database.getFirstAsync('SELECT COUNT(*) as count FROM areas');
        console.log(`✅ Base de datos de áreas nativa inicializada con ${result?.count || 0} áreas`);
      }
      
    } catch (err) {
      console.error('❌ Error inicializando base de datos de áreas:', err);
      setError(`Error al inicializar áreas: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Buscar áreas (diferente para web y nativo)
  const searchAreas = useCallback(async (searchText = '', limit = 50) => {
    if (!searchText.trim()) {
      setAreas([]);
      return [];
    }

    try {
      setIsSearching(true);
      setError(null);

      const searchTerm = searchText.toLowerCase().trim();
      let results = [];

      if (Platform.OS === 'web') {
        // Búsqueda en array para web
        results = webAreas
          .filter(area => area.search_text.includes(searchTerm))
          .slice(0, limit)
          .sort((a, b) => a.num_area - b.num_area);
          
      } else {
        // Búsqueda en SQLite para nativo
        if (!db) {
          console.warn('⚠️ Base de datos de áreas no inicializada');
          return [];
        }

        const query = `
          SELECT num_area, nombre_area 
          FROM areas 
          WHERE search_text LIKE ? 
          ORDER BY num_area ASC 
          LIMIT ?
        `;
        
        results = await db.getAllAsync(query, [`%${searchTerm}%`, limit]);
      }
      
      // Formatear resultados para el dropdown
      const formattedAreas = results.map(area => ({
        id: area.num_area,
        label: `${area.num_area} - ${area.nombre_area}`,
        value: area.num_area,
        nombre_area: area.nombre_area
      }));

      setAreas(formattedAreas);
      return formattedAreas;
      
    } catch (err) {
      console.error('❌ Error en búsqueda de áreas:', err);
      setError('Error al buscar áreas');
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [db, webAreas]);

  // Obtener área por número
  const getAreaByNumber = useCallback(async (num_area) => {
    if (!num_area) return null;

    try {
      let result = null;

      if (Platform.OS === 'web') {
        // Buscar en array para web
        result = webAreas.find(area => area.num_area === num_area);
      } else {
        // Buscar en SQLite para nativo
        if (!db) return null;
        const query = 'SELECT num_area, nombre_area FROM areas WHERE num_area = ?';
        result = await db.getFirstAsync(query, [num_area]);
      }
      
      if (result) {
        return {
          id: result.num_area,
          label: `${result.num_area} - ${result.nombre_area}`,
          value: result.num_area,
          nombre_area: result.nombre_area
        };
      }
      
      return null;
    } catch (err) {
      console.error('❌ Error obteniendo área:', err);
      return null;
    }
  }, [db, webAreas]);

  // Obtener estadísticas de la base de datos
  const getDatabaseStats = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        return { totalAreas: webAreas.length };
      } else {
        if (!db) return null;
        const result = await db.getFirstAsync('SELECT COUNT(*) as total FROM areas');
        return { totalAreas: result.total };
      }
    } catch (err) {
      console.error('❌ Error obteniendo estadísticas de áreas:', err);
      return null;
    }
  }, [db, webAreas]);

  // Cerrar conexión (solo para nativo)
  const closeDatabase = useCallback(async () => {
    if (Platform.OS !== 'web' && db && typeof db.closeAsync === 'function') {
      try {
        await db.closeAsync();
        setDb(null);
        console.log('✅ Conexión SQLite de áreas cerrada');
      } catch (err) {
        console.error('❌ Error cerrando base de datos de áreas:', err);
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
    areas,
    error,
    isReady: Platform.OS === 'web' ? !!webAreas.length : !!db,
    
    // Funciones
    searchAreas,
    getAreaByNumber,
    getDatabaseStats,
    
    // Funciones de control
    reinitialize: initializeDatabase,
    closeDatabase: Platform.OS === 'web' ? () => {} : closeDatabase
  };
};