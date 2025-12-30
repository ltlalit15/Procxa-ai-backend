const { Op ,Sequelize } = require("sequelize");
const db = require('../../../config/config');
const Transaction = db.transaction;
const category = db.category;
const supplier = db.supplier;
const department = db.department;
const get_spends_details = async (req, res) => {
    try {
        // Check user role for data filtering
        const userType = req.user?.userType;
        const userId = req.user?.id;
        const isSuperAdmin = userType === 'superadmin';
        
        // Build where clause for Admin users (filter by userId)
        const adminWhereClause = isSuperAdmin ? {} : { userId: userId };
        
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 7;
        const offset = (page - 1) * limit;

        // Extract search filters from query params
        const { supplierName, transactionDate, categoryName, departmentName } = req.query;

        // Define the where clause for filtering
        const whereClause = {
            ...adminWhereClause
        };

        // Apply search filters dynamically
        const includeClause = [
            {
                model: department,
                as: "department",
                attributes: ['id', 'name'],
                where: departmentName ? { name: { [Op.like]: `%${departmentName}%` } } : undefined
            },
            {
                model: supplier,
                as: "supplier",
                attributes: ['id', 'name'],
                where: supplierName ? { name: { [Op.like]: `%${supplierName}%` } } : undefined
            },
            {
                model: category,
                as: "category",
                attributes: ['id', 'name'],
                where: categoryName ? { name: { [Op.like]: `%${categoryName}%` } } : undefined
            }
        ];

        // Filter transactions by exact date if provided
        if (transactionDate) {
            whereClause.dateOfTransaction = transactionDate;
        }

        // Fetch transactions with filters
        const { rows: transactions, count: totalRecords } = await Transaction.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            include: includeClause.filter(Boolean) // Remove undefined values
        });

        if (transactions.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'No transactions found',
                data: [],
            });
        }

        // Calculate total transaction amount
        const totalTransactionAmount = transactions.reduce((acc, transaction) => acc + (transaction.amount || 0), 0);

        // Get unique vendor count
        const uniqueVendors = new Set(transactions.map(transaction => transaction.supplier?.id));
        const totalVendorCount = uniqueVendors.size; // Count unique vendors

        const totalPages = Math.ceil(totalRecords / limit);

        return res.status(200).json({
            status: true,
            message: 'Transactions fetched successfully',
            data: transactions,
            summary: {
                totalSpendCount: totalRecords,          // Total transactions count
                totalTransactionAmount,                // Sum of all transaction amounts
                totalVendorCount                       // Unique vendor count
            },
            pagination: {
                currentPage: page,
                totalPages,
                totalRecords,
                limit,
            },
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};



const get_dashboard_spends_analytics = async (req, res) => {
    try {
        // Check user role for data filtering
        const userType = req.user?.userType;
        const userId = req.user?.id;
        const isSuperAdmin = userType === 'superadmin';
        
        // Build where clause for Admin users (filter by userId)
        const adminWhereClause = isSuperAdmin ? {} : { userId: userId };
        
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(endDate.getMonth() - 5); // Last 6 months (including current month)

        // Get total transaction count (filtered for Admin users)
        const totalTransactions = await Transaction.count({
            where: adminWhereClause
        });

        // Get unique suppliers count (filtered for Admin users)
        const uniqueSuppliers = await Transaction.count({
            distinct: true,
            col: "supplierId",
            where: adminWhereClause
        });

        // Build where clause for transactions with date filter
        const transactionWhereClause = {
            dateOfTransaction: {
                [Op.between]: [startDate, endDate],
            },
            ...(isSuperAdmin ? {} : { userId: userId })
        };

        // Fetch top 5 suppliers by total transaction amount (filtered for Admin users)
        const topSuppliers = await Transaction.findAll({
            attributes: [
                "supplierId",
                [Sequelize.fn("SUM", Sequelize.col("amount")), "totalAmount"],
            ],
            include: [
                {
                    model: supplier,
                    as: "supplier",
                    attributes: ["name"],
                },
            ],
            where: transactionWhereClause,
            group: ["supplierId", "supplier.name"], // Group correctly
            order: [[Sequelize.fn("SUM", Sequelize.col("amount")), "DESC"]],
            limit: 5,
            raw: true, // Ensure clean results
        });

        const barGraphData = topSuppliers.map((supplierData) => ({
            topSupplier: supplierData["supplier.name"], // Access nested object properly
            totalAmount: parseFloat(supplierData.totalAmount),
        }));

        // Fetch total spend per category for each month (filtered for Admin users)
        const monthlyCategoryData = await Transaction.findAll({
            attributes: [
                [Sequelize.fn("DATE_FORMAT", Sequelize.col("dateOfTransaction"), "%b %Y"), "month"], // "Jan 2025"
                [Sequelize.fn("SUM", Sequelize.col("amount")), "totalAmount"],
                [Sequelize.col("category.name"), "categoryName"],
            ],
            include: [
                {
                    model: category,
                    as: "category",
                    attributes: [],
                },
            ],
            where: transactionWhereClause,
            group: ["month", "categoryId", "category.name"], // Ensure category grouping is correct
            order: [[Sequelize.fn("MIN", Sequelize.col("dateOfTransaction")), "ASC"]],
            raw: true, // Get plain results
        });

        return res.status(200).json({
            status: true,
            message: "Dashboard analytics fetched successfully",
            summary: {
                totalSpendCount: totalTransactions,
                totalSupplierCount: uniqueSuppliers,
            },
            topSuppliers: barGraphData,
            categoryData: monthlyCategoryData,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};



module.exports = {
    get_spends_details,

    get_dashboard_spends_analytics
};
