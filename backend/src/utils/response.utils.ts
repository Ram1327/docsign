import { Response } from "express";
import { ApiResponse, PaginatedResponse } from "../types";

export function sendSuccess<T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200
): Response {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  error?: string
): Response {
  const response: ApiResponse = {
    success: false,
    message,
    error: error ?? message,
  };
  return res.status(statusCode).json(response);
}

export function sendPaginated<T>(
  res: Response,
  message: string,
  data: T[],
  total: number,
  page: number,
  limit: number
): Response {
  const response: PaginatedResponse<T> = {
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
  return res.status(200).json(response);
}
