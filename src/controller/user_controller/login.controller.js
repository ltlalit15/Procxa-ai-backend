const db = require("../../../config/config");
const User = db.user;
const Department = db.department;
const License = db.license;

const bcrypt = require("bcryptjs");
const tokenProcess = require("../../services/generateToken");
const { Op } = require("sequelize");

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const trimmedEmail = email ? email.trim() : '';
        const trimmedPassword = password ? password.trim() : '';

        if (!trimmedEmail || !trimmedPassword) {
            return res.status(400).json({
                status: false,
                message: "Please provide both email and password",
            });
        }

        /* ================= USER CHECK ================= */
        const users = await User.findOne({ where: { email_id: trimmedEmail } });

        /* ================= DEPARTMENT LOGIN ================= */
        if (!users) {
            const departmentUser = await Department.findOne({
                where: { email_id: trimmedEmail }
            });

            if (!departmentUser) {
                return res.status(401).json({
                    status: false,
                    message: "Login failed, please check the email address.",
                });
            }

            const isPasswordValid = await bcrypt.compare(
                trimmedPassword,
                departmentUser.password
            );

            if (!isPasswordValid) {
                return res.status(401).json({
                    status: false,
                    message: "Please enter valid password",
                });
            }

            const access_token = tokenProcess.generateAccessToken(departmentUser);
            const refresh_token = tokenProcess.generateRefreshToken(departmentUser);

            departmentUser.refreshToken = refresh_token;
            departmentUser.refreshToken_Expiration =
                Date.now() + 2 * 24 * 60 * 60 * 1000;

            await departmentUser.save();

            return res.status(200).json({
                status: true,
                message: "Login successful",
                access_token,
                refresh_token,
                userType: departmentUser.userType,
                permissions: departmentUser.permissions,
                adminId: departmentUser.userId,
                departmentUserId: departmentUser.id,
                userId: departmentUser.id
            });
        }

        /* ================= PASSWORD CHECK ================= */
        const isPasswordValid = await bcrypt.compare(
            trimmedPassword,
            users.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                status: false,
                message: "Please enter valid password",
            });
        }

        /* ================= ACTIVE CHECK ================= */
        if (users.is_active === false) {
            return res.status(403).json({
                status: false,
                message: "Your account has been deactivated. Please contact administrator.",
            });
        }

        /* ================= SUPERADMIN LOGIN ================= */
        if (users.userType === 'superadmin') {
            const access_token = tokenProcess.generateAccessToken(users);
            const refresh_token = tokenProcess.generateRefreshToken(users);

            users.refreshToken = refresh_token;
            users.refreshToken_Expiration =
                Date.now() + 2 * 24 * 60 * 60 * 1000;

            await users.save();

            return res.status(200).json({
                status: true,
                message: "Login successful",
                access_token,
                refresh_token,
                userType: users.userType,
                userId: users.id
            });
        }

        /* ================= ADMIN LICENSE CHECK ================= */
        if (users.userType === 'admin') {

            const activeLicense = await License.findOne({
                where: {
                    admin_id: users.id,
                    is_active: true,
                    [Op.or]: [
                        { expiry_date: null },
                        { expiry_date: { [Op.gt]: new Date() } }
                    ]
                }
            });

            if (!activeLicense) {
                const anyLicense = await License.findOne({
                    where: { admin_id: users.id }
                });

                if (anyLicense) {
                    if (
                        anyLicense.expiry_date &&
                        new Date(anyLicense.expiry_date) <= new Date()
                    ) {
                        return res.status(403).json({
                            status: false,
                            message: "Your license has expired. Please contact administrator.",
                            licenseExpired: true
                        });
                    }

                    if (!anyLicense.is_active) {
                        return res.status(403).json({
                            status: false,
                            message: "Your license is inactive. Please contact administrator.",
                            licenseInactive: true
                        });
                    }
                }

                return res.status(403).json({
                    status: false,
                    message: "Valid license required. Please contact administrator.",
                    requiresLicense: true
                });
            }

            const access_token = tokenProcess.generateAccessToken(users);
            const refresh_token = tokenProcess.generateRefreshToken(users);

            users.refreshToken = refresh_token;
            users.refreshToken_Expiration =
                Date.now() + 2 * 24 * 60 * 60 * 1000;

            await users.save();

            return res.status(200).json({
                status: true,
                message: "Login successful",
                access_token,
                refresh_token,
                userType: users.userType,
                userId: users.id,
                licenseAssigned: true
            });
        }

        /* ================= OTHER USERS ================= */
        const access_token = tokenProcess.generateAccessToken(users);
        const refresh_token = tokenProcess.generateRefreshToken(users);

        users.refreshToken = refresh_token;
        users.refreshToken_Expiration =
            Date.now() + 2 * 24 * 60 * 60 * 1000;

        await users.save();

        return res.status(200).json({
            status: true,
            message: "Login successful",
            access_token,
            refresh_token,
            userType: users.userType,
            userId: users.id
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            status: false,
            message: "An error occurred during the login process",
        });
    }
};
