const { VNPay } = require('vnpay');

// Khởi tạo instance VNPay
const vnpayInstance = new VNPay({
    tmnCode: process.env.VNPAY_TMN_CODE || 'TMNCODE',
    secureSecret: process.env.VNPAY_HASH_SECRET || 'SECRET',
    vnpayHost: 'https://sandbox.vnpayment.vn',
    testMode: true, // sử dụng sandbox
    hashAlgorithm: 'SHA512',
});

/**
 * Tạo URL thanh toán VNPay
 */
exports.createPaymentUrl = (ipAddr, amountMoney, appTransactionId, description) => {
    // VNPAY yêu cầu vnp_IpAddr tối đa 15 ký tự (IPv4). Node.js thường trả về IPv6 mapped (::ffff:192.168.1.1)
    let cleanIp = ipAddr || '127.0.0.1';
    const ipv4Match = cleanIp.match(/\d+\.\d+\.\d+\.\d+/);
    if (ipv4Match) {
        cleanIp = ipv4Match[0];
    } else {
        cleanIp = '127.0.0.1';
    }

    // buildPaymentUrl tự động nhân amount với 100 nếu thư viện hỗ trợ, hoặc ta có thể check document
    const urlString = vnpayInstance.buildPaymentUrl({
        vnp_Amount: amountMoney,
        vnp_IpAddr: cleanIp,
        vnp_TxnRef: appTransactionId,
        vnp_OrderInfo: description,
        vnp_OrderType: 'other',
        vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
    });
    return urlString;
};

/**
 * Verify callback/return url từ VNPay
 */
exports.verifyReturnUrl = (query) => {
    return vnpayInstance.verifyReturnUrl(query);
};
