// src/models/Project.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IProject extends Document {
  name: string;
  creationDate: Date;
  address: string;
  location: string;
  area: "A" | "B" | "C" | "D";
  permissionDate: Date;
  buildingVersion: "version2011" | "version2019" | "fixSheet1" | "fixSheet2";
  image?: string;
  owner: mongoose.Schema.Types.ObjectId;
  sharedWith: Array<{
    user: mongoose.Schema.Types.ObjectId;
    role: "editor" | "viewer";
  }>;
  spaces: mongoose.Schema.Types.ObjectId[];
}

const ProjectSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a project name"],
      trim: true,
    },
    creationDate: {
      type: Date,
      required: [true, "Please add a creation date"],
      default: Date.now,
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Please add a location"],
      trim: true,
    },
    area: {
      type: String,
      enum: ["A", "B", "C", "D"],
      required: [true, "Area is required"],
    },
    permissionDate: {
      type: Date,
      required: [true, "Please add a permission date"],
    },
    buildingVersion: {
      type: String,
      enum: ["version2011", "version2019", "fixSheet1", "fixSheet2"],
      required: [true, "Building version is required"],
      default: function (this: any) {
        const date = this.permissionDate;
        const date2020 = new Date("2020-01-01");
        const date2021June = new Date("2021-06-01");
        const date2022Dec = new Date("2022-12-01");

        if (date < date2020) {
          return "version2011";
        } else if (date >= date2020 && date < date2021June) {
          return "version2019";
        } else if (date >= date2021June && date < date2022Dec) {
          return "fixSheet1";
        } else {
          return "fixSheet2";
        }
      },
    },
    image: {
      type: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sharedWith: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["editor", "viewer"],
          default: "viewer",
        },
      },
    ],
    spaces: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Space",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProject>("Project", ProjectSchema);
