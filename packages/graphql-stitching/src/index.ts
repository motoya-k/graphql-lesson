import { createGatewaySchema } from "./schema/fromRemoteSchema";
import { schemaConfig } from "./schema/config";
import { createYoga } from "graphql-yoga";
import { createServer } from "http";

const PORT = 4101;

async function server() {
  const gatewaySchema = await createGatewaySchema(schemaConfig);
  const yoga = createYoga({ schema: gatewaySchema });
  const server = createServer(yoga);
  server.listen(PORT, () => {
    console.info(`Server is running on http://localhost:${PORT}/graphql`);
  });
}

server();
