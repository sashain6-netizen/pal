import { verifyAndDecodeToken } from './_jwt.js';

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

        const userData = await env.USERS_KV.get(`user:${username}`);
        const user = userData ? JSON.parse(userData) : {};

        const staffRoles = ["Owner", "Admin", "Manager", "Moderator"];
        if (!staffRoles.includes(user.rank)) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
        }

        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const realtimeStats = {
            timestamp: now.toISOString(),
            online: {},
            activity: {},
            performance: {},
            health: {}
        };

        try {
            const allUsersIndex = await env.USERS_KV.get("all_users_index", { cacheTtl: 3600 });
            const allUsers = allUsersIndex ? JSON.parse(allUsersIndex) : [];

            const recentlyActive = new Set();

            const { results: recentThreads } = await env.DB.prepare(
                "SELECT creator_username FROM threads WHERE created_at >= ?"
            ).bind(oneHourAgo.toISOString()).all();

            recentThreads.forEach(thread => {
                recentlyActive.add(thread.creator_username.toLowerCase());
            });

            const { results: recentPosts } = await env.DB.prepare(
                "SELECT username FROM thread_posts WHERE created_at >= ?"
            ).bind(oneHourAgo.toISOString()).all();

            recentPosts.forEach(post => {
                recentlyActive.add(post.username.toLowerCase());
            });

            const { results: recentMessages } = await env.DB.prepare(
                "SELECT username FROM chat_messages WHERE created_at >= ?"
            ).bind(oneHourAgo.toISOString()).all();

            recentMessages.forEach(message => {
                recentlyActive.add(message.username.toLowerCase());
            });

            realtimeStats.online.currentUsers = recentlyActive.size;
            realtimeStats.online.totalUsers = allUsers.length;
            realtimeStats.online.percentage = allUsers.length > 0 ?
                Math.round((recentlyActive.size / allUsers.length) * 100) : 0;

        } catch (error) {
            console.error('Online users error:', error);
            realtimeStats.online.error = error.message;
        }

        try {
            const { results: threadsLastHour } = await env.DB.prepare(
                "SELECT COUNT(*) as count FROM threads WHERE created_at >= ?"
            ).bind(oneHourAgo.toISOString()).all();

            const { results: postsLastHour } = await env.DB.prepare(
                "SELECT COUNT(*) as count FROM thread_posts WHERE created_at >= ?"
            ).bind(oneHourAgo.toISOString()).all();

            const { results: messagesLastHour } = await env.DB.prepare(
                "SELECT COUNT(*) as count FROM chat_messages WHERE created_at >= ?"
            ).bind(oneHourAgo.toISOString()).all();

            realtimeStats.activity.threadsLastHour = threadsLastHour[0]?.count || 0;
            realtimeStats.activity.postsLastHour = postsLastHour[0]?.count || 0;
            realtimeStats.activity.messagesLastHour = messagesLastHour[0]?.count || 0;

            const reportsList = await env.USERS_KV.get("reports_list");
            const reportIds = reportsList ? JSON.parse(reportsList) : [];

            let reportsLastHour = 0;
            for (const reportId of reportIds) {
                const reportData = await env.USERS_KV.get(`report:${reportId}`);
                if (reportData) {
                    const report = JSON.parse(reportData);
                    if (new Date(report.timestamp) >= oneHourAgo) {
                        reportsLastHour++;
                    }
                }
            }
            realtimeStats.activity.reportsLastHour = reportsLastHour;

            const { results: threadsLastDay } = await env.DB.prepare(
                "SELECT COUNT(*) as count FROM threads WHERE created_at >= ?"
            ).bind(oneDayAgo.toISOString()).all();

            const { results: postsLastDay } = await env.DB.prepare(
                "SELECT COUNT(*) as count FROM thread_posts WHERE created_at >= ?"
            ).bind(oneDayAgo.toISOString()).all();

            const { results: messagesLastDay } = await env.DB.prepare(
                "SELECT COUNT(*) as count FROM chat_messages WHERE created_at >= ?"
            ).bind(oneDayAgo.toISOString()).all();

            realtimeStats.activity.threadsLastDay = threadsLastDay[0]?.count || 0;
            realtimeStats.activity.postsLastDay = postsLastDay[0]?.count || 0;
            realtimeStats.activity.messagesLastDay = messagesLastDay[0]?.count || 0;

        } catch (error) {
            console.error('Activity stats error:', error);
            realtimeStats.activity.error = error.message;
        }

        try {
            const dbStartTime = performance.now();
            await env.DB.prepare("SELECT 1").first();
            const dbResponseTime = Math.round(performance.now() - dbStartTime);

            const kvStartTime = performance.now();
            await env.USERS_KV.get("all_users_index");
            const kvResponseTime = Math.round(performance.now() - kvStartTime);

            realtimeStats.performance.dbResponseTime = dbResponseTime;
            realtimeStats.performance.kvResponseTime = kvResponseTime;
            realtimeStats.performance.overallHealth =
                (dbResponseTime < 100 && kvResponseTime < 50) ? 'Good' : 'Degraded';

        } catch (error) {
            console.error('Performance stats error:', error);
            realtimeStats.performance.error = error.message;
            realtimeStats.performance.overallHealth = 'Poor';
        }

        try {
            const healthChecks = {
                database: false,
                kvStorage: false,
                userIndex: false,
                premiumSystem: false,
                reportSystem: false,
                forumSystem: false,
                chatSystem: false,
                newsSystem: false
            };

            try {
                await env.DB.prepare("SELECT 1").first();
                healthChecks.database = true;
            } catch (e) {
                healthChecks.database = false;
            }

            try {
                await env.USERS_KV.get("all_users_index");
                healthChecks.kvStorage = true;
            } catch (e) {
                healthChecks.kvStorage = false;
            }

            try {
                const userIndex = await env.USERS_KV.get("all_users_index");
                healthChecks.userIndex = !!(userIndex && JSON.parse(userIndex).length > 0);
            } catch (e) {
                healthChecks.userIndex = false;
            }

            try {
                const premiumData = await env.USERS_KV.get("pal_premium");
                healthChecks.premiumSystem = !!premiumData;
            } catch (e) {
                healthChecks.premiumSystem = false;
            }

            try {
                const reportsList = await env.USERS_KV.get("reports_list");
                healthChecks.reportSystem = !!reportsList;
            } catch (e) {
                healthChecks.reportSystem = false;
            }

            try {
                await env.DB.prepare("SELECT COUNT(*) as count FROM threads LIMIT 1").first();
                healthChecks.forumSystem = true;
            } catch (e) {
                healthChecks.forumSystem = false;
            }

            try {
                await env.DB.prepare("SELECT COUNT(*) as count FROM chat_rooms LIMIT 1").first();
                healthChecks.chatSystem = true;
            } catch (e) {
                healthChecks.chatSystem = false;
            }

            try {
                await env.DB.prepare("SELECT COUNT(*) as count FROM news_articles LIMIT 1").first();
                healthChecks.newsSystem = true;
            } catch (e) {
                healthChecks.newsSystem = false;
            }

            const passedChecks = Object.values(healthChecks).filter(check => check === true).length;
            const totalChecks = Object.keys(healthChecks).length;

            realtimeStats.health.checks = healthChecks;
            realtimeStats.health.overallScore = Math.round((passedChecks / totalChecks) * 100);
            realtimeStats.health.status = realtimeStats.health.overallScore >= 90 ? 'Excellent' :
                                        realtimeStats.health.overallScore >= 75 ? 'Good' :
                                        realtimeStats.health.overallScore >= 50 ? 'Fair' : 'Poor';

        } catch (error) {
            console.error('Health check error:', error);
            realtimeStats.health.error = error.message;
        }

        return new Response(JSON.stringify(realtimeStats), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        console.error("Realtime stats error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
