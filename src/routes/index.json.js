import yaml from "js-yaml";
import fs from "fs";
const path = `${__dirname}/../../../src/christmas.yaml`;
export async function get(req, res) {
  res.writeHead(200, {
    "Content-Type": "application/json",
  });
  let data = await fs.readFileSync(path, "utf8");
  data = yaml.load(data);
  res.end(JSON.stringify(data));
}

export async function post(req, res) {
  /* Initializes */
  res.setHeader("Content-Type", "application/json");
  /* Retrieves the data */
  var body = req.body;
  body = yaml.dump(body);
  fs.writeFileSync(path, body, "utf8");

  res.writeHead(200, {
    "Content-Type": "application/json",
  });
  console.log("posted data");
  console.log(body);
  let data = await fs.readFileSync(path, "utf8");
  data = yaml.load(data);
  res.end(JSON.stringify(data));
}
