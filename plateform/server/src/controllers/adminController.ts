const User = require("../models/User");
const Build = require("../models/Build");

exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();

        const activeBuilds = await Build.countDocuments({
            status: { $in: ['running', 'paused'] }
        });

        res.status(200).json({
            users: totalUsers,
            activeBuilds: activeBuilds
        });
    } catch (error) {
        res.status(500).json({ error: "Impossible de récupérer les statistiques" });
    }
};