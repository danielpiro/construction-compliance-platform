// src/models/BuildingType.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IBuildingType extends Document {
  name: string;
  project: mongoose.Schema.Types.ObjectId;
  type:
    | "Residential"
    | "Schools"
    | "Offices"
    | "Hotels"
    | "Commercials"
    | "Public Gathering";
}

const BuildingTypeSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a type name"],
      trim: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "Residential",
        "Schools",
        "Offices",
        "Hotels",
        "Commercials",
        "Public Gathering",
      ],
      required: [true, "Please specify the building type"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IBuildingType>(
  "BuildingType",
  BuildingTypeSchema
);
