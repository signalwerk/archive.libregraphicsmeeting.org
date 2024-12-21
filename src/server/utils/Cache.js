import fs from "fs";
import path from "path";
import { fsNameOfUri } from "./fsNameOfUri.js";
import { writeFile } from "./writeFile.js";

export class Cache {
  constructor(baseDir = "./DATA/SOURCE") {
    this.baseDir = baseDir;
  }

  async set(key, { metadata, data }) {
    const filePath = path.resolve(this.baseDir, fsNameOfUri(key));
    const metaFilePath = `${filePath}.json`;

    // Write metadata
    await writeFile(metaFilePath, JSON.stringify(metadata, null, 2));

    // Write data if provided
    if (data) {
      await writeFile(filePath, data);
    }
  }

  has(key) {
    const metaFilePath = path.resolve(this.baseDir, `${fsNameOfUri(key)}.json`);
    return fs.existsSync(metaFilePath);
  }

  getMetadata(key) {
    const metaFilePath = path.resolve(this.baseDir, `${fsNameOfUri(key)}.json`);
    return JSON.parse(fs.readFileSync(metaFilePath, "utf8"));
  }

  get(key) {
    if (!this.has(key)) {
      return null;
    }

    const filePath = path.resolve(this.baseDir, fsNameOfUri(key));
    const metaFilePath = `${filePath}.json`;

    if (!fs.existsSync(metaFilePath)) {
      throw new Error(`Metadata file not found: ${metaFilePath}`);
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`Data file not found: ${filePath}`);
    }

    const metadata = JSON.parse(fs.readFileSync(metaFilePath, "utf8"));
    const data = fs.readFileSync(filePath);
    return {
      metadata,
      data,
    };
  }

  clear() {
    fs.rmSync(this.baseDir, { recursive: true, force: true });
  }
}
