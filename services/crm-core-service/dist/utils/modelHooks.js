"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyGlobalHooks = void 0;
const redisBus_1 = require("../config/redisBus");
const applyGlobalHooks = (model, tenantId, userId = 'system') => {
    model.addHook('afterCreate', async (instance, options) => {
        try {
            const payload = {
                tenant_id: tenantId,
                action: 'CREATE',
                table_name: model.tableName,
                record_id: instance.id,
                old_values: null,
                new_values: instance.toJSON(),
                updated_by: userId,
                timestamp: new Date().toISOString()
            };
            await redisBus_1.redisBus.publish('AUDIT_LOG_EVENT', payload);
        }
        catch (error) {
            console.error('Failed to broadcast afterCreate hook', error);
        }
    });
    model.addHook('afterUpdate', async (instance, options) => {
        try {
            const changedFields = instance.changed();
            if (!changedFields)
                return;
            const oldValues = {};
            const newValues = {};
            changedFields.forEach((field) => {
                oldValues[field] = instance.previous(field);
                newValues[field] = instance.get(field);
            });
            const payload = {
                tenant_id: tenantId,
                action: 'UPDATE',
                table_name: model.tableName,
                record_id: instance.id,
                old_values: oldValues,
                new_values: newValues,
                updated_by: userId,
                timestamp: new Date().toISOString()
            };
            await redisBus_1.redisBus.publish('AUDIT_LOG_EVENT', payload);
            // Dedicated trigger for Deal DFA States Automation
            if (model.name === 'Deal' && changedFields.includes('current_state')) {
                await redisBus_1.redisBus.publish('DEAL_STATE_UPDATE_REQUESTED', {
                    tenant_id: tenantId,
                    deal_id: instance.id,
                    old_state: instance.previous('current_state'),
                    new_state: instance.get('current_state')
                });
            }
        }
        catch (error) {
            console.error('Failed to broadcast afterUpdate hook', error);
        }
    });
    model.addHook('afterDestroy', async (instance, options) => {
        try {
            const payload = {
                tenant_id: tenantId,
                action: 'DELETE',
                table_name: model.tableName,
                record_id: instance.id,
                old_values: instance.toJSON(),
                new_values: null,
                updated_by: userId,
                timestamp: new Date().toISOString()
            };
            await redisBus_1.redisBus.publish('AUDIT_LOG_EVENT', payload);
        }
        catch (error) {
            console.error('Failed to broadcast afterDestroy hook', error);
        }
    });
};
exports.applyGlobalHooks = applyGlobalHooks;
