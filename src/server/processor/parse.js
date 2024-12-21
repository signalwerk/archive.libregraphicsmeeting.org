import * as cheerio from "cheerio";
import { absoluteUrl } from "../utils/absoluteUrl.js";

export async function parseHtml({ job, events, data, metadata }, next) {
  const $ = cheerio.load(data);

  let baseUrl =
    absoluteUrl($("base")?.attr("href"), job.data.uri) || job.data.uri;

  function processElements(configurations) {
    configurations.forEach(({ selector, attribute }) => {
      $(selector).each((index, element) => {
        let originalValue = $(element).attr(attribute);

        if (!originalValue) return;

        // Split attribute value if it contains multiple URLs (like srcset)
        const urls = originalValue.includes(",")
          ? originalValue.split(",").map((part) => part.trim().split(/\s+/)[0])
          : [originalValue];

        urls.forEach((url) => {
          const fullUrl = absoluteUrl(url, baseUrl);
          if (!fullUrl) return;

          const requestJobData = {
            ...job.data,
            uri: fullUrl,
            _parent: job.id,
          };

          job.log(
            `Created request for resource: ${fullUrl} ${JSON.stringify({
              originalValue,
              urls,
            })}`,
          );
          events?.emit("createRequestJob", requestJobData);
        });
      });
    });
  }

  // Process all elements with a single call
  processElements([
    // Navigation and links
    { selector: "a", attribute: "href" },
    { selector: "area", attribute: "href" },

    // Media elements
    { selector: "img", attribute: "src" },
    { selector: "img", attribute: "srcset" },
    { selector: "source", attribute: "src" },
    { selector: "source", attribute: "srcset" },
    { selector: "video", attribute: "src" },
    { selector: "video", attribute: "poster" },
    { selector: "audio", attribute: "src" },
    { selector: "track", attribute: "src" },

    // Resource links
    { selector: "script", attribute: "src" },
    { selector: "link[rel=stylesheet]", attribute: "href" },

    // Link relations
    { selector: "link[rel=icon]", attribute: "href" },
    { selector: "link[rel='shortcut icon']", attribute: "href" },
    { selector: "link[rel=apple-touch-icon]", attribute: "href" },
    { selector: "link[rel=alternate]", attribute: "href" },
    { selector: "link[rel=amphtml]", attribute: "href" }, // Accelerated Mobile Pages
    { selector: "link[rel=canonical]", attribute: "href" },
    { selector: "link[rel=manifest]", attribute: "href" },
    { selector: "link[rel=search]", attribute: "href" },
    { selector: "link[rel=pingback]", attribute: "href" },

    // Resource hints
    { selector: "link[rel=preload]", attribute: "href" },
    { selector: "link[rel=preload]", attribute: "imagesrcset" },

    { selector: "link[rel=prefetch]", attribute: "href" },
    { selector: "link[rel=preconnect]", attribute: "href" },
    { selector: "link[rel=dns-prefetch]", attribute: "href" },

    // Embedded content
    { selector: "iframe", attribute: "src" },
    { selector: "embed", attribute: "src" },
    { selector: "object", attribute: "data" },

    // Forms
    { selector: "form", attribute: "action" },

    // Meta tags
    { selector: "meta[http-equiv=refresh]", attribute: "content" },
    { selector: "meta[property='og:image']", attribute: "content" },
    { selector: "meta[property='og:url']", attribute: "content" },
    { selector: "meta[property='og:audio']", attribute: "content" },
    { selector: "meta[property='og:video']", attribute: "content" },
    { selector: "meta[name='twitter:image']", attribute: "content" },
    { selector: "meta[name='msapplication-TileImage']", attribute: "content" },
    { selector: "meta[name='thumbnail']", attribute: "content" },
    { selector: "meta[itemprop='image']", attribute: "content" },
  ]);

  job.log(`parseHtml done`);
  next();
}
