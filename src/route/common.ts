export const enum ErrorCode {
    ServerError,
    InvalidUser,
    UserNotFound
}
export interface ErrorInfo {
    status: number,
    code: string,
    errorDescription?: string
}

export function errorMapper(err: WebError): ErrorInfo {
    switch(err.code) {
        case ErrorCode.InvalidUser:
            return {
                status: 401,
                code: ErrorCode.InvalidUser.toString(),
                errorDescription: err.message
            }
        case ErrorCode.UserNotFound:
            return {
                status: 404,
                code: ErrorCode.UserNotFound.toString(),
                errorDescription: err.message
            }
        case ErrorCode.ServerError:
        default:
            return {
                status: 500,
                code: ErrorCode.ServerError.toString(),
                errorDescription: err.message
            }
    }
}
export class WebError extends Error {
    constructor(public code: ErrorCode, description: string) {
        super(description);
    }
}