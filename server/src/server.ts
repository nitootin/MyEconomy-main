import { app } from "./app.js";
import { config } from "./config.js";
import { pool } from "./database/pool.js";

async function start() {
  await pool.query("SELECT 1");

  app.listen(config.PORT, "0.0.0.0", () => {
    console.log(`API MYeconomy executando na porta ${config.PORT}.`);
  });
}

start().catch((error) => {
  console.error("Não foi possível iniciar a API.", error);
  process.exit(1);
});
