import { verifyAndDecodeToken } from './_jwt.js';

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        // 1. Get User from JWT
        const cookieHeader = request.headers.get("Cookie") || "";
        const cookies = {};
        cookieHeader.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (name && value) {
                cookies[name] = value;
            }
        });
        const token = cookies['pal_session'];
        if (!token) return new Response("Unauthorized", { status: 401 });

        const payload = await verifyAndDecodeToken(token, env.JWT_SECRET);
        const reporterUsername = payload.username.toLowerCase();

        // 2. Get Report Data from Request
        const { reportedUsername, reason, description } = await request.json();
        if (!reportedUsername || !reason) {
            return new Response(JSON.stringify({ error: "Reported username and reason are required" }), { status: 400 });
        }

        // 3. Validate input
        if (reporterUsername === reportedUsername.toLowerCase()) {
            return new Response(JSON.stringify({ error: "You cannot report yourself" }), { status: 400 });
        }

        const validReasons = ["spam", "harassment", "inappropriate_content", "fake_account", "other"];
        if (!validReasons.includes(reason)) {
            return new Response(JSON.stringify({ error: "Invalid reason" }), { status: 400 });
        }

        // 4. Check if both users exist
        const reporterData = await env.USERS_KV.get(`user:${reporterUsername}`);
        const reportedData = await env.USERS_KV.get(`user:${reportedUsername.toLowerCase()}`);
        
        if (!reporterData || !reportedData) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        // 5. Create report entry
        const report = {
            id: Date.now().toString(),
            reporterUsername,
            reportedUsername: reportedUsername.toLowerCase(),
            reason,
            description: description || "",
            timestamp: new Date().toISOString(),
            status: "pending"
        };

        // 6. Store report
        await env.USERS_KV.put(`report:${report.id}`, JSON.stringify(report));

        // 7. Add to reports list for easy retrieval
        const reportsList = await env.USERS_KV.get("reports_list");
        const reports = reportsList ? JSON.parse(reportsList) : [];
        reports.push(report.id);
        await env.USERS_KV.put("reports_list", JSON.stringify(reports));

        return new Response(JSON.stringify({ success: true, reportId: report.id }));

    } catch (e) {
        console.error("Report user error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}

export async function onRequestPut(context) {
    const { request, env } = context;

    try {
        // 1. Get User from JWT
        const cookieHeader = request.headers.get("Cookie") || "";
        const cookies = {};
        cookieHeader.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (name && value) {
                cookies[name] = value;
            }
        });
        const token = cookies['pal_session'];
        if (!token) return new Response("Unauthorized", { status: 401 });

        const payload = await verifyAndDecodeToken(token, env.JWT_SECRET);
        const username = payload.username.toLowerCase();
        
        console.log('JWT decoded:', { username, hasToken: !!token });

        // 2. Check if user is admin/staff
        const userData = await env.USERS_KV.get(`user:${username}`);
        const user = userData ? JSON.parse(userData) : {};
        
        console.log('Report access check (PUT):', { username, userRank: user.rank });
        
        const staffRoles = ["Owner", "Admin", "Manager", "Moderator"];
        if (!staffRoles.includes(user.rank)) {
            console.log('Access denied (PUT) - user rank:', user.rank, 'allowed roles:', staffRoles);
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
        }

        // 3. Get Report Data from Request
        const { reportId, status } = await request.json();
        if (!reportId || !status) {
            return new Response(JSON.stringify({ error: "Report ID and status are required" }), { status: 400 });
        }

        // 4. Check permissions - only owners can delete, others can only resolve
        if (status === "deleted") {
            if (user.rank !== "Owner") {
                return new Response(JSON.stringify({ error: "Only owners can delete reports" }), { status: 403 });
            }
        } else if (!["pending", "resolved"].includes(status)) {
            return new Response(JSON.stringify({ error: "Invalid status" }), { status: 400 });
        }

        // 5. Update report
        const reportData = await env.USERS_KV.get(`report:${reportId}`);
        if (!reportData) {
            return new Response(JSON.stringify({ error: "Report not found" }), { status: 404 });
        }

        const report = JSON.parse(reportData);
        report.status = status;
        report.resolvedBy = username;
        report.resolvedAt = new Date().toISOString();

        await env.USERS_KV.put(`report:${reportId}`, JSON.stringify(report));

        // 6. If deleted, remove from reports list
        if (status === "deleted") {
            const reportsList = await env.USERS_KV.get("reports_list");
            const reports = reportsList ? JSON.parse(reportsList) : [];
            const updatedReports = reports.filter(id => id !== reportId);
            await env.USERS_KV.put("reports_list", JSON.stringify(updatedReports));
        }

        return new Response(JSON.stringify({ success: true }));

    } catch (e) {
        console.error("Update report error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}

export async function onRequestGet(context) {
    const { request, env } = context;

    try {
        // 1. Get User from JWT
        const cookieHeader = request.headers.get("Cookie") || "";
        const cookies = {};
        cookieHeader.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (name && value) {
                cookies[name] = value;
            }
        });
        const token = cookies['pal_session'];
        if (!token) return new Response("Unauthorized", { status: 401 });

        const payload = await verifyAndDecodeToken(token, env.JWT_SECRET);
        const username = payload.username.toLowerCase();
        
        console.log('JWT decoded:', { username, hasToken: !!token });

        // 2. Check if user is admin/staff
        const userData = await env.USERS_KV.get(`user:${username}`);
        const user = userData ? JSON.parse(userData) : {};
        
        console.log('Report access check (GET):', { username, userRank: user.rank });
        
        const staffRoles = ["Owner", "Admin", "Manager", "Moderator"];
        if (!staffRoles.includes(user.rank)) {
            console.log('Access denied (GET) - user rank:', user.rank, 'allowed roles:', staffRoles);
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
        }

        // 3. Get all reports
        const reportsList = await env.USERS_KV.get("reports_list");
        const reportIds = reportsList ? JSON.parse(reportsList) : [];
        
        const reports = [];
        for (const reportId of reportIds) {
            const reportData = await env.USERS_KV.get(`report:${reportId}`);
            if (reportData) {
                reports.push(JSON.parse(reportData));
            }
        }

        return new Response(JSON.stringify({ reports }));

    } catch (e) {
        console.error("Get reports error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
