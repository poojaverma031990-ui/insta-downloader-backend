// api/download.js
const axios = require('axios');

module.exports = async (req, res) => {
    // 1. Set global header layouts for CORS validation
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'Instagram URL is required' });

    try {
        // 2. Clean up incoming links to isolate the structural shortcode target
        let cleanUrl = url.split('?')[0];
        if (!cleanUrl.endsWith('/')) cleanUrl += '/';
        
        // 3. Requesting via the API distribution layout format
        const targetApiUrl = `${cleanUrl}?__a=1&__d=dis`;
        
        const response = await axios.get(targetApiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin'
            }
        });

        // 4. Drill through nested object matrices down to the watermark-free video file stream
        const items = response.data?.items || response.data?.graphql?.shortcode_media;
        let videoUrl = null;

        if (Array.isArray(items) && items.length > 0) {
            const media = items[0];
            if (media.video_versions && media.video_versions.length > 0) {
                // Returns highest resolution structural index matching the frame aspect
                videoUrl = media.video_versions[0].url; 
            } else if (media.carousel_media) {
                // Fallback structure array layout if post has multiple items inside a slide gallery
                const firstVideo = media.carousel_media.find(m => m.video_versions);
                if (firstVideo) videoUrl = firstVideo.video_versions[0].url;
            }
        } else if (items && items.video_url) {
            videoUrl = items.video_url;
        }

        if (videoUrl) {
            return res.status(200).json({ videoUrl });
        } else {
            return res.status(404).json({ error: 'Failed to extract raw streaming URL. Verify the post is public.' });
        }
    } catch (error) {
        console.error("Scraping error block logs: ", error.message);
        return res.status(500).json({ error: 'Instagram block detected. Try extracting another public post link.' });
    }
};
