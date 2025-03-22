import { z } from "zod";
import { NextFunction, Request, Response } from "express";

export const validateCreateTransfer = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = z.object({
    fileName: z.string().min(1),
    fileSize: z.number().positive(),
    transferType: z.enum(["webrtc", "s3"]),
    senderEmail: z.string().email().optional(),
    receiverEmail: z.string().email().optional(),
  });

  try{
    schema.parse(req.body);
    next();
  }catch(error){
    res.status(400).json({
        error: `Invalid request data`,
        details: error
    });
  }
};
