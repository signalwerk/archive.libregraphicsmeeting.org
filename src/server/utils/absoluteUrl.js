export function absoluteUrl(url, baseUrl) {
  try {
    let parsedUrl = new URL(url, baseUrl);
    return parsedUrl.href;
  } catch (error) {
    // console.error('Error occurred while parsing the URL:', error);
    return "";
  }
}
