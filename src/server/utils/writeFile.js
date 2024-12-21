import fs from "fs";
import path from "path";

export function writeFile(filePath, data) {
  //make sure the directory exists
  const dirPath = path.dirname(filePath);
  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(filePath, data);
}
