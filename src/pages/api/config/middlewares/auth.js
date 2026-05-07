const authMiddleware = handler => async (req, res) => {

    return handler(req, res);
}

export default authMiddleware;
