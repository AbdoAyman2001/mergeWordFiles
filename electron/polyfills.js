// Polyfill for File class (needed for undici in Electron main process)
import { Blob } from "node:buffer";

if (typeof globalThis.File === "undefined") {
  globalThis.File = class File extends Blob {
    #name;
    #lastModified;

    constructor(fileBits, fileName, options = {}) {
      super(fileBits, options);
      this.#name = fileName;
      this.#lastModified = options.lastModified ?? Date.now();
    }

    get name() {
      return this.#name;
    }

    get lastModified() {
      return this.#lastModified;
    }
  };
}
