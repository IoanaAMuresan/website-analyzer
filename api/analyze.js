const axios = require('axios');
const cheerio = require('cheerio');

// Helper function to safely get text content
function safeText(element) {
    return element ? element.trim() : '';
}

// Main analysis function
async function analyzeWebsite(url) {
    const results = {
        seo: [],
        performance: [],
        wordpress: [],
        ux: [],
        accessibility: [],
        content: []
    };

    try {
        // Fetch the website
        const startTime = Date.now();
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'WordPress.com Website Analyzer Bot'
            }
        });
        const loadTime = Date.now() - startTime;
        const html = response.data;
        const $ = cheerio.load(html);

        // Basic URL analysis
        const urlObj = new URL(url);
        
        // HTTPS Check
        if (!url.startsWith('https://')) {
            results.seo.push({
                text: 'Site should use HTTPS for security and SEO benefits',
                source: 'Google HTTPS ranking factor'
            });
        }

        // URL length check
        if (url.length > 60) {
            results.seo.push({
                text: 'URL is quite long - consider shortening for better SEO',
                source: 'SEO best practices'
            });
        }

        // Title tag analysis
        const title = safeText($('title').text());
        if (!title) {
            results.seo.push({
                text: 'Missing page title - add a descriptive title tag',
                source: 'Google SEO guidelines'
            });
        } else if (title.length > 60) {
            results.seo.push({
                text: `Page title is ${title.length} characters - should be 50-60 for optimal display`,
                source: 'Google SERP optimization'
            });
        } else if (title.length < 30) {
            results.seo.push({
                text: 'Page title seems short - consider making it more descriptive',
                source: 'SEO title optimization'
            });
        }

        // Meta description analysis
        const metaDesc = $('meta[name="description"]').attr('content');
        if (!metaDesc) {
            results.seo.push({
                text: 'Missing meta description - add one for better search results',
                source: 'Google SEO best practices'
            });
        } else if (metaDesc.length > 160) {
            results.seo.push({
                text: `Meta description is ${metaDesc.length} characters - should be 150-160`,
                source: 'Google SERP guidelines'
            });
        }

        // Image alt text analysis
        const images = $('img');
        let imagesWithoutAlt = 0;
        images.each((i, img) => {
            if (!$(img).attr('alt')) {
                imagesWithoutAlt++;
            }
        });

        if (imagesWithoutAlt > 0) {
            results.accessibility.push({
                text: `Found ${imagesWithoutAlt} images without alt text - add for accessibility`,
                source: 'WCAG 2.1 accessibility standards'
            });
        }

        // Heading structure analysis
        const h1Count = $('h1').length;
        if (h1Count === 0) {
            results.seo.push({
                text: 'No H1 heading found - add one for better SEO structure',
                source: 'SEO heading hierarchy'
            });
        } else if (h1Count > 1) {
            results.seo.push({
                text: `Found ${h1Count} H1 headings - should typically have only one per page`,
                source: 'SEO best practices'
            });
        }

        // Check for common WordPress indicators
        const isWordPress = html.includes('wp-content') || 
                          html.includes('wordpress') || 
                          $('meta[name="generator"]').attr('content')?.includes('WordPress');

        if (isWordPress) {
            results.wordpress.push({
                text: 'WordPress site detected - great choice for content management',
                source: 'WordPress site analysis'
            });

            // WordPress-specific checks
            if (html.includes('wp-content/themes/')) {
                const themeMatch = html.match(/wp-content\/themes\/([^\/]+)/);
                if (themeMatch) {
                    results.wordpress.push({
                        text: `Using WordPress theme: ${themeMatch[1]} - ensure it's regularly updated`,
                        source: 'WordPress security best practices'
                    });
                }
            }

            if (!html.includes('jetpack')) {
                results.wordpress.push({
                    text: 'Consider installing Jetpack for enhanced performance and security',
                    source: 'WordPress.com recommendations'
                });
            }
        }

        // Performance analysis
        if (loadTime > 3000) {
            results.performance.push({
                text: `Page loaded in ${(loadTime/1000).toFixed(1)} seconds - should be under 3 seconds`,
                source: 'Google Core Web Vitals'
            });
        }

        // Check for Open Graph tags
        const ogTitle = $('meta[property="og:title"]').attr('content');
        const ogDesc = $('meta[property="og:description"]').attr('content');
        if (!ogTitle || !ogDesc) {
            results.seo.push({
                text: 'Missing Open Graph tags - add for better social media sharing',
                source: 'Facebook Open Graph documentation'
            });
        }

        // Content analysis
        const textContent = $('body').text();
        const wordCount = textContent.split(/\s+/).length;
        
        if (wordCount < 300) {
            results.content.push({
                text: 'Page has limited content - consider adding more valuable information',
                source: 'Content quality guidelines'
            });
        }

        // Check for contact information
        if (!html.toLowerCase().includes('contact') && 
            !html.toLowerCase().includes('email') && 
            !html.toLowerCase().includes('@')) {
            results.ux.push({
                text: 'No obvious contact information found - make it easy for users to reach you',
                source: 'User experience best practices'
            });
        }

        // Mobile viewport check
        const viewport = $('meta[name="viewport"]').attr('content');
        if (!viewport) {
            results.ux.push({
                text: 'Missing viewport meta tag - important for mobile responsiveness',
                source: 'Google Mobile-First indexing'
            });
        }

        // Check for schema markup
        if (!html.includes('schema.org') && !$('script[type="application/ld+json"]').length) {
            results.seo.push({
                text: 'No structured data found - consider adding schema markup',
                source: 'Google structured data guidelines'
            });
        }

        // Add some WordPress.com specific recommendations if it's a WP site
        if (isWordPress) {
            results.wordpress.push({
                text: 'Optimize images using WordPress.com built-in compression',
                source: 'WordPress.com performance features'
            });
        }

        // If no issues found in a category, add some general recommendations
        if (results.performance.length === 0) {
            results.performance.push({
                text: 'Consider implementing image optimization and caching for better performance',
                source: 'Web performance best practices'
            });
        }

        if (results.ux.length === 0) {
            results.ux.push({
                text: 'Add clear call-to-action buttons to guide user behavior',
                source: 'Conversion optimization guidelines'
            });
        }

    } catch (error) {
        console.error('Analysis error:', error.message);
        
        // Still provide some general recommendations even if we can't access the site
        results.seo.push({
            text: 'Unable to fully analyze site - ensure it\'s publicly accessible',
            source: 'Site accessibility check'
        });
        
        results.wordpress.push({
            text: 'Consider WordPress.com hosting for reliable performance and security',
            source: 'WordPress.com hosting benefits'
        });
    }

    return results;
}

