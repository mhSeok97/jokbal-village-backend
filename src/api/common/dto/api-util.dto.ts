import { ApiError } from "api/common/dto/api-error.dto";
import { ApiResult } from "api/common/dto/api-result.dto";

export function apiSuccess<T>(body?: T): ApiResult<T> {
  return new ApiResult(true, body);
}

export function apiFail(message: string, errorData?: any): ApiResult<any> {
  return new ApiResult(false, undefined, new ApiError(message, errorData));
}
