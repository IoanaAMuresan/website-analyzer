export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { url } = req.body;
        
        // Simple test response
        res.json({
            url: url,
            improvements: [
                {
                    category: 'Test Results',
                    icon: '✅',
                    priority: 'high',
                    items: [
                        { text: 'API is working! This is a test response.', source: 'API Test' },
                        { text: 'Your backend is successfully deployed on Vercel', source: 'Deployment Test' }
                    ]
                }
            ]
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Analysis failed' });
    }
}
