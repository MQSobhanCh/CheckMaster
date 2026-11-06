import { getDatabase } from "../database/database";

class ChequeService {
  // =========================================
  // Initialize Database
  // =========================================

  async init() {
    const db = getDatabase();

    if (!db) {
      console.warn("SQLite is not available.");
      return;
    }

    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS cheques (
          id INTEGER PRIMARY KEY,
          chequeNumber TEXT,
          amount REAL DEFAULT 0,
          bank TEXT,
          issuer TEXT,
          receiver TEXT,
          issueDate TEXT,
          dueDate TEXT,
          status TEXT DEFAULT 'pending',
          paidAt TEXT,
          createdAt TEXT
        );
      `);
    } catch (error) {
      console.error("Failed to initialize cheque table:", error);
    }
  }

  // =========================================
  // Get All
  // =========================================

  async getAll() {
    const db = getDatabase();

    if (!db) {
      return [];
    }

    try {
      const result = await db.query(`
        SELECT *
        FROM cheques
        ORDER BY createdAt DESC
      `);

      return result?.values || [];
    } catch (error) {
      console.error("Failed to get cheques:", error);

      return [];
    }
  }

  // =========================================
  // Add
  // =========================================

  async add(cheque) {
    const db = getDatabase();

    if (!db) {
      return;
    }

    try {
      await db.run(
        `
        INSERT INTO cheques (
          id,
          chequeNumber,
          amount,
          bank,
          issuer,
          receiver,
          issueDate,
          dueDate,
          status,
          paidAt,
          createdAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          Number(cheque.id),
          cheque.chequeNumber || "",
          Number(cheque.amount || 0),
          cheque.bank || "",
          cheque.issuer || "",
          cheque.receiver || "",
          cheque.issueDate || "",
          cheque.dueDate || "",
          cheque.status || "pending",
          cheque.paidAt || null,
          cheque.createdAt || new Date().toISOString(),
        ],
      );
    } catch (error) {
      console.error("Failed to add cheque:", error);

      // SQLite is secondary storage — don't block the app if it fails
    }
  }

  // =========================================
  // Update
  // =========================================

  async update(id, cheque) {
    const db = getDatabase();

    if (!db) {
      return;
    }

    try {
      const current = await this.getById(id);

      if (!current) {
        console.warn(`Cheque ${id} not found.`);

        return;
      }

      const updated = {
        ...current,
        ...cheque,
      };

      await db.run(
        `
        UPDATE cheques
        SET
          chequeNumber = ?,
          amount = ?,
          bank = ?,
          issuer = ?,
          receiver = ?,
          issueDate = ?,
          dueDate = ?,
          status = ?,
          paidAt = ?,
          createdAt = ?
        WHERE id = ?
        `,
        [
          updated.chequeNumber || "",

          Number(updated.amount || 0),

          updated.bank || "",

          updated.issuer || "",

          updated.receiver || "",

          updated.issueDate || "",

          updated.dueDate || "",

          updated.status || "pending",

          updated.paidAt || null,

          updated.createdAt || new Date().toISOString(),

          Number(id),
        ],
      );
    } catch (error) {
      console.error("Failed to update cheque:", error);

      // SQLite is secondary storage — don't block the app if it fails
    }
  }

  // =========================================
  // Get One
  // =========================================

  async getById(id) {
    const db = getDatabase();

    if (!db) {
      return null;
    }

    try {
      const result = await db.query(
        `
        SELECT *
        FROM cheques
        WHERE id = ?
        LIMIT 1
        `,
        [Number(id)],
      );

      return result?.values?.[0] || null;
    } catch (error) {
      console.error("Failed to get cheque:", error);

      return null;
    }
  }

  // =========================================
  // Remove
  // =========================================

  async remove(id) {
    const db = getDatabase();

    if (!db) {
      return;
    }

    try {
      await db.run(
        `
        DELETE FROM cheques
        WHERE id = ?
        `,
        [Number(id)],
      );
    } catch (error) {
      console.error("Failed to remove cheque:", error);

      // SQLite is secondary storage — don't block the app if it fails
    }
  }
}

export default new ChequeService();
