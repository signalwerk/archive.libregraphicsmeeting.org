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

    if (!fs.existsSync(metaFilePath)) {
      throw new Error(`Metadata file not found: ${metaFilePath}`);
    }

    return JSON.parse(fs.readFileSync(metaFilePath, "utf8"));
  }

  getData(key) {
    const filePath = path.resolve(this.baseDir, fsNameOfUri(key));

    if (!fs.existsSync(filePath)) {
      throw new Error(`Data file not found: ${filePath}`);
    }

    return fs.readFileSync(filePath);
  }

  get(key) {
    if (!this.has(key)) {
      return null;
    }

    return {
      metadata: this.getMetadata(key),
      data: this.getData(key),
    };
  }

  clear() {
    fs.rmSync(this.baseDir, { recursive: true, force: true });
  }
}
