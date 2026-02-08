
/**
 * Utility to clean content for text previews.
 * Handles both HTML and plain text/markdown.
 */
export const cleanContent = (content: string): string => {
    if (!content) return '';

    // 1. Basic HTML Tag Detection
    const hasTags = /<[a-z][\s\S]*>/i.test(content);

    if (hasTags) {
        // 2. Replace block tags with newlines to preserve structure
        let text = content
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/p>/gi, '\n\n')
            .replace(/<\/div>/gi, '\n')
            .replace(/<\/h[1-6]>/gi, '\n\n')
            .replace(/<\/li>/gi, '\n');

        // 3. Strip all other tags
        text = text.replace(/<[^>]+>/g, '');

        // 4. Decode HTML Entities
        text = text
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&lsquo;/g, "'")
            .replace(/&rsquo;/g, "'")
            .replace(/&ldquo;/g, '"')
            .replace(/&rdquo;/g, '"');

        // 5. Trim extra whitespace
        return text.trim();
    }

    return content;
    return content;
};

/**
 * Smartly inverts dark colors in HTML to light colors for dark mode.
 * Preserves colored text (red, blue, etc) unless it's very dark.
 */
export const invertHtmlColors = (html: string): string => {
    if (!html) return '';

    // Regex to find style attributes with color
    return html.replace(/style="([^"]*)"/gi, (match, styleContent) => {
        // Check for color property
        const colorMatch = styleContent.match(/color:\s*([^;"]+)/i);
        if (!colorMatch) return match;

        const originalColor = colorMatch[1].trim();
        let newColor = originalColor;

        // RGB Regex
        const rgbMatch = originalColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/i);
        // Hex Regex
        const hexMatch = originalColor.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
        // Named Colors (simplistic)
        const isBlack = ['black', '#000', '#000000'].includes(originalColor.toLowerCase());

        if (isBlack) {
            newColor = '#e2e8f0'; // Light slate
        } else if (rgbMatch) {
            const r = parseInt(rgbMatch[1]);
            const g = parseInt(rgbMatch[2]);
            const b = parseInt(rgbMatch[3]);
            // If strictly dark (luminance approximation or just threshold)
            // Using simple brightness: (r+g+b)/3 < 100
            if ((r + g + b) / 3 < 100) {
                newColor = '#e2e8f0';
            }
        } else if (hexMatch) {
            // Convert to RGB to check brightness
            let hex = hexMatch[1];
            if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            if ((r + g + b) / 3 < 80) { // Stricter for hex
                newColor = '#e2e8f0';
            }
        }

        if (newColor !== originalColor) {
            return match.replace(originalColor, newColor);
        }
        return match;
    });
};
