import { createServer } from "./server.js";
import { env } from "./config/env.js";

const app = createServer();

app.listen(env.port, () => {
  console.log(`MCMS API listening on http://localhost:${env.port}`);
});
