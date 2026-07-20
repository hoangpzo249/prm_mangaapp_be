

const buckets = new Map();
setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets.entries()) {
        if (now - bucket.start > bucket.windowMs) {
            buckets.delete(key);
        }
    }
}, 10 * 60 * 1000).unref();

/**
 * Tạo middleware giới hạn số request theo IP
 * @param {Object} options
 * @param {number} options.windowMs - Khoảng thời gian tính (ms)
 * @param {number} options.max - Số request tối đa trong khoảng thời gian
 * @param {string} options.message - Thông báo khi vượt giới hạn
 */
const rateLimiter = ({ windowMs = 15 * 60 * 1000, max = 5, message = 'Quá nhiều yêu cầu, vui lòng thử lại sau' } = {}) => {
    return (req, res, next) => {
        const key = `${req.baseUrl}${req.path}:${req.ip}`;
        const now = Date.now();
        let bucket = buckets.get(key);

        if (!bucket || now - bucket.start > windowMs) {
            bucket = { start: now, count: 0, windowMs };
            buckets.set(key, bucket);
        }

        bucket.count += 1;

        if (bucket.count > max) {
            const retryAfterSec = Math.ceil((bucket.windowMs - (now - bucket.start)) / 1000);
            res.set('Retry-After', String(retryAfterSec));
            return res.status(429).json({ message });
        }

        next();
    };
};

module.exports = rateLimiter;
 