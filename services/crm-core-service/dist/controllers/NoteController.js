"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoteController = void 0;
const sequelize_1 = require("sequelize");
const TenantConnectionManager_1 = require("../config/TenantConnectionManager");
const Note_1 = require("../models/Note");
// Roles considered admin-level for ADMIN_ONLY visibility
const ADMIN_ROLES = new Set(['admin', 'super_admin', 'manager']);
class NoteController {
    static async init(req) {
        const tenantId = req.headers['x-tenant-id'];
        const userId = req.headers['x-user-id'] ?? 'system';
        const sequelize = await TenantConnectionManager_1.TenantConnectionManager.getConnection(tenantId);
        Note_1.Note.initModel(sequelize, tenantId, userId);
        return { Note: Note_1.Note };
    }
    // ─── CREATE ──────────────────────────────────────────────────────────────────
    static async createNote(req, res) {
        try {
            const { Note } = await NoteController.init(req);
            const { lead_id, content, visibility } = req.body;
            const author_id = req.headers['x-user-id'];
            if (!lead_id || !content) {
                res.status(400).json({ error: 'lead_id and content are required.' });
                return;
            }
            const note = await Note.create({
                lead_id,
                content,
                author_id,
                visibility: visibility ?? 'PUBLIC',
            });
            res.status(201).json({ note });
        }
        catch (error) {
            console.error('[NoteController] createNote failed:', error);
            res.status(500).json({ error: 'Failed to create note.' });
        }
    }
    // ─── LIST (visibility-filtered) ───────────────────────────────────────────
    static async getNotesByLead(req, res) {
        try {
            const { Note } = await NoteController.init(req);
            const { lead_id } = req.query;
            const userId = req.headers['x-user-id'];
            const userRole = (req.headers['x-user-role'] ?? '').toLowerCase();
            const isAdmin = ADMIN_ROLES.has(userRole);
            if (!lead_id) {
                res.status(400).json({ error: 'lead_id query parameter is required.' });
                return;
            }
            // Build visibility clause based on role:
            // - Admin: see PUBLIC + ADMIN_ONLY + their own PRIVATE
            // - Others: see PUBLIC + their own PRIVATE (never ADMIN_ONLY)
            const visibilityClause = isAdmin
                ? {
                    [sequelize_1.Op.or]: [
                        { visibility: 'PUBLIC' },
                        { visibility: 'ADMIN_ONLY' },
                        { visibility: 'PRIVATE', author_id: userId },
                    ],
                }
                : {
                    [sequelize_1.Op.or]: [
                        { visibility: 'PUBLIC' },
                        { visibility: 'PRIVATE', author_id: userId },
                    ],
                };
            const notes = await Note.findAll({
                where: { lead_id, ...visibilityClause },
                order: [['createdAt', 'DESC']],
            });
            res.status(200).json({ notes });
        }
        catch (error) {
            console.error('[NoteController] getNotesByLead failed:', error);
            res.status(500).json({ error: 'Failed to retrieve notes.' });
        }
    }
    // ─── UPDATE ──────────────────────────────────────────────────────────────────
    static async updateNote(req, res) {
        try {
            const { Note } = await NoteController.init(req);
            const { id } = req.params;
            const userId = req.headers['x-user-id'];
            const userRole = (req.headers['x-user-role'] ?? '').toLowerCase();
            const isAdmin = ADMIN_ROLES.has(userRole);
            const note = await Note.findByPk(id);
            if (!note) {
                res.status(404).json({ error: 'Note not found.' });
                return;
            }
            // Only author or admin can update
            if (note.author_id !== userId && !isAdmin) {
                res.status(403).json({ error: 'You are not authorized to edit this note.' });
                return;
            }
            const { content, visibility } = req.body;
            if (content !== undefined)
                note.content = content;
            if (visibility !== undefined)
                note.visibility = visibility;
            await note.save();
            res.status(200).json({ note });
        }
        catch (error) {
            console.error('[NoteController] updateNote failed:', error);
            res.status(500).json({ error: 'Failed to update note.' });
        }
    }
    // ─── DELETE ──────────────────────────────────────────────────────────────────
    static async deleteNote(req, res) {
        try {
            const { Note } = await NoteController.init(req);
            const { id } = req.params;
            const userId = req.headers['x-user-id'];
            const userRole = (req.headers['x-user-role'] ?? '').toLowerCase();
            const isAdmin = ADMIN_ROLES.has(userRole);
            const note = await Note.findByPk(id);
            if (!note) {
                res.status(404).json({ error: 'Note not found.' });
                return;
            }
            // Only author or admin can delete
            if (note.author_id !== userId && !isAdmin) {
                res.status(403).json({ error: 'You are not authorized to delete this note.' });
                return;
            }
            await note.destroy();
            res.status(200).json({ message: 'Note deleted successfully.' });
        }
        catch (error) {
            console.error('[NoteController] deleteNote failed:', error);
            res.status(500).json({ error: 'Failed to delete note.' });
        }
    }
}
exports.NoteController = NoteController;
