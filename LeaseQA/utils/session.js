import {sendForbidden, sendUnauthorized} from "./responses.js";

export const requireUser = (req, res) => {
    const currentUser = req.session.currentUser;
    if (!currentUser) {
        sendUnauthorized(res);
        return null;
    }
    return currentUser;
};

export const requireRole = (req, res, allowedRoles) => {
    const currentUser = requireUser(req, res);
    if (!currentUser) {
        return null;
    }
    if (!allowedRoles.includes(currentUser.role)) {
        sendForbidden(res, "You do not have permission to access this resource.");
        return null;
    }
    return currentUser;
};