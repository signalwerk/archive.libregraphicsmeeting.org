import * as cheerio from "cheerio";
import { absoluteUrl } from "../utils/absoluteUrl.js";
import postcss from "postcss";

export async function guessMimeType({ job, cache }, next) {
  const metadata = cache.getMetadata(job.data.cache.key);

  let mimeType = metadata.headers["content-type"];

  if (!mimeType) {
    job.log("No mime type found in metadata, guessing...");
    const data = cache.getData(job.data.cache.key);
    // read first 100 bytes
    const first100Bytes = data.slice(0, 100);

    // check if the header looks like a html file
    if (first100Bytes.includes("<html")) {
      job.log("Guessing mime type as text/html");
      mimeType = "text/html";
    }
  }

  job.data.mimeType = mimeType.split(";")?.[0];

  next();
}

export async function addParseJob({ job, events }, next) {
  try {
    // Add validation logic here for the URI or other request parameters
    if (!job.data.uri) {
      throw new Error("No URI provided");
    }

    if (job.error) {
      throw new Error(`Job has error: ${job.error} no need to parse`);
    }

    // Create a parse job with the validated data
    const parseJobData = {
      ...job.data,
      _parent: job.id,
    };

    // Emit event to create new parse job
    events?.emit("createParseJob", parseJobData);

    job.log(`Created parse job request`);
    next();
  } catch (error) {
    throw new Error(`Error: ${error.message}`);
  }
}
export async function parseCss({ job, events, data }, next) {
  job.log(`parseCss start`);

  const { plugin, resources } = await findResources();

  try {
    // Process the CSS content using PostCSS
    await postcss([plugin])
      .process(data, { from: undefined })
      .then(() => {
        // Process @import rules
        resources.imports.forEach((originalUrl) => {
          const fullUrl = absoluteUrl(originalUrl, job.data.uri);
          if (!fullUrl) return;

          const requestJobData = {
            ...job.data,
            uri: fullUrl,
            _parent: job.id,
          };

          job.log(`Created request for CSS import: ${fullUrl}`);
          events?.emit("createRequestJob", requestJobData);
        });

        // Process background images
        resources.backgroundImages.forEach((originalUrl) => {
          const fullUrl = absoluteUrl(originalUrl, job.data.uri);
          if (!fullUrl) return;

          const requestJobData = {
            ...job.data,
            uri: fullUrl,
            _parent: job.id,
          };

          job.log(`Created request for background image: ${fullUrl}`);
          events?.emit("createRequestJob", requestJobData);
        });

        // Process fonts
        resources.fonts.forEach((originalUrl) => {
          const fullUrl = absoluteUrl(originalUrl, job.data.uri);
          if (!fullUrl) return;

          const requestJobData = {
            ...job.data,
            uri: fullUrl,
            _parent: job.id,
          };

          job.log(`Created request for font: ${fullUrl}`);
          events?.emit("createRequestJob", requestJobData);
        });
      });

    job.log(`parseCss done`);
    next();
  } catch (error) {
    job.log(`Error processing CSS: ${error.message}`);
    throw error;
  }
}

// Helper function to find CSS resources
function findResources() {
  return new Promise((resolve) => {
    const resources = {
      imports: [],
      backgroundImages: [],
      fonts: [],
    };

    const urlRegex = /url\(['"]?([^'"()]+)['"]?\)/g;

    const plugin = () => {
      return {
        postcssPlugin: "postcss-find-resources",
        Once(root) {
          // Process @import rules
          root.walkAtRules("import", (rule) => {
            resources.imports.push(rule.params.replace(/['";]/g, ""));
          });

          // Process @font-face rules
          root.walkAtRules("font-face", (rule) => {
            rule.walkDecls("src", (decl) => {
              let match;
              while ((match = urlRegex.exec(decl.value)) !== null) {
                resources.fonts.push(match[1]);
              }
            });
          });

          // Process other URL-containing declarations
          root.walkDecls((decl) => {
            const propsWithUrls = [
              "background",
              "background-image",
              "cursor",
              "list-style",
              "list-style-image",
              "mask",
              "mask-image",
            ];

            if (propsWithUrls.includes(decl.prop)) {
              let match;
              while ((match = urlRegex.exec(decl.value)) !== null) {
                resources.backgroundImages.push(match[1]);
              }
            }
          });
        },
      };
    };
    plugin.postcss = true;

    resolve({ plugin, resources });
  });
}

export async function parseHtml({ job, events, data }, next) {
  job.log(`parseHtml start`);
  const $ = cheerio.load(data);

  let baseUrl =
    absoluteUrl($("base")?.attr("href") || "", job.data.uri) || job.data.uri;

  function processElements(configurations) {
    configurations.forEach(({ selector, attribute, splitOnComma = false }) => {
      $(selector).each((index, element) => {
        let originalValue = $(element).attr(attribute);

        if (!originalValue) return;

        // Use splitOnComma flag from configuration
        const urls = splitOnComma
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

          job.log(`Created request for resource: ${fullUrl}`);
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
    { selector: "img", attribute: "srcset", splitOnComma: true },
    { selector: "source", attribute: "src" },
    { selector: "source", attribute: "srcset", splitOnComma: true },
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
    // { selector: "form", attribute: "action" },

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
