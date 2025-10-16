import { Client } from "@elastic/elasticsearch";

export const esClient = new Client({
  node: "http://localhost:9200", // must be https
  auth: {
    username: "elastic",
    password: "changeme", // replace if different
  },
  tls: {
    rejectUnauthorized: false, // allows self-signed certs
  },
});
