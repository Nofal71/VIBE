"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentBlueprint = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class DepartmentBlueprint extends sequelize_1.Model {
    id;
    name;
    schema_json;
    default_roles_json;
    ui_config_json;
    default_stages_json;
}
exports.DepartmentBlueprint = DepartmentBlueprint;
DepartmentBlueprint.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: { type: sequelize_1.DataTypes.STRING, allowNull: false, unique: true },
    schema_json: { type: sequelize_1.DataTypes.JSON, allowNull: false, defaultValue: { tables: [] } },
    default_roles_json: { type: sequelize_1.DataTypes.JSON, allowNull: false, defaultValue: { roles: [] } },
    ui_config_json: { type: sequelize_1.DataTypes.JSON, allowNull: true, defaultValue: {} },
    default_stages_json: { type: sequelize_1.DataTypes.JSON, allowNull: true, defaultValue: [] },
}, {
    sequelize: database_1.sequelize,
    modelName: 'DepartmentBlueprint',
    tableName: 'department_blueprints',
    timestamps: true,
});
