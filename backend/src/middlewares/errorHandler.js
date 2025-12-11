const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors || {}).map((val) => val.message);
        return res.status(400).json({ success: false, message: 'Validation Error', errors });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired' });
    }

    if (err.code === '23505') {
        return res.status(409).json({
            success: false,
            message: 'Duplicate entry',
            error: err.detail || 'A record with this information already exists',
        });
    }

    if (err.code === '23503') {
        return res.status(400).json({
            success: false,
            message: 'Invalid reference',
            error: 'Referenced record does not exist',
        });
    }

    if (err.code === '23502') {
        return res.status(400).json({
            success: false,
            message: 'Required field missing',
            error: err.detail || 'A required field is missing',
        });
    }

    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

export default errorHandler;
