import { Client } from "@elastic/elasticsearch";

export const esClient = new Client({
  node: "http://localhost:9200",
  auth: {
    username: "elastic",
    password: "njGWK1_o5kT2cBCtyyR=",
  },
});
