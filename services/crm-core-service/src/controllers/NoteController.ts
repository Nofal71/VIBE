import { Request, Response } from 'express';
import { Op, WhereOptions } from 'sequelize';
import { TenantConnectionManager } from '../config/TenantConnectionManager';
import { Note, NoteVisibility } from '../models/Note';

// Roles considered admin-level for ADMIN_ONLY visibility
const ADMIN_ROLES = new Set(['admin', 'super_admin', 'manager']);

export class NoteController {

    private static async init(req: Request): Promise<{ Note: typeof Note }> {
        const tenantId = req.headers['x-tenant-id'] as string;
        const userId = (req.headers['x-user-id'] as string) ?? 'system';
        const sequelize = await TenantConnectionManager.getConnection(tenantId);
        Note.initModel(sequelize, tenantId, userId);
        return { Note };
    }

    // ─── CREATE ──────────────────────────────────────────────────────────────────

    static async createNote(req: Request, res: Response): Promise<void> {
        try {
            const { Note } = await NoteController.init(req);
            const { lead_id, content, visibility } = req.body as {
                lead_id: string;
                content: string;
                visibility: NoteVisibility;
            };
            const author_id = req.headers['x-user-id'] as string;

            if (!lead_id || !content) {
                res.status(400).json({ error: 'lead_id and content are required.' });
                return;
            }

            const note = await Note.create({
                lead_id,
                content,
                author_id,
                visibility: visibility ?? 'PUBLIC',
            } as any);

            res.status(201).json({ note });
        } catch (error) {
            console.error('[NoteController] createNote failed:', error);
            res.status(500).json({ error: 'Failed to create note.' });
        }
    }

    // ─── LIST (visibility-filtered) ───────────────────────────────────────────

    static async getNotesByLead(req: Request, res: Response): Promise<void> {
        try {
            const { Note } = await NoteController.init(req);
            const { lead_id } = req.query as { lead_id: string };
            const userId = req.headers['x-user-id'] as string;
            const userRole = (req.headers['x-user-role'] as string ?? '').toLowerCase();
            const isAdmin = ADMIN_ROLES.has(userRole);

            if (!lead_id) {
                res.status(400).json({ error: 'lead_id query parameter is required.' });
                return;
            }

            // Build visibility clause based on role:
            // - Admin: see PUBLIC + ADMIN_ONLY + their own PRIVATE
            // - Others: see PUBLIC + their own PRIVATE (never ADMIN_ONLY)
            const visibilityClause: WhereOptions = isAdmin
                ? {
                    [Op.or]: [
                        { visibility: 'PUBLIC' },
                        { visibility: 'ADMIN_ONLY' },
                        { visibility: 'PRIVATE', author_id: userId },
                    ],
                }
                : {
                    [Op.or]: [
                        { visibility: 'PUBLIC' },
                        { visibility: 'PRIVATE', author_id: userId },
                    ],
                };

            const notes = await Note.findAll({
                where: { lead_id, ...visibilityClause },
                order: [['createdAt', 'DESC']],
            });

            res.status(200).json({ notes });
        } catch (error) {
            console.error('[NoteController] getNotesByLead failed:', error);
            res.status(500).json({ error: 'Failed to retrieve notes.' });
        }
    }

    // ─── UPDATE ──────────────────────────────────────────────────────────────────

    static async updateNote(req: Request, res: Response): Promise<void> {
        try {
            const { Note } = await NoteController.init(req);
            const { id } = req.params;
            const userId = req.headers['x-user-id'] as string;
            const userRole = (req.headers['x-user-role'] as string ?? '').toLowerCase();
            const isAdmin = ADMIN_ROLES.has(userRole);

            const note = await Note.findByPk(id);
            if (!note) {
                res.status(404).json({ error: 'Note not found.' });
                return;
            }

            // Only author or admin can update
            if ((note as any).author_id !== userId && !isAdmin) {
                res.status(403).json({ error: 'You are not authorized to edit this note.' });
                return;
            }

            const { content, visibility } = req.body as { content?: string; visibility?: NoteVisibility };
            if (content !== undefined) (note as any).content = content;
            if (visibility !== undefined) (note as any).visibility = visibility;

            await note.save();
            res.status(200).json({ note });
        } catch (error) {
            console.error('[NoteController] updateNote failed:', error);
            res.status(500).json({ error: 'Failed to update note.' });
        }
    }

    // ─── DELETE ──────────────────────────────────────────────────────────────────

    static async deleteNote(req: Request, res: Response): Promise<void> {
        try {
            const { Note } = await NoteController.init(req);
            const { id } = req.params;
            const userId = req.headers['x-user-id'] as string;
            const userRole = (req.headers['x-user-role'] as string ?? '').toLowerCase();
            const isAdmin = ADMIN_ROLES.has(userRole);

            const note = await Note.findByPk(id);
            if (!note) {
                res.status(404).json({ error: 'Note not found.' });
                return;
            }

            // Only author or admin can delete
            if ((note as any).author_id !== userId && !isAdmin) {
                res.status(403).json({ error: 'You are not authorized to delete this note.' });
                return;
            }

            await note.destroy();
            res.status(200).json({ message: 'Note deleted successfully.' });
        } catch (error) {
            console.error('[NoteController] deleteNote failed:', error);
            res.status(500).json({ error: 'Failed to delete note.' });
        }
    }
}
