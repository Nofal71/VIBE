"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlueprintController = void 0;
const models_1 = require("../models");
class BlueprintController {
    static async createBlueprint(req, res) {
        try {
            const { name, schema_json, default_roles_json } = req.body;
            if (!name || !schema_json) {
                res.status(400).json({ error: 'Missing name or schema_json definitions in request constraints.' });
                return;
            }
            const blueprint = await models_1.DepartmentBlueprint.create({
                name,
                schema_json,
                default_roles_json: default_roles_json || { roles: ['Admin'] },
            });
            res.status(201).json({
                message: 'Blueprint registered deeply in system.',
                blueprint,
            });
        }
        catch (error) {
            console.error('Error binding blueprint mapping:', error);
            res.status(500).json({ error: 'Failed to save blueprint constraints to the Master network.' });
        }
    }
    static async getBlueprints(req, res) {
        try {
            const blueprints = await models_1.DepartmentBlueprint.findAll();
            res.status(200).json({ blueprints });
        }
        catch (error) {
            console.error('Error fetching deep blueprints:', error);
            res.status(500).json({ error: 'Failed to access blueprints' });
        }
    }
}
exports.BlueprintController = BlueprintController;
