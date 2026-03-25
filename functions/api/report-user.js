import { verifyAndDecodeToken } from './_jwt.js';

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
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

        const payload = await verifyAndDecodeToken(token, env.JWT_SECRET, env);
        const reporterUsername = payload.username.toLowerCase();

        const { reportedUsername, reason, description } = await request.json();
        if (!reportedUsername || !reason) {
            return new Response(JSON.stringify({ error: "Reported username and reason are required" }), { status: 400 });
        }

        if (reporterUsername === reportedUsername.toLowerCase()) {
            return new Response(JSON.stringify({ error: "You cannot report yourself" }), { status: 400 });
        }

        const validReasons = ["spam", "harassment", "inappropriate_content", "fake_account", "other"];
        if (!validReasons.includes(reason)) {
            return new Response(JSON.stringify({ error: "Invalid reason" }), { status: 400 });
        }

        const reporterData = await env.USERS_KV.get(`user:${reporterUsername}`);
        const reportedData = await env.USERS_KV.get(`user:${reportedUsername.toLowerCase()}`);

                if (!reporterData || !reportedData) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        const report = {
            id: Date.now().toString(),
            reporterUsername,
            reportedUsername: reportedUsername.toLowerCase(),
            reason,
            description: description || "",
            timestamp: new Date().toISOString(),
            status: "pending"
        };

        await env.USERS_KV.put(`report:${report.id}`, JSON.stringify(report));

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

        const payload = await verifyAndDecodeToken(token, env.JWT_SECRET, env);
        const username = payload.username.toLowerCase();

                console.log('JWT decoded:', { username, hasToken: !!token });

        const userData = await env.USERS_KV.get(`user:${username}`);
        const user = userData ? JSON.parse(userData) : {};

                console.log('Report access check (PUT):', { username, userRank: user.rank });

                const staffRoles = ["Owner", "Admin", "Manager", "Moderator"];
        if (!staffRoles.includes(user.rank)) {
            console.log('Access denied (PUT) - user rank:', user.rank, 'allowed roles:', staffRoles);
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
        }

        const { reportId, status } = await request.json();
        if (!reportId || !status) {
            return new Response(JSON.stringify({ error: "Report ID and status are required" }), { status: 400 });
        }

        if (status === "deleted") {
            if (user.rank !== "Owner") {
                return new Response(JSON.stringify({ error: "Only owners can delete reports" }), { status: 403 });
            }
        } else if (!["pending", "resolved"].includes(status)) {
            return new Response(JSON.stringify({ error: "Invalid status" }), { status: 400 });
        }

        const reportData = await env.USERS_KV.get(`report:${reportId}`);
        if (!reportData) {
            return new Response(JSON.stringify({ error: "Report not found" }), { status: 404 });
        }

        const report = JSON.parse(reportData);
        report.status = status;
        report.resolvedBy = username;
        report.resolvedAt = new Date().toISOString();

        await env.USERS_KV.put(`report:${reportId}`, JSON.stringify(report));

        if (status === "deleted") {
            const reportsList = await env.USERS_KV.get("reports_list");
            const reports = reportsList ? JSON.parse(reportsList) : [];
            const updatedReports = reports.filter(id => id !== reportId);
            await env.USERS_KV.put("reports_list", JSON.stringify(updatedReports));

            await env.USERS_KV.delete(`report:${reportId}`);
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

        const payload = await verifyAndDecodeToken(token, env.JWT_SECRET, env);
        const username = payload.username.toLowerCase();

                console.log('JWT decoded:', { username, hasToken: !!token });

        const userData = await env.USERS_KV.get(`user:${username}`);
        const user = userData ? JSON.parse(userData) : {};

                console.log('Report access check (GET):', { username, userRank: user.rank });

                const staffRoles = ["Owner", "Admin", "Manager", "Moderator"];
        if (!staffRoles.includes(user.rank)) {
            console.log('Access denied (GET) - user rank:', user.rank, 'allowed roles:', staffRoles);
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
        }

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
