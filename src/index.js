import { WebServer } from "../packages/scrape-helpers/src/server/server.js";
import { getRelativeURL } from "../packages/scrape-helpers/src/server/utils/getRelativeURL.js";
import { DataPatcher } from "../packages/scrape-helpers/src/server/utils/DataPatcher.js";
import { removeCommentsIf } from "../packages/scrape-helpers/src/server/processor/cheerio-helper.js";

import {
  isDomainValid,
  isPathValid,
  isAlreadyRequested,
} from "../packages/scrape-helpers/src/server/processor/request.js";
import {
  addParseJob,
  guessMimeType,
  parseFiles,
} from "../packages/scrape-helpers/src/server/processor/parse.js";
import { addFetchJob } from "../packages/scrape-helpers/src/server/processor/fetch.js";
import {
  isCached,
  fetchHttp,
} from "../packages/scrape-helpers/src/server/processor/fetch.js";
import {
  handleRedirected,
  writeOutput,
  isAlreadyWritten,
} from "../packages/scrape-helpers/src/server/processor/write.js";

const dataPatcher = new DataPatcher();

// Configure data patcher rules
// change content that is different for each request

dataPatcher
  .addRule({
    includes: [
      //
      "https://www.libregraphicsmeeting.org/2009/skin/project.css",
      "https://libregraphicsmeeting.org/2009/skin/project.css",
    ],
    search:
      ".projectabstract { float:left; width:150px; border:1px solid black; width:148px; -moz-border-radius:5px; -webkit-border-radius: 5px; */}",
    replace:
      ".projectabstract { float:left; width:150px; border:1px solid black; width:148px; -moz-border-radius:5px; -webkit-border-radius: 5px; }",
  })
  .addRule({
    includes: [
      //
      "https://www.libregraphicsmeeting.org/2012/wp/wp-content/plugins/gravityforms/css/forms-ver=1.5.1.1.css",
      "https://libregraphicsmeeting.org/2012/wp/wp-content/plugins/gravityforms/css/forms-ver=1.5.1.1.css",
      "https://www.libregraphicsmeeting.org/2013/wp/wp-content/plugins/gravityforms/css/forms-ver=1.5.1.1.css",
      "https://libregraphicsmeeting.org/2013/wp/wp-content/plugins/gravityforms/css/forms-ver=1.5.1.1.css",
      "https://www.libregraphicsmeeting.org/2014/wp/wp-content/plugins/gravityforms/css/forms-ver=1.5.1.1.css",
      "https://libregraphicsmeeting.org/2014/wp/wp-content/plugins/gravityforms/css/forms-ver=1.5.1.1.css",
    ],
    search: ".entry ul li:after {content:none; #}",
    replace: ".entry ul li:after {content:none; }",
  })
  .addRule({
    includes: [
      //
      "https://www.libregraphicsmeeting.org/2014/wp/wp-content/plugins/background-manager/resources/css/pub-ver=1.2.5.2.css",
      "https://libregraphicsmeeting.org/2014/wp/wp-content/plugins/background-manager/resources/css/pub-ver=1.2.5.2.css",
    ],
    search: "W -webkit-box-shadow:2px 2px 4px rgba(0,0,0,0.25);",
    replace: "-webkit-box-shadow:2px 2px 4px rgba(0,0,0,0.25);",
  })
  .addRule({
    includes: [
      //
      "https://www.libregraphicsmeeting.org/2007/global.css",
    ],
    search: "color}",
    replace: "}",
  });

// Create server instance
const server = new WebServer({
  urls: ["https://libregraphicsmeeting.org/"],
  dataPatcher,
});

// Configure queue processors
server.configureQueues({
  request: [
    isDomainValid({
      allowed: [/^([a-z0-9-]+\.)*libregraphicsmeeting\.org$/i],
    }),
    // isPathValid({
    //   disallowed: [
    //     /.*(Diskussion|action=|Spezial|Benutzer.*oldid|Hauptseite.*oldid|title=.*oldid|printable=yes).*/i,
    //   ],
    // }),
    isAlreadyRequested(),
    addFetchJob(),
  ],
  fetch: [isCached(), fetchHttp(), addParseJob()],
  parse: [guessMimeType(), parseFiles()],
  write: [
    isAlreadyWritten(),
    handleRedirected(),
    guessMimeType(),
    writeOutput({
      getUrl: ({ absoluteUrl, baseUrl }) =>
        getRelativeURL(absoluteUrl, baseUrl, true, false, true),
      rewrite: {
        ["text/html"]: ($) => {
          // This function removes old IE conditional comments from the HTML.
          // removeCommentsIf($, {
          //   includes: ["[if", "endif]"],
          // });
        },
      },
    }),
  ],
});

// Start the server
server.start(3000);
