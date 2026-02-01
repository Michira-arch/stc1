
import { useLocation } from 'react-router-dom';
import { useState, useCallback } from 'react';

export const usePageContext = () => {
    const location = useLocation();

    const getPageContext = useCallback(() => {
        let content = '';
        const title = document.title;
        const path = location.pathname;
        const selection = window.getSelection()?.toString() || '';

        // Try to capture main content
        const mainElement = document.querySelector('main') || document.body;
        // Limit content size to avoid token limits (simulated)
        const visibleText = mainElement.innerText.substring(0, 1000).replace(/\s+/g, ' ').trim();

        content = `Page: ${title}\nURL: ${path}\n\nVisible Content:\n${visibleText}`;

        if (selection) {
            content += `\n\nUser Selection:\n"${selection}"`;
        }

        return content;
    }, [location]);

    return { getPageContext };
};
