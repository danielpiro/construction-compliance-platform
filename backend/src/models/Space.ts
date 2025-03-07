// src/models/Space.ts
import mongoose, { Document, Schema } from "mongoose";

export interface ISpace extends Document {
  name: string;
  buildingType: mongoose.Schema.Types.ObjectId;
  type: "Bedroom" | "Protect Space" | "Wet Room" | "Balcony";
}

const SpaceSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a space name"],
      trim: true,
    },
    buildingType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BuildingType",
      required: true,
    },
    type: {
      type: String,
      enum: ["Bedroom", "Protect Space", "Wet Room", "Balcony"],
      required: [true, "Please specify the space type"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISpace>("Space", SpaceSchema);
