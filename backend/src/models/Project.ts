// src/models/Project.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IProject extends Document {
  name: string;
  creationDate: Date;
  address: string;
  location: string;
  area: "A" | "B" | "C" | "D";
  permissionDate: Date;
  isBefore: boolean;
  image?: string;
  owner: mongoose.Schema.Types.ObjectId;
  sharedWith: Array<{
    user: mongoose.Schema.Types.ObjectId;
    role: "editor" | "viewer";
  }>;
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
    isBefore: {
      type: Boolean,
      default: function (this: any) {
        const cutoffDate = new Date("2020-01-01");
        return this.permissionDate < cutoffDate;
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProject>("Project", ProjectSchema);
