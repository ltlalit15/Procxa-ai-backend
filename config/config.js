require('dotenv').config()
const { DB_HOST, DB_NAME, DB_USERNAME, DB_PASSWORD } = process.env
const { Sequelize, DataTypes } = require('sequelize')

const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
    host: DB_HOST,
    dialect: 'mysql',
    logging: false,

})

try {
    sequelize.authenticate()
    console.log("Connection has been establised successfully with DataBase...!")
} catch (error) {
    console.error("Unable to connect to the database", error)
}

const db = {}
db.sequelize = sequelize;
db.Sequelize = Sequelize;


db.user = require("../src/model/user_model/user.model")(sequelize, DataTypes)
db.intake_request = require("../src/model/intake_request_model/intake_request.model")(sequelize, DataTypes)
db.intake_request_approvers = require("../src/model/approval_model/intake_request_approvers.model")(sequelize , DataTypes)
db.intake_request_comment = require("../src/model/intake_request_model/intake_request_comment.model")(sequelize , DataTypes)
db.procurement_request_approvers = require("../src/model/approval_model/procurement_approval.model")(sequelize,DataTypes)
db.renewal_request = require("../src/model/renewal_management_model/renewal_management.model")(sequelize , DataTypes)
db.renewal_notification =require("../src/model/renewal_notification_model/renewal_notification.model")(sequelize , DataTypes)
db.contract_type = require("../src/model/contract_management_model/contract_type.model")(sequelize , DataTypes)
db.contract = require("../src/model/contract_management_model/contract_management.model")(sequelize ,DataTypes)
db.contract_template = require("../src/model/contract_template_model/contract_template.model")(sequelize ,DataTypes)
db.department = require("../src/model/department.model/department.model")(sequelize , DataTypes)
db.supplier = require("../src/model/supplier_model/supplier.model")(sequelize , DataTypes)
db.transaction = require("../src/model/transaction_model/transaction.model")(sequelize , DataTypes)
db.volume_discount = require("../src/model/volume_discount_model/volume_discount.model")(sequelize , DataTypes)
db.supplier_consolidation = require("../src/model/supplier_consolidation_model/supplier_consolidation.model")(sequelize , DataTypes)
db.service_sow_consolidation = require("../src/model/sow_consolidation_model/sow_consolidation.model")(sequelize , DataTypes)
db.old_pricing = require("../src/model/old_pricing_model/old_price.model")(sequelize , DataTypes)
db.complementary_service = require("../src/model/complementary_service_model/complementary_service.model")(sequelize , DataTypes)
db.price_comparison = require("../src/model/price_comparison_model/price_comparison.model")(sequelize , DataTypes)
db.multi_year_contracting = require("../src/model/multi_year_contracting_model/multi_year_contracting_model")(sequelize , DataTypes)
db.category = require("../src/model/category_model/category.model")(sequelize, DataTypes)
db.subcategories = require("../src/model/category_model/subcategory.model")(sequelize ,DataTypes)
db.assign_intake_request = require("../src/model/assign_supplier_model/assign_supplier.model")(sequelize , DataTypes)
db.supplier_rating =  require("../src/model/supplier_model/supplier_rating.model")(sequelize,DataTypes)
db.costSaving = require("../src/model/costSaving_model/costSaving.model")(sequelize,DataTypes)
db.license = require("../src/model/license_model/license.model")(sequelize, DataTypes)
db.notification = require("../src/model/notification_model/notification.model")(sequelize, DataTypes)
require('./association')(db);
db.sequelize.sync({ alter: false });

module.exports = db;
