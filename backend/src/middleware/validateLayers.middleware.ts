import { Request, Response, NextFunction } from "express";

export const validateLayers = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // If layers are provided in the request body, ensure each layer has a valid group
  if (req.body.layers && Array.isArray(req.body.layers)) {
    req.body.layers = req.body.layers.map((layer: any, index: number) => ({
      ...layer,
      // If no group is specified, assign based on index (1, 2, or 3)
      group: layer.group || (index % 3) + 1,
    }));
  }
  next();
};
