export async function addFetchJob({ job, events }, next) {
  try {
    // Add validation logic here for the URI or other request parameters
    if (!job.data.uri) {
      throw new Error("No URI provided");
    }

    // Create a fetch job with the validated data
    const fetchJobData = {
      ...job.data,
      uri: job.data.uri,
      _parent: job.id,
    };

    // Emit event to create new fetch job
    events?.emit("createFetchJob", fetchJobData);

    job.log(`Created fetch job request`);
    next();
  } catch (error) {
    throw new Error(`Error: ${error.message}`);
  }
}

export function isDomainValid({ job, allowed, disallowed }, next) {
  let domain = null;
  try {
    const parsedUrl = new URL(job.data.uri);
    domain = parsedUrl.hostname;
  } catch (error) {
    throw new Error("Error occurred while parsing the URL.");
  }

  // Check disallowed domains/patterns
  if (
    disallowed?.some((pattern) =>
      pattern instanceof RegExp ? pattern.test(domain) : pattern === domain,
    )
  ) {
    job.log(`Domain ${domain} is disallowed.`);
    return next(null, true);
  }

  // Check allowed domains/patterns
  if (
    allowed.length === 0 ||
    allowed.some((pattern) =>
      pattern instanceof RegExp ? pattern.test(domain) : pattern === domain,
    )
  ) {
    job.log(`Domain ${domain} is allowed.`);
    return next();
  }

  job.log(`Domain ${domain} is not allowed.`);
  next(null, true);
}

export function isAlreadyRequested({ job, requestTracker, getKey }, next) {
  const url = job.data.uri;
  const key = getKey(job);

  if (requestTracker.hasBeenRequested(key)) {
    job.log(`URL ${url} has already been requested.`);
    return next(null, true);
  }

  requestTracker.markAsRequested(key);
  // job.log(`URL ${url} marked as requested.`);
  next();
}
