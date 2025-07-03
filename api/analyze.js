// Vercel serverless function - simplified version that works
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
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Ensure URL has protocol
        let targetUrl = url;
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = 'https://' + targetUrl;
        }

        console.log('Analyzing:', targetUrl);
        
        // Use built-in fetch instead of axios to avoid dependency issues
        const startTime = Date.now();
        
        try {
            const response = await fetch(targetUrl, {
                method: 'GET',
                headers: {
                    'User-Agent': 'WordPress.com Website Analyzer Bot'
                },
                // Add timeout
                signal: AbortSignal.timeout(10000)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const html = await response.text();
            const loadTime = Date.now() - startTime;
            
            // Simple HTML analysis without cheerio - using basic string methods
            const results = analyzeHTML(html, targetUrl, loadTime);
            
            res.json({
                url: targetUrl,
                improvements: results
            });
            
        } catch (fetchError) {
            console.error('Fetch error:', fetchError.message);
            
            // Return fallback analysis
            const fallbackResults = [
                {
                    category: 'Site Access',
                    icon: '⚠️',
                    priority: 'high',
                    items: [
                        { text: 'Unable to fully analyze site - may have access restrictions', source: 'Connection analysis' },
                        { text: 'Ensure site is publicly accessible and not blocking automated requests', source: 'Accessibility check' }
                    ]
                },
                {
                    category: 'WordPress.com Recommendations',
                    icon: '⚡',
                    priority: 'high',
                    items: [
                        { text: 'Consider WordPress.com hosting for reliable performance and security', source: 'WordPress.com benefits' },
                        { text: 'WordPress.com sites are optimized for speed and SEO out of the box', source: 'Platform optimization' }
                    ]
                }
            ];
            
            res.json({
                url: targetUrl,
                improvements: fallbackResults
            });
        }

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Analysis failed' });
    }
}

