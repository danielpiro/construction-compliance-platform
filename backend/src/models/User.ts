// src/models/User.ts
import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";

export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    projectUpdates: boolean;
    systemAnnouncements: boolean;
  };
  appearance: {
    theme: string;
    language: string;
    density: string;
  };
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  companyName?: string;
  companyAddress?: string;
  phone?: string;
  isEmailVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  emailChangeToken?: string;
  newEmail?: string;
  role: "user" | "admin";
  createdAt: Date;
  active: boolean;
  settings: UserSettings;
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },
  companyName: {
    type: String,
    trim: true,
  },
  companyAddress: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailChangeToken: String,
  newEmail: String,
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  settings: {
    type: {
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: false },
        projectUpdates: { type: Boolean, default: true },
        systemAnnouncements: { type: Boolean, default: true },
      },
      appearance: {
        theme: {
          type: String,
          default: "light",
          enum: ["light", "dark", "system"],
        },
        language: { type: String, default: "he", enum: ["he", "en", "ar"] },
        density: {
          type: String,
          default: "comfortable",
          enum: ["comfortable", "compact", "standard"],
        },
      },
    },
    default: {
      notifications: {
        email: true,
        push: false,
        projectUpdates: true,
        systemAnnouncements: true,
      },
      appearance: {
        theme: "light",
        language: "he",
        density: "comfortable",
      },
    },
  },
});

// Encrypt password using bcrypt
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function (): string {
  const secret = process.env.JWT_SECRET || "secret";
  const payload = { id: this._id };
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRE ||
      "30d") as jwt.SignOptions["expiresIn"],
  };

  return jwt.sign(payload, secret, options);
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>("User", UserSchema);
