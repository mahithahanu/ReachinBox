import { Client } from "@elastic/elasticsearch";

export const esClient = new Client({
  node: "http://localhost:9200", // your local ES
  auth: {
    username: "elastic",          // default user for local ES (or your custom)
    password: "changeme",         // default password (or your custom)
  },
  // Compatible-with ensures media_type_header_exception is avoided
  // headers: {
  //   "Accept": "application/vnd.elasticsearch+json; compatible-with=8",
  //   "Content-Type": "application/vnd.elasticsearch+json; compatible-with=8"
  // }
});
