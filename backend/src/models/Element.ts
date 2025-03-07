// src/models/Element.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IElement extends Document {
  name: string;
  space: mongoose.Schema.Types.ObjectId;
  type: "Wall" | "Ceiling" | "Floor" | "Thermal Bridge";
  subType?:
    | "Outside Wall"
    | "Isolation Wall"
    | "Upper Open Space"
    | "Upper Close Room"
    | "Upper Roof"
    | "Under Roof";
  parameters: Record<string, any>; // Store element-specific parameters as JSON
}

const ElementSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please add an element name"],
      trim: true,
    },
    space: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Space",
      required: true,
    },
    type: {
      type: String,
      enum: ["Wall", "Ceiling", "Floor", "Thermal Bridge"],
      required: [true, "Please specify the element type"],
    },
    subType: {
      type: String,
      enum: [
        "Outside Wall",
        "Isolation Wall",
        "Upper Open Space",
        "Upper Close Room",
        "Upper Roof",
        "Under Roof",
      ],
      validate: {
        validator: function (this: IElement, v: string) {
          // Wall subtypes
          if (
            this.type === "Wall" &&
            !["Outside Wall", "Isolation Wall"].includes(v)
          ) {
            return false;
          }
          // Floor subtypes
          if (
            this.type === "Floor" &&
            !["Upper Open Space", "Upper Close Room"].includes(v)
          ) {
            return false;
          }
          // Ceiling subtypes
          if (
            this.type === "Ceiling" &&
            ![
              "Upper Open Space",
              "Upper Close Room",
              "Upper Roof",
              "Under Roof",
            ].includes(v)
          ) {
            return false;
          }
          // Thermal Bridge has no subtypes
          if (this.type === "Thermal Bridge" && v) {
            return false;
          }
          return true;
        },
        message: "SubType does not match Element Type",
      },
    },
    parameters: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IElement>("Element", ElementSchema);
