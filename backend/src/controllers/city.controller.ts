// src/controllers/city.controller.ts
import { Request, Response, NextFunction } from "express";
import { searchCities, getCityByName } from "../utils/countries";

// @desc    Search cities
// @route   GET /api/cities/search
// @access  Private
export const searchCitiesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Query parameter is required",
      });
    }

    const cities = searchCities(query as string);

    res.status(200).json({
      success: true,
      count: cities.length,
      data: cities,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Get city details
// @route   GET /api/cities/:name
// @access  Private
export const getCityController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.params;

    const city = getCityByName(name);

    if (!city) {
      return res.status(404).json({
        success: false,
        message: "City not found",
      });
    }

    res.status(200).json({
      success: true,
      data: city,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
