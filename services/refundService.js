const historyRepo = require('../repositories/historyRepository');
const userSubRepo = require('../repositories/userSubscriptionRepository');
const walletRepo = require('../repositories/walletRepository');
const transactionRepo = require('../repositories/transactionRepository');
const notificationRepo = require('../repositories/notificationRepository');
const storyRepo = require('../repositories/storyRepository');

// ============================================================
// Refund Service — Bồi thường xu khi admin ẩn nội dung VIP
// ============================================================
// Policy hiện tại:
// - 5 xu bồi thường / VIP chapter bị ẩn
// - Chỉ áp dụng cho user đã từng mua VIP (có UserSubscription bất kỳ)
//   VÀ có History cho truyện chứa chapter bị ẩn
// - Restore không thu lại xu đã hoàn
// ============================================================

const REFUND_PER_VIP_CHAPTER = 5;

/**
 * Bồi thường cho user đủ điều kiện khi truyện/chapter VIP bị ẩn.
 *
 * @param {Object} params
 * @param {string} params.storyId - Truyện chứa chapter VIP bị ẩn
 * @param {number} params.vipChapterCount - Số VIP chapter bị ẩn trong đợt này
 * @param {string} params.description - Mô tả hiển thị trong transaction
 * @returns {Object} { refundedUsers, coinsPerUser, totalCoins }
 */
exports.refundForHiddenVipChapters = async ({
    storyId,
    vipChapterCount,
    description
}) => {
    if (!storyId || !vipChapterCount || vipChapterCount <= 0) {
        return { refundedUsers: 0, coinsPerUser: 0, totalCoins: 0 };
    }

    // 1. Ai đã đọc truyện này?
    const readerIds = await historyRepo.findDistinctUserIdsByStory(storyId);
    if (readerIds.length === 0) {
        return { refundedUsers: 0, coinsPerUser: 0, totalCoins: 0 };
    }

    // 2. Trong đó, ai đã từng mua VIP?
    const eligibleIds = await userSubRepo.filterUsersEverSubscribed(readerIds);
    if (eligibleIds.length === 0) {
        return { refundedUsers: 0, coinsPerUser: 0, totalCoins: 0 };
    }

    const coinsPerUser = REFUND_PER_VIP_CHAPTER * vipChapterCount;

    // Lấy title truyện 1 lần để nhúng vào notification (truyện có thể đã ẩn
    // nên dùng findByIdIncludeHidden)
    const story = await storyRepo.findByIdIncludeHidden(storyId);
    const storyTitle = story?.title || 'một truyện';

    // 3. Cộng xu + tạo transaction + thông báo cho từng user
    //    Chạy song song, bỏ qua lỗi lẻ để không chặn toàn bộ đợt refund
    const txDescription = description ||
        `Bồi thường ${vipChapterCount} chapter VIP bị ẩn`;

    const results = await Promise.allSettled(
        eligibleIds.map(async (userId) => {
            const wallet = await walletRepo.findByUserId(userId);
            if (!wallet) return null;

            await walletRepo.addBalance(wallet._id, coinsPerUser);

            await transactionRepo.create({
                userId,
                walletId: wallet._id,
                type: 'REFUND_CHAPTER_HIDE',
                paymentMethod: 'COIN_SYSTEM',
                amountMoney: 0,
                amountCoins: coinsPerUser,
                status: 'SUCCESS',
                description: txDescription
            });

            // Thông báo cho user — không throw nếu fail, chỉ log
            try {
                await notificationRepo.create({
                    userId,
                    type: 'REFUND',
                    title: 'Bạn được hoàn xu',
                    message: `Truyện "${storyTitle}" có ${vipChapterCount} ` +
                        `chapter VIP bị ẩn. Bạn đã được hoàn ${coinsPerUser} xu ` +
                        `vào ví. Cảm ơn bạn đã đồng hành!`,
                    link: '/transaction-history'
                });
            } catch (err) {
                console.error('Refund notification failed for user', userId, err.message);
            }

            return userId;
        })
    );

    const refundedUsers = results.filter(
        r => r.status === 'fulfilled' && r.value != null
    ).length;

    return {
        refundedUsers,
        coinsPerUser,
        totalCoins: refundedUsers * coinsPerUser
    };
};

exports.REFUND_PER_VIP_CHAPTER = REFUND_PER_VIP_CHAPTER;
