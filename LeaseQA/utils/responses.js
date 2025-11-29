export const sendData = (res, data, status = 200) => {
    res.status(status).json({data});
};

export const sendError = (
    res,
    {code = "INTERNAL_ERROR", message = "Unexpected error", details = null, status = 500}
) => {
    const payload = {error: {code, message}};
    if (details) {
        payload.error.details = details;
    }
    res.status(status).json(payload);
};

export const sendNotFound = (res, message = "Resource not found") =>
    sendError(res, {code: "NOT_FOUND", message, status: 404});

export const sendUnauthorized = (res, message = "Authentication required") =>
    sendError(res, {code: "UNAUTHORIZED", message, status: 401});

export const sendForbidden = (res, message = "Forbidden") =>
    sendError(res, {code: "FORBIDDEN", message, status: 403});
