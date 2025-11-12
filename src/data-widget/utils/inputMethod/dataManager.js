import { readFileSync, writeFileSync } from "../../shared/fs";
import { jsonExample } from "./styles";
export const file = "dataManager.bin";

export class Data {
  constructor(filePath = "dataManager.bin") {
    this.file = filePath;
    this.json = this.load();
  }

  load() {
    try {
      let str = readFileSync(this.file, {});
      return str ? JSON.parse(str) : this.createDefaultData();
    } catch (error) {
      console.error(`Failed to load data: ${error.message}`);
      return this.createDefaultData();
    }
  }

  createDefaultData() {
    writeFileSync(this.file, JSON.stringify(jsonExample), {});
    return jsonExample;
  }

  save() {
    try {
      writeFileSync(this.file, JSON.stringify(this.json), {});
    } catch (error) {
      console.error(`Failed to save data: ${error.message}`);
    }
  }

  reload() {
    this.json = this.load();
  }

  reset() {
    this.json = jsonExample;
    this.save();
  }
}

export const dataManager = new Data();
