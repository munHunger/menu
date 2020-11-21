import sirv from "sirv";
import polka from "polka";
import compression from "compression";
import * as sapper from "@sapper/server";

const { json } = require("body-parser");
const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";

polka() // You can also use Express
  .use(json())
  .use(
    compression({ threshold: 0 }),
    sirv("static", { dev }),
    sapper.middleware()
  )
  .listen(PORT, (err) => {
    if (err) console.log("error", err);
  });

import yaml from "js-yaml";
const rp = require("request-promise");
const $ = require("cheerio");
const url =
  "https://www.ica.se/recept/griljerad-julskinka-med-apelsinsenap-och-notcrust-724712/";

rp(url)
  .then(function (html) {
    let ingredients = [];
    let steps = [];
    $("li.ingredients__list__item", html).each((i, elem) => {
      let text = $(elem).text();
      let ing = {
        amount: text
          .split(" ")
          .filter((v) => /^(\d|\/|dl|msk|tsk|krm|g)+/g.test(v))
          .join(" "),
      };
      ing.name = text.substr(ing.amount.length).trim();
      ingredients.push(ing);
    });

    console.log($(".cooking-step", html).text());
    $(".recipe-howto-steps > * > ol > li", html).each((i, elem) => {
      steps.push($(elem).text());
    });

    let title = $("h1.recipepage__headline", html).text();
    let desc = $("p.recipe-preamble", html).text().trim();

    let recepie = {
      name: title,
      src: url,
      description: desc,
      ingredients,
      steps: steps.map((step) => ({ step })),
    };
    console.log(yaml.dump(recepie));
  })
  .catch(function (err) {
    //handle error
  });
