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
    console.error('❌ Error cargando dependencias SQLite para áreas:', error);
  }
}

// Solo para demo en web (pocas áreas)
const AREAS_DEMO_WEB = [
  { num_area: 5510000000, nombre_area: 'ALCALDIA' },
  { num_area: 5510100000, nombre_area: 'Secretaria Particular' },
  { num_area: 5510200000, nombre_area: 'Direccion Ejecutiva de Comunicación Social e Imagen Institucional' },
  { num_area: 5510300000, nombre_area: 'Direccion General de Administración' },
  { num_area: 5510400000, nombre_area: 'Direccion General de Gobierno' },
  { num_area: 5510500000, nombre_area: 'Direccion General de Obras y Desarrollo Urbano' },
];

export const useAreaSearch = () => {
  const [db, setDb] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [areas, setAreas] = useState([]);
  const [error, setError] = useState(null);
  const [webAreas, setWebAreas] = useState([]);

  // Inicializar la base de datos
  const initializeDatabase = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (Platform.OS === 'web') {
        console.log('🌐 Inicializando datos de áreas para WEB (solo demo)...');
        const formattedAreas = AREAS_DEMO_WEB.map(area => ({
          ...area,
          search_text: `${area.num_area} ${area.nombre_area}`.toLowerCase()
        }));
        setWebAreas(formattedAreas);
        setDb('web-ready');
        console.log(`✅ Web inicializada con ${formattedAreas.length} áreas demo`);
        return;
      }

      // Para nativo: usar tu base de datos SQLite existente
      console.log('📱 Conectando a base de datos de áreas SQLite...');
      
      if (!SQLite) {
        throw new Error('expo-sqlite no está disponible');
      }

      const dbName = 'areas.db';
      
      try {
        // Abrir tu base de datos existente
        const database = await SQLite.openDatabaseAsync(dbName);
        
        // Verificar que la tabla existe y tiene datos
        const tableCheck = await database.getFirstAsync(
          `SELECT name FROM sqlite_master WHERE type='table' AND name='areas'`
        );
        
        if (!tableCheck) {
          setError('La tabla areas no existe en la base de datos.');
          return;
        }

        // Verificar que tiene datos
        const countResult = await database.getFirstAsync('SELECT COUNT(*) as count FROM areas');
        const areaCount = countResult?.count || 0;
        
        if (areaCount === 0) {
          setError('La tabla areas está vacía.');
        } else {
          console.log(`✅ Conectado a base de datos con ${areaCount} áreas`);
        }
        
        setDb(database);
        
      } catch (dbError) {
        console.error('❌ Error específico de SQLite para áreas:', dbError);
        setError(`Error SQLite áreas: ${dbError.message}`);
        
        // Debug info
        console.log('📋 Debug info áreas:');
        console.log('- Platform:', Platform.OS);
        console.log('- SQLite disponible:', !!SQLite);
      }
      
    } catch (err) {
      console.error('❌ Error inicializando áreas:', err);
      setError(`Error de inicialización áreas: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Buscar áreas
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
        // Solo para demo en web
        results = webAreas
          .filter(area => 
            area.num_area.toString().includes(searchTerm) || 
            area.nombre_area.toLowerCase().includes(searchTerm)
          )
          .slice(0, limit);
          
      } else {
        // Búsqueda en tu base de datos SQLite real
        if (!db) {
          throw new Error('Base de datos de áreas no conectada');
        }

        // Buscar en número de área y nombre
        const query = `
          SELECT num_area, nombre_area 
          FROM areas 
          WHERE (
            CAST(num_area AS TEXT) LIKE ? OR 
            LOWER(nombre_area) LIKE ?
          )
          ORDER BY num_area ASC 
          LIMIT ?
        `;
        
        const searchPattern = `%${searchTerm}%`;
        results = await db.getAllAsync(query, [searchPattern, searchPattern, limit]);
      }
      
      // Formatear para el dropdown
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
      setError(`Error buscando áreas: ${err.message}`);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [db, webAreas]);

  // Obtener área específica por número
  const getAreaByNumber = useCallback(async (num_area) => {
    if (!num_area) return null;

    try {
      let result = null;

      if (Platform.OS === 'web') {
        result = webAreas.find(area => area.num_area === num_area);
      } else {
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

  // Estadísticas de la base de datos
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

  // Cerrar conexión
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
    areas,
    error,
    isReady: Platform.OS === 'web' ? !!webAreas.length : !!db,
    
    // Funciones principales
    searchAreas,
    getAreaByNumber,
    getDatabaseStats,
    
    // Control
    reinitialize: initializeDatabase,
    closeDatabase: Platform.OS === 'web' ? () => {} : closeDatabase
  };
};