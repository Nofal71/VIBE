import { Request, Response } from 'express';
import { TenantConnectionManager } from '../config/TenantConnectionManager';
import { Lead } from '../models/Lead';
import { Deal } from '../models/Deal';
import { Op, QueryTypes } from 'sequelize';

// ─── Date helpers ─────────────────────────────────────────────────────────────

/**
 * Build a safe date-range WHERE clause fragment.
 * Returns an Op.between condition when both dates are valid ISO strings,
 * otherwise returns an empty object (no filter applied).
 */
function buildDateWhere(
    column: string,
    startDate: string | undefined,
    endDate: string | undefined
): Record<string, unknown> {
    if (!startDate || !endDate) return {};
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return {};
    // Extend endDate to end-of-day so the filter is inclusive
    end.setHours(23, 59, 59, 999);
    return { [column]: { [Op.between]: [start, end] } };
}

// ─── Controller ───────────────────────────────────────────────────────────────

export class AnalyticsController {

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
    static async getDashboardStats(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.headers['x-tenant-id'] as string;

            if (!tenantId) {
                res.status(400).json({ error: 'Tenant context mapping required.' });
                return;
            }

            const { startDate, endDate } = req.query as {
                startDate?: string;
                endDate?: string;
            };

            const sequelize = await TenantConnectionManager.getConnection(tenantId);

            Lead.initModel(sequelize, tenantId);
            Deal.initModel(sequelize, tenantId);

            const leadDateWhere = buildDateWhere('createdAt', startDate, endDate);
            const dealDateWhere = buildDateWhere('createdAt', startDate, endDate);

            // ── 1. Total Leads (date-ranged if provided) ──────────────────────
            const totalLeads = await Lead.count({
                where: leadDateWhere as any,
            });

            // ── 2. Leads by Stage ─────────────────────────────────────────────
            const leadsByStage = await Lead.findAll({
                attributes: [
                    'status_id',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                ],
                where: leadDateWhere as any,
                group: ['status_id'],
                raw: true,
            });

            // ── 3. Total Deal Value (all time, no date filter — for context) ──
            const totalDealValueData = await Deal.findAll({
                attributes: [
                    [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount'],
                ],
                raw: true,
            });
            const totalDealValue = Number((totalDealValueData[0] as any)?.total_amount ?? 0);

            // ── 4. Won Deal Value in range ─────────────────────────────────────
            const wonWhere: Record<string, unknown> = { stage: 'WON', ...dealDateWhere };
            const wonDealData = await Deal.findAll({
                attributes: [
                    [sequelize.fn('SUM', sequelize.col('amount')), 'won_amount'],
                ],
                where: wonWhere as any,
                raw: true,
            });
            const wonDealValue = Number((wonDealData[0] as any)?.won_amount ?? 0);

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

            interface LeaderboardRow {
                assigned_to: string;
                total_won: string;
                deals_won: string;
            }

            const leaderboardRaw = await sequelize.query<LeaderboardRow>(
                leaderboardSql,
                {
                    replacements: {
                        ...(startParam && { startParam }),
                        ...(endParam && { endParam }),
                    },
                    type: QueryTypes.SELECT,
                }
            );

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

        } catch (error) {
            console.error('[AnalyticsController] getDashboardStats failed:', error);
            res.status(500).json({ error: 'Failed to extract tenant analytics.' });
        }
    }
}
