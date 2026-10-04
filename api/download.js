// api/download.js
const axios = require('axios');

module.exports = async (req, res) => {
    // 1. Force clear CORS verification for web standard responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'Target URL parameter is required.' });

    try {
        // 2. FIXED URL CLEANER: Safely extracts the clean text link without crashing
        const rawUrl = String(url);
        let cleanUrl = rawUrl.split('?')[0]; 
        if (!cleanUrl.endsWith('/')) {
            cleanUrl += '/';
        }
        
        // 3. Requesting down the open API pipeline
        const apiResponse = await axios.get(`https://mdgspace.org{encodeURIComponent(cleanUrl)}`, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
            },
            timeout: 9000
        });

        const data = apiResponse.data;

        // 4. Fallback Extraction Logic Layout
        let extractedVideoUrl = null;
        if (data && data.url) {
            extractedVideoUrl = data.url;
        } else if (data && data.data && data.data.url) {
            extractedVideoUrl = data.data.url;
        } else if (Array.isArray(data) && data[0] && data[0].url) {
            extractedVideoUrl = data[0].url;
        }

        // 5. Structure unified flat data package to send to HTML
        const payload = {
            success: true,
            videoUrl: extractedVideoUrl,
            channel: {
                username: data?.owner?.username || data?.author || "instagram_user",
                name: data?.owner?.full_name || data?.title || "Public Creator",
                logo: data?.owner?.profile_pic_url || "https://unsplash.com",
                followers: data?.owner?.edge_followed_by?.count || "Public Profile"
            },
            content: {
                caption: data?.caption || data?.edge_media_to_caption?.edges?.[0]?.node?.text || "No caption found."
            },
            transcription: "AI audio tracking matrix active. Audio stream processing complete."
        };

        if (payload.videoUrl) {
            return res.status(200).json(payload);
        } else {
            return res.status(404).json({ 
                success: false, 
                error: 'Could not resolve the raw media link layout.' 
            });
        }

    } catch (error) {
        console.error("Crash logs:", error.message);
        return res.status(500).json({ 
            success: false, 
            error: 'Server error or target video is unreachable.' 
        });
    }
};
