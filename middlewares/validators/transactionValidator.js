// ============================================================
// Transaction Validator — Validation rules cho giao dịch
// ============================================================

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

const VALID_PAYMENT_METHODS = ['MOMO', 'ZALOPAY', 'VNPAY', 'BANK_TRANSFER', 'COIN_SYSTEM'];

/** Rules cho POST /api/transactions/deposit (tạo giao dịch nạp xu) */
const createDepositRules = [
    {
        field: 'paymentMethod',
        check: (v) => isNonEmptyString(v) && VALID_PAYMENT_METHODS.includes(v),
        message: `paymentMethod là bắt buộc, phải là một trong: ${VALID_PAYMENT_METHODS.join(', ')}`
    },
    {
        field: 'amountMoney',
        check: (v) => typeof v === 'number' && v > 0,
        message: 'amountMoney là bắt buộc và phải > 0'
    },
    {
        field: 'amountCoins',
        check: (v) => typeof v === 'number' && v > 0,
        message: 'amountCoins là bắt buộc và phải > 0'
    }
];

module.exports = { createDepositRules };
