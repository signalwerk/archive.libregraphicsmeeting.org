import { absoluteUrl } from "./absoluteUrl";

describe("absoluteUrl", () => {
  const baseUrl = "https://example.com";

  it("should combine relative path with base URL", () => {
    expect(absoluteUrl("/path", baseUrl)).toBe("https://example.com/path");
  });

  it("should handle absolute URLs correctly", () => {
    const fullUrl = "https://other-domain.com/test";
    expect(absoluteUrl(fullUrl, baseUrl)).toBe(fullUrl);
  });

  it("should handle query parameters", () => {
    expect(absoluteUrl("/path?key=value", baseUrl)).toBe(
      "https://example.com/path?key=value",
    );
  });

  it("should handle hash fragments", () => {
    expect(absoluteUrl("/path#section", baseUrl)).toBe(
      "https://example.com/path#section",
    );
  });

  it("should handle pure hash fragments", () => {
    expect(absoluteUrl("#section", baseUrl)).toBe(
      "https://example.com/#section",
    );
  });

  it("should handle pure hash fragments", () => {
    const fullUrl = "https://other-domain.com/test";
    expect(absoluteUrl("#section", fullUrl)).toBe(`${fullUrl}#section`);
  });

  // it('should return empty string for invalid URLs', () => {
  //   expect(absoluteUrl('!!!invalid:\\\\url', baseUrl)).toBe('');
  // });

  it("should return also other protocols", () => {
    const fullUrl = "ftp://example.com/";
    expect(absoluteUrl(fullUrl, baseUrl)).toBe(fullUrl);
  });

  it("should handle missing base URL", () => {
    expect(absoluteUrl("https://complete-url.com/path", undefined)).toBe(
      "https://complete-url.com/path",
    );
  });
});
