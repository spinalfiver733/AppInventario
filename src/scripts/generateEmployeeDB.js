const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Configuración de rutas
const CSV_PATH = path.join(__dirname, '..', 'assets', 'csv', 'areas.csv');
const DB_PATH = path.join(__dirname, '..', 'assets', 'database', 'areas.db');

// Crear directorio si no existe
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log('🚀 Iniciando generación de base de datos de áreas...');

// Función para leer y procesar el CSV
function readCSV(filePath) {
  console.log('📖 Leyendo archivo CSV:', filePath);
  
  const csvContent = fs.readFileSync(filePath, 'utf8');
  const lines = csvContent.split('\n');
  
  // Remover header y líneas vacías
  const dataLines = lines.slice(1).filter(line => line.trim() !== '');
  
  const areas = [];
  
  dataLines.forEach((line, index) => {
    // Separar por coma, pero considerar que el nombre puede tener comas
    const parts = line.split(',');
    
    if (parts.length >= 2) {
      const num_area = parts[0].trim();
      // Unir todas las partes restantes en caso de que el nombre tenga comas
      const nombre_area = parts.slice(1).join(',').trim();
      
      if (num_area && nombre_area) {
        areas.push({
          num_area: parseInt(num_area),
          nombre_area: nombre_area
        });
      } else {
        console.warn(`⚠️  Línea ${index + 2} omitida: formato inválido - "${line}"`);
      }
    } else {
      console.warn(`⚠️  Línea ${index + 2} omitida: formato inválido - "${line}"`);
    }
  });
  
  console.log(`✅ CSV procesado: ${areas.length} áreas encontradas`);
  return areas;
}

// Función para crear la base de datos
function createDatabase(areas) {
  return new Promise((resolve, reject) => {
    console.log('🗄️  Creando base de datos SQLite...');
    
    // Eliminar DB existente si existe
    if (fs.existsSync(DB_PATH)) {
      fs.unlinkSync(DB_PATH);
      console.log('🗑️  Base de datos existente eliminada');
    }
    
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ Error al crear la base de datos:', err);
        reject(err);
        return;
      }
      console.log('✅ Base de datos creada exitosamente');
    });
    
    // Crear tabla de áreas
    db.serialize(() => {
      console.log('📋 Creando tabla areas...');
      
      db.run(`
        CREATE TABLE areas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          num_area INTEGER NOT NULL UNIQUE,
          nombre_area TEXT NOT NULL,
          search_text TEXT NOT NULL
        )
      `, (err) => {
        if (err) {
          console.error('❌ Error al crear tabla:', err);
          reject(err);
          return;
        }
        console.log('✅ Tabla areas creada');
      });
      
      // Preparar statement para insertar datos
      const stmt = db.prepare(`
        INSERT INTO areas (num_area, nombre_area, search_text) 
        VALUES (?, ?, ?)
      `);
      
      console.log('📊 Insertando áreas...');
      let insertedCount = 0;
      
      areas.forEach((area) => {
        // Texto de búsqueda combinado para optimizar búsquedas
        const searchText = `${area.num_area} ${area.nombre_area}`.toLowerCase();
        
        stmt.run([area.num_area, area.nombre_area, searchText], (err) => {
          if (err) {
            console.error(`❌ Error insertando área ${area.num_area}:`, err);
          } else {
            insertedCount++;
            if (insertedCount % 100 === 0) {
              console.log(`📊 Insertadas ${insertedCount}/${areas.length} áreas...`);
            }
          }
        });
      });
      
      stmt.finalize((err) => {
        if (err) {
          console.error('❌ Error finalizando inserción:', err);
          reject(err);
          return;
        }
        
        console.log(`✅ ${insertedCount} áreas insertadas exitosamente`);
        
        // Crear índices para optimizar búsquedas
        console.log('🔍 Creando índices para optimizar búsquedas...');
        
        db.run('CREATE INDEX idx_num_area ON areas(num_area)', (err) => {
          if (err) console.error('❌ Error creando índice num_area:', err);
          else console.log('✅ Índice num_area creado');
        });
        
        db.run('CREATE INDEX idx_nombre_area ON areas(nombre_area)', (err) => {
          if (err) console.error('❌ Error creando índice nombre_area:', err);
          else console.log('✅ Índice nombre_area creado');
        });
        
        db.run('CREATE INDEX idx_search_text ON areas(search_text)', (err) => {
          if (err) console.error('❌ Error creando índice search_text:', err);
          else console.log('✅ Índice search_text creado');
          
          // Cerrar base de datos
          db.close((err) => {
            if (err) {
              console.error('❌ Error cerrando base de datos:', err);
              reject(err);
            } else {
              console.log('🎉 Base de datos generada exitosamente en:', DB_PATH);
              resolve();
            }
          });
        });
      });
    });
  });
}

// Función principal
async function generateAreasDatabase() {
  try {
    // Verificar que el archivo CSV existe
    if (!fs.existsSync(CSV_PATH)) {
      throw new Error(`❌ Archivo CSV no encontrado: ${CSV_PATH}`);
    }
    
    // Leer áreas del CSV
    const areas = readCSV(CSV_PATH);
    
    if (areas.length === 0) {
      throw new Error('❌ No se encontraron áreas en el CSV');
    }
    
    // Crear base de datos
    await createDatabase(areas);
    
    console.log('');
    console.log('🎊 ¡PROCESO COMPLETADO EXITOSAMENTE!');
    console.log('📁 Base de datos ubicada en:', DB_PATH);
    console.log('🏢 Total de áreas:', areas.length);
    console.log('');
    console.log('📋 Próximos pasos:');
    console.log('1. Crear el hook useAreaSearch');
    console.log('2. Crear el componente AreaSearchableDropdown');
    console.log('3. Integrar en tu formulario');
    
  } catch (error) {
    console.error('💥 Error durante la generación:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  generateAreasDatabase();
}

module.exports = { generateAreasDatabase };