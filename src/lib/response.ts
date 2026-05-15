import { NextResponse } from "next/server";
import { ZodError } from "zod";

interface SuccessResponseBody<T> {
  status: "success";
  message: string;
  data: T;
}

interface ErrorResponseBody {
  status: "error";
  message: string;
}

interface ValidationErrorResponseBody extends ErrorResponseBody {
  errors: Record<string, string[]>;
}

export function successResponse<T>(
  data: T,
  message: string,
  status: number = 200
): NextResponse<SuccessResponseBody<T>> {
  return NextResponse.json({ status: "success", message, data }, { status });
}

export function createdResponse<T>(
  data: T,
  message: string
): NextResponse<SuccessResponseBody<T>> {
  return successResponse(data, message, 201);
}

export function errorResponse(
  message: string,
  status: number = 500
): NextResponse<ErrorResponseBody> {
  return NextResponse.json({ status: "error", message }, { status });
}

export function unauthorizedResponse(
  message: string = "Unauthorized"
): NextResponse<ErrorResponseBody> {
  return errorResponse(message, 401);
}

export function forbiddenResponse(
  message: string = "Forbidden"
): NextResponse<ErrorResponseBody> {
  return errorResponse(message, 403);
}

export function notFoundResponse(
  message: string = "Resource not found"
): NextResponse<ErrorResponseBody> {
  return errorResponse(message, 404);
}

export function conflictResponse(
  message: string
): NextResponse<ErrorResponseBody> {
  return errorResponse(message, 409);
}

export function tooManyRequestsResponse(
  message: string = "Too many requests. Please try again later."
): NextResponse<ErrorResponseBody> {
  return errorResponse(message, 429);
}

export function validationErrorResponse(
  errors: Record<string, string[]>,
  message: string = "Data yang dikirim tidak valid."
): NextResponse<ValidationErrorResponseBody> {
  return NextResponse.json(
    { status: "error", message, errors },
    { status: 422 }
  );
}

export function formatZodError(error: ZodError): Record<string, string[]> {
  return error.issues.reduce((acc: Record<string, string[]>, issue) => {
    const key = issue.path.join(".") || "root";
    if (!acc[key]) acc[key] = [];
    acc[key].push(issue.message);
    return acc;
  }, {});
}

export function zodErrorResponse(
  error: ZodError
): NextResponse<ValidationErrorResponseBody> {
  return validationErrorResponse(formatZodError(error));
}
