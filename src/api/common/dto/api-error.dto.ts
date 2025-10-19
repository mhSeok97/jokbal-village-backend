export class ApiError {
  message: string;
  errorData?: any;

  constructor(message: string, errorData?: any) {
    this.message = message;
    this.errorData = errorData;
  }
}