function analyzeHTML(html, url, loadTime) {
    const results = [];
    const seoIssues = [];
    const performanceIssues = [];
    const wpIssues = [];
    const uxIssues = [];
    const accessibilityIssues = [];
    const contentIssues = [];

    // Basic HTML analysis using string methods
    const htmlLower = html.toLowerCase();
    
    // Check for HTTPS
    if (!url.startsWith('https://')) {
        seoIssues.push({
            text: 'Site should use HTTPS for security and SEO benefits',
            source: 'Google HTTPS ranking factor'
        });
    }

    // Check for title tag
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (!titleMatch) {
        seoIssues.push({
            text: 'Missing page title - add a descriptive title tag',
            source: 'Google SEO guidelines'
        });
    } else {
        const title = titleMatch[1].trim();
        if (title.length > 60) {
            seoIssues.push({
                text: `Page title is ${title.length} characters - should be 50-60 for optimal display`,
                source: 'Google SERP optimization'
            });
        } else if (title.length < 30) {
            seoIssues.push({
                text: 'Page title seems short - consider making it more descriptive',
                source: 'SEO title optimization'
            });
        }
    }

    // Check for meta description
    if (!htmlLower.includes('name="description"')) {
        seoIssues.push({
            text: 'Missing meta description - add one for better search results',
            source: 'Google SEO best practices'
        });
    }

    // Check for images without alt text
    const imgMatches = html.match(/<img[^>]*>/gi) || [];
    let imagesWithoutAlt = 0;
    imgMatches.forEach(img => {
        if (!img.includes('alt=')) {
            imagesWithoutAlt++;
        }
    });

    if (imagesWithoutAlt > 0) {
        accessibilityIssues.push({
            text: `Found ${imagesWithoutAlt} images without alt text - add for accessibility`,
            source: 'WCAG 2.1 accessibility standards'
        });
    }

    // Check for H1 tags
    const h1Matches = html.match(/<h1[^>]*>/gi) || [];
    if (h1Matches.length === 0) {
        seoIssues.push({
            text: 'No H1 heading found - add one for better SEO structure',
            source: 'SEO heading hierarchy'
        });
    } else if (h1Matches.length > 1) {
        seoIssues.push({
            text: `Found ${h1Matches.length} H1 headings - should typically have only one per page`,
            source: 'SEO best practices'
        });
    }

    // Check for WordPress
    const isWordPress = htmlLower.includes('wp-content') || 
                       htmlLower.includes('wordpress') || 
                       htmlLower.includes('wp-includes');

    if (isWordPress) {
        wpIssues.push({
            text: 'WordPress site detected - great choice for content management',
            source: 'WordPress site analysis'
        });

        // Check for basic/starter site indicators
        const hasCustomTheme = htmlLower.includes('wp-content/themes/') && 
                              !htmlLower.includes('twentytwenty') && 
                              !htmlLower.includes('twentynineteen') && 
                              !htmlLower.includes('twentyeighteen');
        
        const hasPlugins = htmlLower.includes('wp-content/plugins/');
        const hasJetpack = htmlLower.includes('jetpack');
        
        // Look for e-commerce indicators
        const hasEcommerce = htmlLower.includes('shop') || 
                           htmlLower.includes('buy') || 
                           htmlLower.includes('cart') || 
                           htmlLower.includes('product') || 
                           htmlLower.includes('store') || 
                           htmlLower.includes('price') ||
                           htmlLower.includes('

    // Performance check
    if (loadTime > 3000) {
        performanceIssues.push({
            text: `Page loaded in ${(loadTime/1000).toFixed(1)} seconds - should be under 3 seconds`,
            source: 'Google Core Web Vitals'
        });
    }

    // Check for Open Graph tags
    if (!htmlLower.includes('property="og:title"')) {
        seoIssues.push({
            text: 'Missing Open Graph tags - add for better social media sharing',
            source: 'Facebook Open Graph documentation'
        });
    }

    // Check for viewport meta tag
    if (!htmlLower.includes('name="viewport"')) {
        uxIssues.push({
            text: 'Missing viewport meta tag - important for mobile responsiveness',
            source: 'Google Mobile-First indexing'
        });
    }

    // Check for contact info
    if (!htmlLower.includes('contact') && !htmlLower.includes('@') && !htmlLower.includes('email')) {
        uxIssues.push({
            text: 'No obvious contact information found - make it easy for users to reach you',
            source: 'User experience best practices'
        });
    }

    // Add some general recommendations if categories are empty
    if (performanceIssues.length === 0) {
        performanceIssues.push({
            text: 'Consider implementing image optimization and caching for better performance',
            source: 'Web performance best practices'
        });
    }

    if (uxIssues.length === 0) {
        uxIssues.push({
            text: 'Add clear call-to-action buttons to guide user behavior',
            source: 'Conversion optimization guidelines'
        });
    }

    // Compile results
    if (seoIssues.length > 0) {
        results.push({
            category: 'SEO Optimization',
            icon: '🔍',
            priority: 'high',
            items: seoIssues
        });
    }

    if (wpIssues.length > 0) {
        results.push({
            category: 'WordPress.com Specific',
            icon: '⚡',
            priority: 'high',
            items: wpIssues
        });
    }

    if (performanceIssues.length > 0) {
        results.push({
            category: 'Performance',
            icon: '🚀',
            priority: 'medium',
            items: performanceIssues
        });
    }

    if (uxIssues.length > 0) {
        results.push({
            category: 'User Experience',
            icon: '👤',
            priority: 'medium',
            items: uxIssues
        });
    }

    if (accessibilityIssues.length > 0) {
        results.push({
            category: 'Accessibility',
            icon: '♿',
            priority: 'low',
            items: accessibilityIssues
        });
    }

    return results;
});

        // Recommend Business plan for basic sites or e-commerce needs
        if (!hasCustomTheme && !hasPlugins) {
            wpIssues.push({
                text: 'Consider upgrading to WordPress.com Business plan for advanced customization and SEO tools',
                source: 'WordPress.com plan recommendations for growing sites'
            });
        }

        if (hasEcommerce && !htmlLower.includes('woocommerce')) {
            wpIssues.push({
                text: 'Site mentions products/shopping - consider WordPress.com Business plan with WooCommerce for e-commerce',
                source: 'E-commerce functionality analysis'
            });
        }

        if (!hasJetpack) {
            wpIssues.push({
                text: 'Consider installing Jetpack for enhanced performance and security',
                source: 'WordPress.com recommendations'
            });
        }

        wpIssues.push({
            text: 'Optimize images using WordPress.com built-in compression',
            source: 'WordPress.com performance features'
        });
    } else {
        wpIssues.push({
            text: 'Consider migrating to WordPress.com for better content management',
            source: 'Platform recommendation'
        });
    }

    // Performance check
    if (loadTime > 3000) {
        performanceIssues.push({
            text: `Page loaded in ${(loadTime/1000).toFixed(1)} seconds - should be under 3 seconds`,
            source: 'Google Core Web Vitals'
        });
    }

    // Check for Open Graph tags
    if (!htmlLower.includes('property="og:title"')) {
        seoIssues.push({
            text: 'Missing Open Graph tags - add for better social media sharing',
            source: 'Facebook Open Graph documentation'
        });
    }

    // Check for viewport meta tag
    if (!htmlLower.includes('name="viewport"')) {
        uxIssues.push({
            text: 'Missing viewport meta tag - important for mobile responsiveness',
            source: 'Google Mobile-First indexing'
        });
    }

    // Check for contact info
    if (!htmlLower.includes('contact') && !htmlLower.includes('@') && !htmlLower.includes('email')) {
        uxIssues.push({
            text: 'No obvious contact information found - make it easy for users to reach you',
            source: 'User experience best practices'
        });
    }

    // Add some general recommendations if categories are empty
    if (performanceIssues.length === 0) {
        performanceIssues.push({
            text: 'Consider implementing image optimization and caching for better performance',
            source: 'Web performance best practices'
        });
    }

    if (uxIssues.length === 0) {
        uxIssues.push({
            text: 'Add clear call-to-action buttons to guide user behavior',
            source: 'Conversion optimization guidelines'
        });
    }

    // Compile results
    if (seoIssues.length > 0) {
        results.push({
            category: 'SEO Optimization',
            icon: '🔍',
            priority: 'high',
            items: seoIssues
        });
    }

    if (wpIssues.length > 0) {
        results.push({
            category: 'WordPress.com Specific',
            icon: '⚡',
            priority: 'high',
            items: wpIssues
        });
    }

    if (performanceIssues.length > 0) {
        results.push({
            category: 'Performance',
            icon: '🚀',
            priority: 'medium',
            items: performanceIssues
        });
    }

    if (uxIssues.length > 0) {
        results.push({
            category: 'User Experience',
            icon: '👤',
            priority: 'medium',
            items: uxIssues
        });
    }

    if (accessibilityIssues.length > 0) {
        results.push({
            category: 'Accessibility',
            icon: '♿',
            priority: 'low',
            items: accessibilityIssues
        });
    }

    return results;
}
