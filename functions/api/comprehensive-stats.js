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

        const stats = {
            users: {},
            forum: {},
            chats: {},
            reports: {},
            news: {},
            bans: {},
            system: {},
            premium: {},
            activity: {}
        };

        const allUsersIndex = await env.USERS_KV.get("all_users_index", { cacheTtl: 3600 });
        const allUsers = allUsersIndex ? JSON.parse(allUsersIndex) : [];
        stats.users.total = allUsers.length;

        const rankCounts = {};
        let activeUsers = new Set();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        for (const username of allUsers) {
            const userData = await env.USERS_KV.get(`user:${username.toLowerCase()}`);
            if (userData) {
                const user = JSON.parse(userData);
                const rank = user.rank || 'Member';
                rankCounts[rank] = (rankCounts[rank] || 0) + 1;

                if (user.lastActivity && new Date(user.lastActivity) >= oneWeekAgo) {
                    activeUsers.add(username);
                }
            }
        }
        stats.users.byRank = rankCounts;
        stats.users.activeLastWeek = activeUsers.size;

        const premiumData = await env.USERS_KV.get("pal_premium", { cacheTtl: 3600 });
        const premiumUsers = premiumData ? JSON.parse(premiumData) : [];
        stats.premium.total = premiumUsers.length;
        stats.premium.percentage = stats.users.total > 0 ? Math.round((premiumUsers.length / stats.users.total) * 100) : 0;

        try {
            const { results: threads } = await env.DB.prepare("SELECT COUNT(*) as count FROM threads").all();
            stats.forum.totalThreads = threads[0]?.count || 0;

            const { results: posts } = await env.DB.prepare("SELECT COUNT(*) as count FROM thread_posts").all();
            stats.forum.totalPosts = posts[0]?.count || 0;

            const { results: recentThreads } = await env.DB.prepare(
                "SELECT COUNT(*) as count FROM threads WHERE created_at >= ?"
            ).bind(oneWeekAgo.toISOString()).all();
            stats.forum.threadsThisWeek = recentThreads[0]?.count || 0;

            const { results: recentPosts } = await env.DB.prepare(
                "SELECT COUNT(*) as count FROM thread_posts WHERE created_at >= ?"
            ).bind(oneWeekAgo.toISOString()).all();
            stats.forum.postsThisWeek = recentPosts[0]?.count || 0;

            const { results: activeThreads } = await env.DB.prepare(`
                SELECT t.id, t.title, COUNT(tp.id) as post_count
                FROM threads t
                LEFT JOIN thread_posts tp ON t.id = tp.thread_id
                GROUP BY t.id, t.title
                ORDER BY post_count DESC
                LIMIT 10
            `).all();
            stats.forum.mostActiveThreads = activeThreads;

        } catch (error) {
            console.error('Forum stats error:', error);
            stats.forum.error = error.message;
        }

        try {
            const { results: chatRooms } = await env.DB.prepare("SELECT COUNT(*) as count FROM chat_rooms").all();
            stats.chats.totalRooms = chatRooms[0]?.count || 0;

            const { results: chatMessages } = await env.DB.prepare("SELECT COUNT(*) as count FROM chat_messages").all();
            stats.chats.totalMessages = chatMessages[0]?.count || 0;

            const { results: recentMessages } = await env.DB.prepare(
                "SELECT COUNT(*) as count FROM chat_messages WHERE created_at >= ?"
            ).bind(oneWeekAgo.toISOString()).all();
            stats.chats.messagesThisWeek = recentMessages[0]?.count || 0;

            const { results: activeRooms } = await env.DB.prepare(`
                SELECT r.id, r.room_name, COUNT(cm.id) as message_count
                FROM chat_rooms r
                LEFT JOIN chat_messages cm ON r.id = cm.room_id
                GROUP BY r.id, r.room_name
                ORDER BY message_count DESC
                LIMIT 10
            `).all();
            stats.chats.mostActiveRooms = activeRooms;

        } catch (error) {
            console.error('Chat stats error:', error);
            stats.chats.error = error.message;
        }

        try {
            const reportsList = await env.USERS_KV.get("reports_list");
            const reportIds = reportsList ? JSON.parse(reportsList) : [];

            stats.reports.total = reportIds.length;
            stats.reports.pending = 0;
            stats.reports.resolved = 0;
            stats.reports.byReason = {};

            for (const reportId of reportIds) {
                const reportData = await env.USERS_KV.get(`report:${reportId}`);
                if (reportData) {
                    const report = JSON.parse(reportData);
                    if (report.status === 'pending') {
                        stats.reports.pending++;
                    } else if (report.status === 'resolved') {
                        stats.reports.resolved++;
                    }

                    const reason = report.reason || 'other';
                    stats.reports.byReason[reason] = (stats.reports.byReason[reason] || 0) + 1;
                }
            }

            const reportsThisWeek = [];
            for (const reportId of reportIds) {
                const reportData = await env.USERS_KV.get(`report:${reportId}`);
                if (reportData) {
                    const report = JSON.parse(reportData);
                    if (new Date(report.timestamp) >= oneWeekAgo) {
                        reportsThisWeek.push(report);
                    }
                }
            }
            stats.reports.thisWeek = reportsThisWeek.length;

        } catch (error) {
            console.error('Reports stats error:', error);
            stats.reports.error = error.message;
        }

        try {
            const { results: totalArticles } = await env.DB.prepare("SELECT COUNT(*) as count FROM news_articles").all();
            stats.news.totalArticles = totalArticles[0]?.count || 0;

            const { results: publishedArticles } = await env.DB.prepare(
                "SELECT COUNT(*) as count FROM news_articles WHERE is_published = 1"
            ).all();
            stats.news.publishedArticles = publishedArticles[0]?.count || 0;

            const { results: recentArticles } = await env.DB.prepare(
                "SELECT COUNT(*) as count FROM news_articles WHERE created_at >= ?"
            ).bind(oneWeekAgo.toISOString()).all();
            stats.news.articlesThisWeek = recentArticles[0]?.count || 0;

            const { results: articlesByCategory } = await env.DB.prepare(`
                SELECT category, COUNT(*) as count
                FROM news_articles
                WHERE is_published = 1
                GROUP BY category
            `).all();
            stats.news.byCategory = articlesByCategory;

        } catch (error) {
            console.error('News stats error:', error);
            stats.news.error = error.message;
        }

        try {
            const bannedUsers = [];
            for (const username of allUsers) {
                const userData = await env.USERS_KV.get(`user:${username.toLowerCase()}`);
                if (userData) {
                    const user = JSON.parse(userData);
                    if (user.isBanned === true) {
                        bannedUsers.push({
                            username,
                            banReason: user.banReason || 'No reason',
                            banDate: user.banDate,
                            banStatus: user.banExpiration ? 'Temporary' : 'Permanent'
                        });
                    }
                }
            }

            stats.bans.total = bannedUsers.length;
            stats.bans.permanent = bannedUsers.filter(b => b.banStatus === 'Permanent').length;
            stats.bans.temporary = bannedUsers.filter(b => b.banStatus === 'Temporary').length;

            const bansThisWeek = bannedUsers.filter(b =>
                b.banDate && new Date(b.banDate) >= oneWeekAgo
            ).length;
            stats.bans.thisWeek = bansThisWeek;

            const bansByReason = {};
            bannedUsers.forEach(ban => {
                const reason = ban.banReason || 'No reason';
                bansByReason[reason] = (bansByReason[reason] || 0) + 1;
            });
            stats.bans.byReason = bansByReason;

        } catch (error) {
            console.error('Ban stats error:', error);
            stats.bans.error = error.message;
        }

        try {
            const kvKeys = [
                "all_users_index",
                "pal_premium",
                "reports_list"
            ];

            let totalKVSize = 0;
            for (const key of kvKeys) {
                const data = await env.USERS_KV.get(key);
                if (data) {
                    totalKVSize += data.length;
                }
            }
            stats.system.kvStorageEstimate = Math.round(totalKVSize / 1024);

            const tables = [
                'threads', 'thread_posts', 'thread_bumps', 'pinned_threads',
                'last_read', 'chat_rooms', 'chat_members', 'chat_messages',
                'news_articles'
            ];

            stats.system.databaseTables = {};
            for (const table of tables) {
                try {
                    const { results } = await env.DB.prepare(`SELECT COUNT(*) as count FROM ${table}`).all();
                    stats.system.databaseTables[table] = results[0]?.count || 0;
                } catch (e) {
                    stats.system.databaseTables[table] = 'Error';
                }
            }

        } catch (error) {
            console.error('System stats error:', error);
            stats.system.error = error.message;
        }

        try {
            const activityData = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];

                activityData.push({
                    date: dateStr,
                    dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    threads: 0,
                    posts: 0,
                    messages: 0,
                    reports: 0
                });
            }

            const { results: threadActivity } = await env.DB.prepare(`
                SELECT DATE(created_at) as date, COUNT(*) as count
                FROM threads
                WHERE created_at >= ?
                GROUP BY DATE(created_at)
            `).bind(oneWeekAgo.toISOString()).all();

            threadActivity.forEach(item => {
                const dayData = activityData.find(d => d.date === item.date);
                if (dayData) dayData.threads = item.count;
            });

            const { results: postActivity } = await env.DB.prepare(`
                SELECT DATE(created_at) as date, COUNT(*) as count
                FROM thread_posts
                WHERE created_at >= ?
                GROUP BY DATE(created_at)
            `).bind(oneWeekAgo.toISOString()).all();

            postActivity.forEach(item => {
                const dayData = activityData.find(d => d.date === item.date);
                if (dayData) dayData.posts = item.count;
            });

            const { results: messageActivity } = await env.DB.prepare(`
                SELECT DATE(created_at) as date, COUNT(*) as count
                FROM chat_messages
                WHERE created_at >= ?
                GROUP BY DATE(created_at)
            `).bind(oneWeekAgo.toISOString()).all();

            messageActivity.forEach(item => {
                const dayData = activityData.find(d => d.date === item.date);
                if (dayData) dayData.messages = item.count;
            });

            const reportsList = await env.USERS_KV.get("reports_list");
            const reportIds = reportsList ? JSON.parse(reportsList) : [];

            for (const reportId of reportIds) {
                const reportData = await env.USERS_KV.get(`report:${reportId}`);
                if (reportData) {
                    const report = JSON.parse(reportData);
                    const reportDate = new Date(report.timestamp).toISOString().split('T')[0];
                    const dayData = activityData.find(d => d.date === reportDate);
                    if (dayData) dayData.reports++;
                }
            }

            stats.activity.last7Days = activityData;

        } catch (error) {
            console.error('Activity stats error:', error);
            stats.activity.error = error.message;
        }

        stats.generatedAt = new Date().toISOString();

        return new Response(JSON.stringify(stats), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        console.error("Comprehensive stats error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
