// src/types/global.d.ts
import * as multerType from "multer";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      }
    }
  }
}

declare module "multer" {
  interface MulterError extends Error {
    code: string;
    field?: string;
  }
}
