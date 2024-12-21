// fetch.test.js
import { fsNameOfUri } from "./fsNameOfUri";

describe('fsNameOfUri', () => {
  it('should encode a simple URI without trailing slash correctly', () => {
    const uri = 'https://example.com/path';
    const expected = 'example.com/path';
    expect(fsNameOfUri(uri)).toBe(expected);
  });

  it('should encode a simple URI with trailing slash correctly', () => {
    const uri = 'https://example.com/path/';
    const expected = 'example.com/path/---root';
    expect(fsNameOfUri(uri)).toBe(expected);
  });

  it('should encode a simple URI with file extension correctly', () => {
    const uri = 'https://example.com/path.html';
    const expected = 'example.com/path.html';
    expect(fsNameOfUri(uri)).toBe(expected);
  });

  it('should encode a URI with unsorted query parameters correctly', () => {
    const uri = 'https://example.com/path?b=2&a=1';
    const expected = 'example.com/path%3Fa%3D1%26b%3D2'; // Sorted query params
    expect(fsNameOfUri(uri)).toBe(expected);
  });

  it('should handle URIs with no path correctly', () => {
    const uri = 'https://example.com';
    const expected = 'example.com/---root';
    expect(fsNameOfUri(uri)).toBe(expected);
  });

  it('should handle URIs with complex query parameters correctly', () => {
    const uri = 'https://example.com/path/?z=3&y=2&x=1';
    const expected = 'example.com/path/---root%3Fx%3D1%26y%3D2%26z%3D3'; // Sorted query params
    expect(fsNameOfUri(uri)).toBe(expected);
  });
});