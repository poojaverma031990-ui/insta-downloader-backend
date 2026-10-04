const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'Instagram URL is required' });

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        const $ = cheerio.load(response.data);
        let videoUrl = $('meta[property="og:video"]').attr('content') || 
                       $('meta[property="og:video:secure_url"]').attr('content') ||
                       $('video').attr('src');

        if (videoUrl) {
            return res.status(200).json({ videoUrl });
        } else {
            return res.status(404).json({ error: 'Could not extract raw video URL. Is it a private post?' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Failed to access Instagram page layout.' });
    }
};
