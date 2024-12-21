import { URL } from "url";

export function fsNameOfUri(uri) {
  const parsedUrl = new URL(uri);
  let queryParams = new URLSearchParams(parsedUrl.search);
  // Convert to array, sort, and reconstruct
  let sortedQuery = new URLSearchParams(
    [...queryParams.entries()].sort((a, b) => a[0].localeCompare(b[0])),
  ).toString();

  let path = [
    parsedUrl.protocol.replace(":", ""),
    `${parsedUrl.host}/`,
    parsedUrl.pathname,
  ]
    .filter(Boolean)
    .join("/")
    // replace multiple slashes with a single slash
    .replace(/\/+/g, "/");

  // Append '---root' if the original URI ends with a slash
  if (path.endsWith("/")) {
    path += "---root";
  }

  const fileName = `${path}${
    sortedQuery ? encodeURIComponent(`?${sortedQuery}`) : ""
  }`;
  return fileName;
}
