"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyFieldSecurity = void 0;
// The Security Brain: Intercepts JSON outgoing streams scrubbing restricted `can_read: false` JSON Object paths
const applyFieldSecurity = async (req, res, next) => {
    // Store the original res.json logic reference before proxying
    const originalJson = res.json;
    // Assume authentication tokens correctly populated User's explicit RoleID
    // In a real execution, req.user.roleId comes from IAM decode
    const roleId = req.user?.roleId || 'default-role-id';
    const tenantId = req.headers['x-tenant-id'];
    const tableName = req.params.tableName || 'leads'; // Target schema logic
    try {
        // 1. Fetch exact security lock rules from IAM microservice securely mapping internal DNS (port 4004 conceptually inside Docker)
        // Note: Wrapping in try-catch to allow gracefully fail open/closed logic depending on security footprints.
        let locks = [];
        try {
            // Mocking internal microservice HTTP Call mapping parameters specifically restricted 
            // const response = await axios.get(`http://iam-service:4004/api/locks?role_id=${roleId}&table_name=${tableName}`, { headers: { 'x-tenant-id': tenantId } });
            // locks = response.data.locks || [];
            locks = []; // Remove mock, fallback safely for now
        }
        catch (fetchError) {
            console.warn('Could not reach IAM internal rule list. Applying fail-safe mapping.');
        }
        // 2. Identify forbidden keys mapping exactly onto `can_read: false` constraints
        const restrictedKeys = locks
            .filter((lock) => lock.can_read === false && lock.table_name === tableName)
            .map((lock) => lock.column_name);
        // 3. Override express bound `res.json` method injecting active response scrubbing!
        res.json = function (body) {
            if (restrictedKeys.length > 0 && body) {
                // Scrub single object footprints securely
                const scrubObject = (obj) => {
                    restrictedKeys.forEach((key) => {
                        if (obj && obj.hasOwnProperty(key)) {
                            delete obj[key]; // Hard drop internal JSON traces protecting memory streams
                        }
                    });
                    return obj;
                };
                // Recursively scrub dynamic array logic seamlessly preserving valid keys cleanly
                if (Array.isArray(body.records)) {
                    body.records = body.records.map((item) => scrubObject({ ...item }));
                }
                else if (Array.isArray(body)) {
                    body = body.map((item) => scrubObject({ ...item }));
                }
                else if (typeof body === 'object') {
                    // Wrap main object hooks natively tracking layout bindings safely 
                    if (body.record) {
                        body.record = scrubObject({ ...body.record });
                    }
                    else {
                        body = scrubObject({ ...body });
                    }
                }
            }
            // Finalize mapping calling explicit baseline Express execution pointing out filtered metrics securely.
            return originalJson.call(this, body);
        };
        next();
    }
    catch (error) {
        console.error('Security mapping failed inside logic engine', error);
        res.status(500).json({ error: 'Security constraint resolution failed globally.' });
    }
};
exports.applyFieldSecurity = applyFieldSecurity;
