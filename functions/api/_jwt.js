const encoder = new TextEncoder();

function base64UrlEncode(buffer) {
    if (typeof buffer === 'string') buffer = encoder.encode(buffer);
    const binString = Array.from(new Uint8Array(buffer), (byte) => String.fromCharCode(byte)).join("");
    return btoa(binString)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
}

function base64UrlDecode(str) {
    str = str.replace(/-/g, "+").replace(/_/g, "/");
    while (str.length % 4) str += "=";
    const binString = atob(str);
    return new Uint8Array(Array.from(binString, (char) => char.charCodeAt(0)));
}

export async function createToken(username, secret) {
    const header = JSON.stringify({ alg: "HS256", typ: "JWT" });
    const payload = JSON.stringify({
        username,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
    });

    const encodedHeader = base64UrlEncode(header);
    const encodedPayload = base64UrlEncode(payload);
    const data = `${encodedHeader}.${encodedPayload}`;

    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
    const encodedSignature = base64UrlEncode(signature);

    return `${data}.${encodedSignature}`;
}

export async function verifyAndDecodeToken(token, secret, env = null) {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Invalid Token Format");

        const [headerB64, payloadB64, signatureB64] = parts;
    const data = `${headerB64}.${payloadB64}`;

        const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
    );

    const signature = base64UrlDecode(signatureB64);
    const isValid = await crypto.subtle.verify(
        "HMAC",
        key,
        signature,
        encoder.encode(data)
    );

    if (!isValid) throw new Error("Invalid Token Signature");

    try {
        const decodedPayload = new TextDecoder().decode(base64UrlDecode(payloadB64));
        const payload = JSON.parse(decodedPayload);

                if (payload.exp && Date.now() / 1000 > payload.exp) {
            throw new Error("Token Expired");
        }

        if (env && payload.username) {
            const userData = await env.USERS_KV.get(`user:${payload.username.toLowerCase()}`);
            if (userData) {
                const user = JSON.parse(userData);

                if (user.isBanned === true) {
                    if (user.banExpiration) {
                        const expirationTime = new Date(user.banExpiration).getTime();
                        if (Date.now() < expirationTime) {
                            throw new Error("Account Banned");
                        } else {
                            user.isBanned = false;
                            delete user.banReason;
                            delete user.banExpiration;
                            await env.USERS_KV.put(`user:${payload.username.toLowerCase()}`, JSON.stringify(user));

                            const userBans = await env.USERS_KV.get(`bans:${payload.username.toLowerCase()}`);
                            if (userBans) {
                                const bans = JSON.parse(userBans);
                                for (const banId of bans) {
                                    await env.USERS_KV.delete(`ban:${banId}`);

                                    const bansList = await env.USERS_KV.get("bans_list");
                                    if (bansList) {
                                        const allBans = JSON.parse(bansList);
                                        const updatedBansList = allBans.filter(id => id !== banId);
                                        await env.USERS_KV.put("bans_list", JSON.stringify(updatedBansList));
                                    }
                                }
                                await env.USERS_KV.delete(`bans:${payload.username.toLowerCase()}`);
                            }
                        }
                    } else {
                        throw new Error("Account Banned");
                    }
                }
            }
        }

                return payload;
    } catch (e) {
        if (e.message === "Account Banned") {
            throw e;
        }
        throw new Error("Malformed Token Payload");
    }
}

export const parseToken = verifyAndDecodeToken;
