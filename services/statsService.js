const User = require('../models/User');
const Story = require('../models/Story');
const Transaction = require('../models/Transaction');

// Helper to get array of last N days formatted as YYYY-MM-DD
const getLastNDays = (n) => {
    const dates = [];
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        dates.push(`${yyyy}-${mm}-${dd}`);
    }
    return dates;
};

exports.getOverview = async () => {
    const totalUsers = await User.countDocuments();
    const totalStories = await Story.countDocuments({ isHidden: { $ne: true } });

    const viewResult = await Story.aggregate([
        { $match: { isHidden: { $ne: true } } },
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    const totalViews = viewResult[0]?.totalViews || 0;

    const revResult = await Transaction.aggregate([
        { $match: { type: 'DEPOSIT', status: 'SUCCESS' } },
        { $group: { _id: null, totalRevenue: { $sum: '$amountMoney' } } }
    ]);
    const totalRevenue = revResult[0]?.totalRevenue || 0;

    return {
        totalUsers,
        totalStories,
        totalViews,
        totalRevenue
    };
};

exports.getTopStories = async () => {
    return Story.find({ isHidden: { $ne: true } })
        .sort({ views: -1 })
        .limit(5)
        .select('title thumbnail views author slug')
        .lean();
};

exports.getRevenueChart = async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const aggregates = await Transaction.aggregate([
        {
            $match: {
                type: 'DEPOSIT',
                status: 'SUCCESS',
                createdAt: { $gte: sevenDaysAgo }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "+07:00" } },
                revenue: { $sum: "$amountMoney" }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Fill missing days with 0
    const last7Days = getLastNDays(7);
    const aggMap = new Map(aggregates.map(item => [item._id, item.revenue]));

    return last7Days.map(date => ({
        date,
        revenue: aggMap.get(date) || 0
    }));
};

exports.getUserGrowthChart = async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const aggregates = await User.aggregate([
        {
            $match: {
                createdAt: { $gte: sevenDaysAgo }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "+07:00" } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Fill missing days with 0
    const last7Days = getLastNDays(7);
    const aggMap = new Map(aggregates.map(item => [item._id, item.count]));

    return last7Days.map(date => ({
        date,
        count: aggMap.get(date) || 0
    }));
};
