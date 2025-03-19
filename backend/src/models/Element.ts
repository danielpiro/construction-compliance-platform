// src/models/Element.ts
import mongoose, { Document, Schema } from "mongoose";

interface ILayer {
  substance: string;
  name: string;
  maker: string;
  product: string;
  thickness: number;
  thermalConductivity: number;
  mass: number;
}

type OutsideCover = "tiah" | "dry hang" | "wet hang";
type BuildMethod =
  | "blocks"
  | "concrete"
  | "amir wall"
  | "baranovich"
  | "light build";
type BuildMethodIsolation =
  | "no extra cover"
  | "extra cover"
  | "inside isolation"
  | "outside isolation";

type IsolationCoverage = "dark color" | "bright color";

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
  isolationCoverage?: IsolationCoverage;
  layers: ILayer[];
  outsideCover?: OutsideCover;
  buildMethod?: BuildMethod;
  buildMethodIsolation?: BuildMethodIsolation;
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
    isolationCoverage: {
      type: String,
      enum: ["dark color", "bright color"],
      required: function (this: IElement) {
        return this.type === "Wall" && this.subType === "Outside Wall";
      },
    },
    outsideCover: {
      type: String,
      enum: ["tiah", "dry hang", "wet hang"],
      required: function (this: IElement) {
        return this.type === "Wall" && this.subType === "Outside Wall";
      },
    },
    buildMethod: {
      type: String,
      enum: ["blocks", "concrete", "amir wall", "baranovich", "light build"],
      required: function (this: IElement) {
        return (
          this.type === "Wall" &&
          this.subType === "Outside Wall" &&
          this.outsideCover
        );
      },
    },
    buildMethodIsolation: {
      type: String,
      enum: [
        "no extra cover",
        "extra cover",
        "inside isolation",
        "outside isolation",
      ],
      required: function (this: IElement) {
        return (
          this.type === "Wall" &&
          this.subType === "Outside Wall" &&
          this.buildMethod &&
          ["blocks", "concrete", "amir wall", "baranovich"].includes(
            this.buildMethod
          )
        );
      },
    },
    layers: [
      {
        name: {
          type: String,
          required: [true, "Please add layer name"],
        },
        substance: {
          type: String,
          required: [true, "Please add layer substance"],
        },
        maker: {
          type: String,
          required: [true, "Please add layer maker"],
        },
        product: {
          type: String,
          required: [true, "Please add layer product"],
        },
        thickness: {
          type: Number,
          required: [true, "Please add layer thickness in cm"],
        },
        thermalConductivity: {
          type: Number,
          required: [true, "Please add layer thermal conductivity"],
        },
        mass: {
          type: Number,
          required: [true, "Please add layer mass"],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IElement>("Element", ElementSchema);
