// src/utils/seeder.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User";
import Project from "../models/Project";
import BuildingType from "../models/BuildingType";
import Space from "../models/Space";
import Element from "../models/Element";
import Subscription from "../models/Subscription";
import { SUBSCRIPTION_PLANS } from "./stripe";

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(
  process.env.MONGO_URI || "mongodb://localhost:27017/construction-compliance"
);

// Sample data
const users = [
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
    isEmailVerified: true,
  },
  {
    name: "Regular User",
    email: "user@example.com",
    password: "password123",
    role: "user",
    isEmailVerified: true,
  },
];

const subscriptions = [
  {
    stripeCustomerId: "cus_example1",
    plan: SUBSCRIPTION_PLANS.FREE,
    status: "free",
  },
  {
    stripeCustomerId: "cus_example2",
    plan: SUBSCRIPTION_PLANS.BASIC,
    status: "active",
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  },
];

const projects = [
  {
    name: "Residential Complex A",
    address: "123 Main St",
    location: "Tel Aviv",
    area: "A",
    permissionDate: new Date("2019-05-15"),
    isBefore: true,
  },
  {
    name: "Office Building B",
    address: "456 Business Ave",
    location: "Jerusalem",
    area: "B",
    permissionDate: new Date("2022-10-20"),
    isBefore: false,
  },
];

const buildingTypes = [
  {
    name: "Main Residential Building",
    type: "Residential",
  },
  {
    name: "Office Tower",
    type: "Offices",
  },
];

const spaces = [
  {
    name: "Master Bedroom",
    type: "Bedroom",
  },
  {
    name: "Safe Room",
    type: "Protect Space",
  },
  {
    name: "Bathroom",
    type: "Wet Room",
  },
  {
    name: "Executive Office",
    type: "Bedroom", // Reusing bedroom type for office
  },
];

const elements = [
  {
    name: "External Wall",
    type: "Wall",
    subType: "Outside Wall",
    parameters: {
      thickness: 30,
      material: "Concrete",
      insulation: "Polyurethane",
    },
  },
  {
    name: "Ceiling",
    type: "Ceiling",
    subType: "Upper Close Room",
    parameters: {
      thickness: 20,
      material: "Concrete",
      soundInsulation: "Mineral Wool",
    },
  },
  {
    name: "Floor",
    type: "Floor",
    subType: "Upper Close Room",
    parameters: {
      thickness: 25,
      material: "Concrete",
      finish: "Tile",
    },
  },
];

// Import data
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Subscription.deleteMany();
    await Project.deleteMany();
    await BuildingType.deleteMany();
    await Space.deleteMany();
    await Element.deleteMany();

    console.log("Data cleared...");

    // Create users
    const createdUsers = await User.create(users);
    console.log("Users created...");

    // Create subscriptions
    const subscriptionPromises = subscriptions.map((sub, index) => {
      return Subscription.create({
        ...sub,
        user: createdUsers[index]._id,
      });
    });
    await Promise.all(subscriptionPromises);
    console.log("Subscriptions created...");

    // Create projects
    const projectPromises = projects.map((project, index) => {
      return Project.create({
        ...project,
        owner: createdUsers[1]._id, // Regular user owns the projects
      });
    });
    const createdProjects = await Promise.all(projectPromises);
    console.log("Projects created...");

    // Create building types
    const buildingTypePromises = buildingTypes.map((buildingType, index) => {
      return BuildingType.create({
        ...buildingType,
        project: createdProjects[index]._id,
      });
    });
    const createdBuildingTypes = await Promise.all(buildingTypePromises);
    console.log("Building types created...");

    // Create spaces
    const spacePromises = [];
    for (let i = 0; i < createdBuildingTypes.length; i++) {
      // Add 2 spaces to each building type
      const startIdx = i * 2;
      for (let j = 0; j < 2; j++) {
        if (spaces[startIdx + j]) {
          spacePromises.push(
            Space.create({
              ...spaces[startIdx + j],
              buildingType: createdBuildingTypes[i]._id,
            })
          );
        }
      }
    }
    const createdSpaces = await Promise.all(spacePromises);
    console.log("Spaces created...");

    // Create elements
    const elementPromises = [];
    for (let i = 0; i < createdSpaces.length; i++) {
      // Add an element to each space
      if (elements[i % elements.length]) {
        elementPromises.push(
          Element.create({
            ...elements[i % elements.length],
            space: createdSpaces[i]._id,
          })
        );
      }
    }
    await Promise.all(elementPromises);
    console.log("Elements created...");

    console.log("Data imported successfully!");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Subscription.deleteMany();
    await Project.deleteMany();
    await BuildingType.deleteMany();
    await Space.deleteMany();
    await Element.deleteMany();

    console.log("Data destroyed!");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// Process command line args
if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
} else {
  console.log("Please specify an option: -i (import) or -d (delete)");
  process.exit();
}
