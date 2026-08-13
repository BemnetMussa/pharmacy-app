import EmbeddedPostgres from "embedded-postgres";
import path from "node:path";

const databaseDir = path.join(process.cwd(), ".local-pg", "data");
const port = Number(process.env.PG_PORT ?? 5432);

const pg = new EmbeddedPostgres({
  databaseDir,
  user: "user",
  password: "password",
  port,
  persistent: true,
});

async function main() {
  await pg.initialise();
  await pg.start();

  try {
    await pg.createDatabase("pharmacyapp");
    console.log("Created database pharmacyapp");
  } catch {
    // already exists
  }

  console.log(`Postgres ready on postgresql://user:password@localhost:${port}/pharmacyapp`);
  console.log("Keep this process running.");

  process.on("SIGINT", async () => {
    await pg.stop();
    process.exit(0);
  });
  process.on("SIGTERM", async () => {
    await pg.stop();
    process.exit(0);
  });

  // Keep alive
  await new Promise(() => {});
}

main().catch(async (err) => {
  console.error(err);
  try {
    await pg.stop();
  } catch {
    // ignore
  }
  process.exit(1);
});
