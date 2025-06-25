const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'assets', 'database', 'areas.db');
const SQL_DUMP_PATH = path.join(__dirname, '..', 'assets', 'database', 'areas.sql');

// Conectar a la base de datos
const db = new sqlite3.Database(DB_PATH);

let dump = "";

// Obtener esquema (estructura de la base de datos)
db.serialize(() => {
  dump += "-- Dump de la base de datos 'areas'\n\n";

  db.all("SELECT sql FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      console.error("❌ Error leyendo estructura:", err);
      return;
    }

    tables.forEach(table => {
      if (table.sql) {
        dump += `${table.sql};\n\n`;
      }
    });

    // Ahora obtener datos
    db.all("SELECT * FROM areas", (err, rows) => {
      if (err) {
        console.error("❌ Error leyendo datos:", err);
        return;
      }

      rows.forEach(row => {
        const values = Object.values(row)
          .map(val => typeof val === 'string' ? `'${val.replace(/'/g, "''")}'` : val)
          .join(', ');
        dump += `INSERT INTO areas (id, num_area, nombre_area, search_text) VALUES (${values});\n`;
      });

      // Guardar a archivo .sql
      fs.writeFileSync(SQL_DUMP_PATH, dump, 'utf8');
      console.log(`✅ Dump SQL guardado en: ${SQL_DUMP_PATH}`);

      db.close();
    });
  });
});
