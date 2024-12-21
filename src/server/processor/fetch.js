import axios from "axios";

export async function fetchHttp({ job, cache, events }, next) {
  let uri = job.data.uri;
  let isCached = job.data.cache.status === "cached";
  let redirects = job.data.redirects || 0;

  if (isCached) {
    job.log(`skip fetch, file already in cache`);
    // Add parse job here for cached files
    const parseJobData = {
      ...job.data,
      _parent: job.id,
      cache: job.data.cache,
    };
    events?.emit("createParseJob", parseJobData);
    return next();
  }

  if (redirects > 8) {
    throw new Error("Too many redirects");
  }

  let response;

  job.data.fetch = {
    type: "http",
  };

  try {
    response = await axios.get(uri, {
      responseType: "arraybuffer",
      maxRedirects: 0, // Prevent automatic redirection
    });
  } catch (axiosError) {
    if (
      axiosError.response &&
      axiosError.response.status >= 300 &&
      axiosError.response.status < 400
    ) {
      // Handle redirect manually
      const newUri = axiosError.response.headers.location;
      // Save metadata to a JSON file
      const metadata = {
        headers: axiosError.response.headers,
        status: axiosError.response.status,
        // length: response.data.length,
        uri: uri,
        redirected: newUri,
      };

      if (job.data.cache.status !== "cached-has-redirect") {
        await cache.set(job.data.cache.key, { metadata });
        job.data.cache.status = "cached";
        job.log(`saved metadata to cache`);
      }
      // Create a new job for the redirected URI
      const requestJobData = {
        ...job.data,
        uri: newUri,
        redirects: redirects + 1,
        _parent: job.id,
      };
      job.log(`Created request job – Redirected to new URI: ${newUri}`);
      events?.emit("createRequestJob", requestJobData);
      return next(null, true);
    }
    // Add error logging
    job.error = axiosError.response?.status;

    throw new Error(
      `Request failed with status ${axiosError.response?.status || "unknown"}`,
    );
  }

  // Save to cache
  const metadata = {
    headers: response.headers,
    status: response.status,
    // length: response.data.length,
    uri: uri,
  };
  await cache.set(job.data.cache.key, { metadata, data: response.data });
  job.data.cache.status = "cached";
  job.log(`saved data and metadata to cache`);

  // Add parse job here only after successful fetch
  const parseJobData = {
    ...job.data,
    _parent: job.id,
    cache: job.data.cache,
  };
  events?.emit("createParseJob", parseJobData);
  next();
}

export function isCached({ job, cache, getKey }, next) {
  const key = getKey(job);

  if (cache.has(key)) {
    const metadata = cache.getMetadata(key);
    if (metadata.redirected) {
      job.log(`File already in cache, follow redirecting`);
      job.data.cache = {
        status: "cached-has-redirect",
        key,
      };
      return next();
    } else {
      job.log(`File already in cache, end cache check`);
      job.data.cache = {
        status: "cached",
        key,
      };
      return next();
    }
  } else {
    job.log(`File not in cache`);
    job.data.cache = {
      status: "not-cached",
      key,
    };
    return next();
  }
}