// Compile results into the format expected by frontend
function compileResults(improvements) {
    const results = [];

    if (improvements.seo.length > 0) {
        results.push({
            category: 'SEO Optimization',
            icon: '🔍',
            priority: 'high',
            items: improvements.seo
        });
    }

    if (improvements.wordpress.length > 0) {
        results.push({
            category: 'WordPress.com Specific',
            icon: '⚡',
            priority: 'high',
            items: improvements.wordpress
        });
    }

    if (improvements.performance.length > 0) {
        results.push({
            category: 'Performance',
            icon: '🚀',
            priority: 'medium',
            items: improvements.performance
        });
    }

    if (improvements.ux.length > 0) {
        results.push({
            category: 'User Experience',
            icon: '👤',
            priority: 'medium',
            items: improvements.ux
        });
    }

    if (improvements.content.length > 0) {
        results.push({
            category: 'Content & Structure',
            icon: '✍️',
            priority: 'medium',
            items: improvements.content
        });
    }

    if (improvements.accessibility.length > 0) {
        results.push({
            category: 'Accessibility',
            icon: '♿',
            priority: 'low',
            items: improvements.accessibility
        });
    }

    return results;
}

// Vercel serverless function
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
        
        const improvements = await analyzeWebsite(targetUrl);
        const results = compileResults(improvements);
        
        res.json({
            url: targetUrl,
            improvements: results
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Analysis failed' });
    }
}
