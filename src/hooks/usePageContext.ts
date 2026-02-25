
import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { appRegistry } from '../ai/appRegistry';

/**
 * Hook to get context about the current page for the AI.
 * 
 * Uses the AppRegistry for structured context when available,
 * falls back to DOM scraping for unregistered pages.
 */
export const usePageContext = () => {
    const location = useLocation();

    const getPageContext = useCallback(() => {
        // Try structured context from AppRegistry first
        const activePage = appRegistry.getActive();
        if (activePage) {
            // Return synchronous summary; the full async context
            // is fetched by aiService.ts via appRegistry.getEnrichedContext()
            const caps = activePage.capabilities.map(c => c.label).join(', ');
            const acts = activePage.actions.map(a => a.label).join(', ');
            return `Page: ${activePage.name}\nCapabilities: ${caps}\nAvailable Actions: ${acts}`;
        }

        // Fallback: DOM scraping for unregistered pages
        let content = '';
        const title = document.title;
        const path = location.pathname;
        const selection = window.getSelection()?.toString() || '';

        const mainElement = document.querySelector('main') || document.body;
        const visibleText = mainElement.innerText.substring(0, 1000).replace(/\s+/g, ' ').trim();

        content = `Page: ${title}\nURL: ${path}\n\nVisible Content:\n${visibleText}`;

        if (selection) {
            content += `\n\nUser Selection:\n"${selection}"`;
        }

        return content;
    }, [location]);

    return { getPageContext };
};
