const historyRepo = require('../repositories/historyRepository');
const chapterHistoryRepo = require('../repositories/chapterHistoryRepository');
const userSubRepo = require('../repositories/userSubscriptionRepository');
const walletRepo = require('../repositories/walletRepository');
const transactionRepo = require('../repositories/transactionRepository');
const notificationRepo = require('../repositories/notificationRepository');
const storyRepo = require('../repositories/storyRepository');

// ============================================================
// Refund Service — Bồi thường xu khi admin ẩn nội dung VIP
// ============================================================
// Policy hiện tại (fair refund):
// - 5 xu / VIP chapter bị ẩn mà user đã ĐỌC khi đang VIP.
// - Tra qua ChapterHistory (readWhileVip=true) để biết user thực sự đọc
//   chapter nào.
// - Ẩn 1 chapter → refund cho ai đã đọc chapter đó (5 xu/user).
// - Ẩn cả truyện → refund cho mỗi user theo số VIP chapter họ đã đọc
//   (5 × count xu/user).
// - Restore không thu lại xu đã hoàn.
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
    const story = await storyRepo.findByIdIncludeHidden(storyId);
    const storyTitle = story?.title || 'một truyện';
    const txDescription = description ||
        `Bồi thường ${vipChapterCount} chapter VIP bị ẩn`;
    const notifMessage = `Truyện "${storyTitle}" có ${vipChapterCount} ` +
        `chapter VIP bị ẩn. Bạn đã được hoàn ${coinsPerUser} xu ` +
        `vào ví. Cảm ơn bạn đã đồng hành!`;

    return creditRefund({
        userIds: eligibleIds,
        coinsPerUser,
        txDescription,
        notifMessage
    });
};

/**
 * Refund công bằng cho việc ẩn 1 chapter VIP cụ thể.
 * Điều kiện: user phải có ChapterHistory cho ĐÚNG chapterId đó với
 * readWhileVip=true (nghĩa là đã đọc chapter này khi đang là VIP).
 * Không phụ thuộc vào việc user có đọc chapter khác của truyện hay không.
 */
exports.refundForHiddenVipChapter = async ({
    storyId,
    chapterId,
    chapterNumber
}) => {
    if (!chapterId) {
        return { refundedUsers: 0, coinsPerUser: 0, totalCoins: 0 };
    }

    const eligibleIds =
        await chapterHistoryRepo.findDistinctVipReaderIdsByChapter(chapterId);
    if (eligibleIds.length === 0) {
        return { refundedUsers: 0, coinsPerUser: 0, totalCoins: 0 };
    }

    const coinsPerUser = REFUND_PER_VIP_CHAPTER;
    const story = storyId
        ? await storyRepo.findByIdIncludeHidden(storyId)
        : null;
    const storyTitle = story?.title || 'một truyện';
    const chapterLabel = chapterNumber != null
        ? `Chapter ${chapterNumber}`
        : 'một chapter';

    const txDescription = `Bồi thường ${chapterLabel} VIP bị ẩn` +
        (storyTitle ? ` (${storyTitle})` : '');
    const notifMessage = `${chapterLabel} VIP bạn đã đọc của truyện ` +
        `"${storyTitle}" đã bị ẩn. Bạn đã được hoàn ${coinsPerUser} xu ` +
        `vào ví. Cảm ơn bạn đã đồng hành!`;

    return creditRefund({
        userIds: eligibleIds,
        coinsPerUser,
        txDescription,
        notifMessage
    });
};

/**
 * Refund công bằng khi ẩn CẢ TRUYỆN có VIP chapter.
 * Với mỗi user, đếm số VIP chapter họ đã đọc khi đang VIP → refund 5 × count.
 * User không đọc VIP chapter nào (dù có đọc chapter free) → không nhận xu.
 *
 * @param {Object} params
 * @param {string} params.storyId
 * @param {Array<ObjectId>} params.vipChapterIds - Danh sách _id VIP chapter
 *        đang hiển thị (được lấy TRƯỚC khi ẩn).
 */
exports.refundForHiddenStory = async ({ storyId, vipChapterIds }) => {
    if (!vipChapterIds || vipChapterIds.length === 0) {
        return { refundedUsers: 0, totalCoins: 0 };
    }

    const readCounts =
        await chapterHistoryRepo.aggregateVipReadCountsByChapters(vipChapterIds);
    if (readCounts.length === 0) {
        return { refundedUsers: 0, totalCoins: 0 };
    }

    const story = storyId
        ? await storyRepo.findByIdIncludeHidden(storyId)
        : null;
    const storyTitle = story?.title || 'một truyện';

    // Cộng xu song song cho từng user theo số chapter họ đã đọc.
    // Không dùng creditRefund helper vì coinsPerUser khác nhau giữa các user.
    const results = await Promise.allSettled(
        readCounts.map(async ({ userId, count }) => {
            const coins = REFUND_PER_VIP_CHAPTER * count;
            const wallet = await walletRepo.findByUserId(userId);
            if (!wallet) return null;

            await walletRepo.addBalance(wallet._id, coins);

            await transactionRepo.create({
                userId,
                walletId: wallet._id,
                type: 'REFUND_CHAPTER_HIDE',
                paymentMethod: 'COIN_SYSTEM',
                amountMoney: 0,
                amountCoins: coins,
                status: 'SUCCESS',
                description: `Bồi thường ${count} chapter VIP đã đọc bị ẩn ` +
                    `(truyện "${storyTitle}")`
            });

            try {
                await notificationRepo.create({
                    userId,
                    type: 'REFUND',
                    title: 'Bạn được hoàn xu',
                    message: `Truyện "${storyTitle}" đã bị ẩn. Bạn đã đọc ` +
                        `${count} chapter VIP nên được hoàn ${coins} xu vào ` +
                        `ví. Cảm ơn bạn đã đồng hành!`,
                    link: '/transaction-history'
                });
            } catch (err) {
                console.error('Refund notification failed for user', userId, err.message);
            }

            return coins;
        })
    );

    const succeeded = results.filter(
        r => r.status === 'fulfilled' && r.value != null
    );
    const totalCoins = succeeded.reduce((sum, r) => sum + r.value, 0);

    return {
        refundedUsers: succeeded.length,
        totalCoins
    };
};

/**
 * Cộng xu + ghi transaction + gửi notification cho danh sách user đã lọc.
 * Chạy song song, bỏ qua lỗi lẻ.
 */
async function creditRefund({ userIds, coinsPerUser, txDescription, notifMessage }) {
    const results = await Promise.allSettled(
        userIds.map(async (userId) => {
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

            try {
                await notificationRepo.create({
                    userId,
                    type: 'REFUND',
                    title: 'Bạn được hoàn xu',
                    message: notifMessage,
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
}

exports.REFUND_PER_VIP_CHAPTER = REFUND_PER_VIP_CHAPTER;
