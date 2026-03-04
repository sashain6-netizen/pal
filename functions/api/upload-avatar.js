export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        // 1. Get the file from the request
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
        }

        // 2. Generate a unique filename to prevent overwrites
        const extension = file.type.split('/')[1] || 'jpg';
        const fileName = `avatars/${crypto.randomUUID()}.${extension}`;

        // 3. Upload to R2 Bucket (You must bind this as 'AVATAR_BUCKET' in dashboard)
        await env.AVATAR_BUCKET.put(fileName, file.stream(), {
            httpMetadata: { contentType: file.type },
        });

        // 4. Generate the Public URL 
        // Note: You must enable 'Public Access' or a 'Custom Domain' for your R2 bucket
        const publicUrl = `https://cdn.yourdomain.com/${fileName}`;

        return new Response(JSON.stringify({ url: publicUrl }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}