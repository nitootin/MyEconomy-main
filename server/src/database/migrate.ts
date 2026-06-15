import { readFile } from "node:fs/promises";
import path from "node:path";
import { pool } from "./pool.js";

async function migrate() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = await readFile(schemaPath, "utf8");

  await pool.query(schema);
  console.log("Banco de dados atualizado com sucesso.");
}

migrate()
  .catch((error) => {
    console.error("Falha ao atualizar o banco de dados.", error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
