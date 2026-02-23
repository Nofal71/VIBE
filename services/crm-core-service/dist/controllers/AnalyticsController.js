"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const TenantConnectionManager_1 = require("../config/TenantConnectionManager");
const Lead_1 = require("../models/Lead");
const Deal_1 = require("../models/Deal");
const sequelize_1 = require("sequelize");
// ─── Date helpers ─────────────────────────────────────────────────────────────
/**
 * Build a safe date-range WHERE clause fragment.
 * Returns an Op.between condition when both dates are valid ISO strings,
 * otherwise returns an empty object (no filter applied).
 */
function buildDateWhere(column, startDate, endDate) {
    if (!startDate || !endDate)
        return {};
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()))
        return {};
    // Extend endDate to end-of-day so the filter is inclusive
    end.setHours(23, 59, 59, 999);
    return { [column]: { [sequelize_1.Op.between]: [start, end] } };
}
// ─── Controller ───────────────────────────────────────────────────────────────
class AnalyticsController {
    /**
     * GET /api/analytics/dashboard
     * Query params: startDate (ISO), endDate (ISO)
     *
     * Returns:
     *  - totalLeads          — count of leads in the date range
     *  - leadsByStage        — count per status_id
     *  - totalDealValue      — sum of ALL deal amounts
     *  - wonDealValue        — sum of WON deal amounts in date range
     *  - conversionRate      — wonDeals / totalLeads × 100
     *  - staff_leaderboard   — Top agents ranked by WON deal revenue in the range
     */
    static async getDashboardStats(req, res) {
        try {
            const tenantId = req.headers['x-tenant-id'];
            if (!tenantId) {
                res.status(400).json({ error: 'Tenant context mapping required.' });
                return;
            }
            const { startDate, endDate } = req.query;
            const sequelize = await TenantConnectionManager_1.TenantConnectionManager.getConnection(tenantId);
            Lead_1.Lead.initModel(sequelize, tenantId);
            Deal_1.Deal.initModel(sequelize, tenantId);
            const leadDateWhere = buildDateWhere('createdAt', startDate, endDate);
            const dealDateWhere = buildDateWhere('createdAt', startDate, endDate);
            // ── 1. Total Leads (date-ranged if provided) ──────────────────────
            const totalLeads = await Lead_1.Lead.count({
                where: leadDateWhere,
            });
            // ── 2. Leads by Stage ─────────────────────────────────────────────
            const leadsByStage = await Lead_1.Lead.findAll({
                attributes: [
                    'status_id',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                ],
                where: leadDateWhere,
                group: ['status_id'],
                raw: true,
            });
            // ── 3. Total Deal Value (all time, no date filter — for context) ──
            const totalDealValueData = await Deal_1.Deal.findAll({
                attributes: [
                    [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount'],
                ],
                raw: true,
            });
            const totalDealValue = Number(totalDealValueData[0]?.total_amount ?? 0);
            // ── 4. Won Deal Value in range ─────────────────────────────────────
            const wonWhere = { stage: 'WON', ...dealDateWhere };
            const wonDealData = await Deal_1.Deal.findAll({
                attributes: [
                    [sequelize.fn('SUM', sequelize.col('amount')), 'won_amount'],
                ],
                where: wonWhere,
                raw: true,
            });
            const wonDealValue = Number(wonDealData[0]?.won_amount ?? 0);
            // ── 5. Conversion Rate ─────────────────────────────────────────────
            const conversionRate = totalLeads > 0
                ? parseFloat(((wonDealValue / totalLeads) * 100).toFixed(2))
                : 0;
            // ── 6. Staff Leaderboard ───────────────────────────────────────────
            // Group WON deals by assigned_to, sum amount, sort DESC, limit 10.
            // We use raw SQL for flexibility across Sequelize's strict grouping rules.
            const startParam = startDate ? new Date(startDate) : null;
            const endParam = endDate ? (() => { const d = new Date(endDate); d.setHours(23, 59, 59, 999); return d; })() : null;
            const leaderboardSql = `
                SELECT
                    d.assigned_to,
                    SUM(d.amount) AS total_won,
                    COUNT(d.id) AS deals_won
                FROM \`deals\` d
                WHERE d.stage = 'WON'
                  ${startParam ? 'AND d.createdAt >= :startParam' : ''}
                  ${endParam ? 'AND d.createdAt <= :endParam' : ''}
                GROUP BY d.assigned_to
                ORDER BY total_won DESC
                LIMIT 10
            `;
            const leaderboardRaw = await sequelize.query(leaderboardSql, {
                replacements: {
                    ...(startParam && { startParam }),
                    ...(endParam && { endParam }),
                },
                type: sequelize_1.QueryTypes.SELECT,
            });
            const staff_leaderboard = leaderboardRaw.map((row, index) => ({
                rank: index + 1,
                agent_id: row.assigned_to,
                total_won: parseFloat(row.total_won ?? '0'),
                deals_won: parseInt(row.deals_won ?? '0', 10),
            }));
            res.status(200).json({
                date_range: { startDate: startDate ?? null, endDate: endDate ?? null },
                totalLeads,
                leadsByStage,
                totalDealValue,
                wonDealValue,
                conversionRate,
                staff_leaderboard,
            });
        }
        catch (error) {
            console.error('[AnalyticsController] getDashboardStats failed:', error);
            res.status(500).json({ error: 'Failed to extract tenant analytics.' });
        }
    }
}
exports.AnalyticsController = AnalyticsController;
