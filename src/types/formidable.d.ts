// src/types/formidable.d.ts
declare module "formidable" {
  import { IncomingMessage } from "http";

  export interface File {
    filepath: string;
    originalFilename: string;
    mimetype: string;
    size: number;
  }

  export interface Files {
    [fieldname: string]: File | File[];
  }

  export interface Fields {
    [fieldname: string]: string | string[];
  }

  export interface Options {
    multiples?: boolean;
  }

  export class IncomingForm {
    constructor(options?: Options);
    parse(
      req: IncomingMessage,
      callback: (err: any, fields: Fields, files: Files) => void
    ): void;
  }

  export default IncomingForm;
}
