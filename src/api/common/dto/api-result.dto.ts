import { ApiError } from "api/common/dto/api-error.dto";

export class ApiResult<T> {
  success: boolean;
  data?: T;
  apiError?: ApiError;

  constructor(success: boolean, data?: T, apiError?: ApiError) {
    this.success = success;
    this.data = data;
    this.apiError = apiError;
  }
}
