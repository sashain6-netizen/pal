import { verifyAndDecodeToken } from "./_jwt.js";

export async function onRequestGet(context) {
    const { request, env } = context;
    
    const cookieHeader = request.headers.get("Cookie") || "";
    const token = cookieHeader
        .split('; ')
        .find(row => row.trim().startsWith('pal_session='))
        ?.split('=')[1];

    if (!token) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { 
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        const payload = await verifyAndDecodeToken(token, env.JWT_SECRET, env); 
        const username = payload.username;

        const rawUserData = await env.USERS_KV.get(`user:${username}`);
        if (!rawUserData) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        const user = JSON.parse(rawUserData);

        // CHECK IF USER IS BANNED
        if (user.isBanned === true) {
          // Check if ban has expired
          if (user.banExpiration) {
            const expirationTime = new Date(user.banExpiration).getTime();
            if (expirationTime > Date.now()) {
              // Ban is still active - kick user out
              return new Response(JSON.stringify({ 
                error: "Account banned",
                reason: user.banReason || "No reason provided",
                expires: user.banExpiration,
                kicked: true
              }), { 
                status: 403,
                headers: { 
                  "Content-Type": "application/json",
                  "Set-Cookie": "pal_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0" // Clear session
                }
              });
            } else {
              // Ban has expired, reactivate account
              user.isBanned = false;
              delete user.banReason;
              delete user.banExpiration;
              await env.USERS_KV.put(`user:${username}`, JSON.stringify(user));
            }
          } else {
            // Permanent ban - kick user out
            return new Response(JSON.stringify({ 
              error: "Account permanently banned",
              reason: user.banReason || "No reason provided",
              kicked: true
            }), { 
              status: 403,
              headers: { 
                "Content-Type": "application/json",
                "Set-Cookie": "pal_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0" // Clear session
              }
            });
          }
        }

        const rawPremiumData = await env.USERS_KV.get("pal_premium");
        let isPremiumUser = false;

        if (rawPremiumData) {
            const premiumList = JSON.parse(rawPremiumData);
            
            if (Array.isArray(premiumList)) {
                isPremiumUser = premiumList.includes(username);
            } 
            else {
                isPremiumUser = !!premiumList[username];
            }
        }

        // 3. XP Ladder Logic (Standard)
        const ladder = [
            { name: "Legend", xp: 30000 }, { name: "Elite", xp: 15000 },
            { name: "Veteran", xp: 7500 }, { name: "Contributor", xp: 3500 },
            { name: "Supporter", xp: 1500 }, { name: "Active Member", xp: 500 },
            { name: "Member", xp: 0 }
        ];

        const xpRank = ladder.find(r => (user.xp || 0) >= r.xp)?.name || "Member";
        const staffRanks = ["Admin", "Manager", "Moderator", "Staff", "Owner", "Bot"];
        let updated = false;

        if (!staffRanks.includes(user.rank)) {
            if (user.rank !== xpRank) {
                user.rank = xpRank;
                updated = true;
                if (!user.notifications) user.notifications = [];
                user.notifications.push({
                    id: Date.now(),
                    text: `Rank updated to ${xpRank}!`,
                    date: new Date().toISOString(),
                    read: false
                });
            }
        }

        if (updated) {
            await env.USERS_KV.put(`user:${username}`, JSON.stringify(user));
        }

        const profileData = {
            username: user.username,
            displayName: user.displayName || user.username,
            bio: user.bio || "",
            rank: user.rank || "Member",
            isPremium: isPremiumUser, 
            avatar: user.avatarUrl || "/default-avatar.png",
            following: user.following || [],
            xp: user.xp || 0,
            followersCount: user.followersCount ?? (typeof user.followers === "number" ? user.followers : 0),
            followingCount: user.followingCount ?? (Array.isArray(user.following) ? user.following.length : 0),
            currency: user.currency || 0,
            themeColor: user.themeColor || "#2563eb",
            forumColor: user.forumColor || user.themeColor || "#2563eb",
            premiumGlowAlpha: typeof user.premiumGlowAlpha === "number" ? user.premiumGlowAlpha : 0.8
        };

        return new Response(JSON.stringify(profileData), {
            headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
        });

    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: "Server Error" }), { status: 500 });
    }
}