const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

router.get("/stats", verifyToken, isAdmin, adminController.getDashboardStats);

module.exports = router;