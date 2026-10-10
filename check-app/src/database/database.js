import { Capacitor } from "@capacitor/core";
import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";

import { CREATE_CHEQUE_TABLE } from "./schema";

const DB_NAME = "checkmaster";

let sqlite = null;
let db = null;

export async function initDatabase() {
  try {
    // روی Web فعلاً SQLite را غیرفعال می‌کنیم
    if (Capacitor.getPlatform() === "web") {
      console.warn("⚠️ SQLite is disabled on Web.");
      return null;
    }

    // The plugin instance MUST be passed in, otherwise every call below fails
    sqlite = new SQLiteConnection(CapacitorSQLite);

    // Reuse an existing connection (it survives app resume / WebView reloads);
    // creating a second one with the same name throws "connection already exists"
    const consistency = (await sqlite.checkConnectionsConsistency()).result;
    const exists = (await sqlite.isConnection(DB_NAME, false)).result;

    if (exists && consistency) {
      db = await sqlite.retrieveConnection(DB_NAME, false);
    } else {
      db = await sqlite.createConnection(
        DB_NAME,
        false,
        "no-encryption",
        1,
        false
      );
    }

    await db.open();

    // Make sure the table exists as soon as the database is open
    await db.execute(CREATE_CHEQUE_TABLE);

    console.log("✅ SQLite Connected");

    return db;
  } catch (error) {
    console.error("❌ SQLite Error:", error);
    db = null; // never keep a half-initialised connection around
    throw error;
  }
}

export function getDatabase() {
  return db;
}
