// Single source of truth for the SQLite schema.
// Columns match exactly what chequeService reads/writes.
export const CREATE_CHEQUE_TABLE = `
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
`;
