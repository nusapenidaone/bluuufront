import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiUrl } from '../api/base';

const RulesContext = createContext();

const POLICY_META = {
    privacy: { title: 'Privacy Policy', subtitle: 'How we collect and use your contact details' },
    cancellation: { title: 'Cancelation Policy', subtitle: 'Booking and refund terms', field: 'return' },
    liability: { title: 'Release from Liability', subtitle: 'Guest acknowledgment', field: 'release' },
    health: { title: 'Health, Safety & Sustainability Policy', subtitle: 'Operational standards' },
    payment: { title: 'Payment Policy', subtitle: 'Payment options and methods' },
};

const HTML_TAG_RE = /<\/?[a-z][\s\S]*>/i;

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function normalizeText(value) {
    return String(value || '')
        .replace(/\r\n?/g, '\n')
        .replace(/\u00a0/g, ' ')
        .trim();
}

function plainTextToHtml(value) {
    const normalized = normalizeText(value);
    if (!normalized) return '';
    return normalized
        .split(/\n{2,}/)
        .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br />')}</p>`)
        .join('');
}

function extractPolicyString(value) {
    if (typeof value === 'string') return value;

    if (Array.isArray(value)) {
        const parts = value
            .map((item) => extractPolicyString(item))
            .filter(Boolean);
        return parts.join('\n\n');
    }

    if (!value || typeof value !== 'object') {
        return '';
    }

    if (Array.isArray(value.ops)) {
        const deltaText = value.ops
            .map((op) => (typeof op?.insert === 'string' ? op.insert : ''))
            .join('');
        if (deltaText.trim()) return deltaText;
    }

    const preferredKeys = ['text', 'html', 'content', 'value', 'body', 'description', 'data'];
    for (const key of preferredKeys) {
        const extracted = extractPolicyString(value[key]);
        if (extracted) return extracted;
    }

    const fallbackStrings = Object.values(value)
        .filter((item) => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean);

    return fallbackStrings.join('\n\n');
}

function normalizePolicyHtml(rawContent) {
    const extracted = extractPolicyString(rawContent);
    if (!extracted) return '';
    const trimmed = extracted.trim();
    return HTML_TAG_RE.test(trimmed) ? trimmed : plainTextToHtml(trimmed);
}

function parsePolicyContent(rawPolicy) {
    if (!rawPolicy) {
        return { title: '', html: '' };
    }

    if (typeof rawPolicy === 'string') {
        return { title: '', html: normalizePolicyHtml(rawPolicy) };
    }

    const title = typeof rawPolicy.title === 'string' ? rawPolicy.title : '';
    const htmlSource =
        rawPolicy.text ??
        rawPolicy.html ??
        rawPolicy.content ??
        rawPolicy.value ??
        rawPolicy;
    const html = normalizePolicyHtml(htmlSource);

    return { title, html };
}

export function RulesProvider({ children }) {
    const [rules, setRules] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(apiUrl('rules'))
            .then(res => res.json())
            .then(data => {
                setRules(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const getPolicy = (type) => {
        const meta = POLICY_META[type];
        if (!meta) return null;
        const field = meta.field || type;
        const { title: apiTitle, html } = parsePolicyContent(rules?.[field]);

        return {
            title: apiTitle || meta.title,
            subtitle: meta.subtitle,
            html,
        };
    };

    return (
        <RulesContext.Provider value={{ rules, loading, getPolicy }}>
            {children}
        </RulesContext.Provider>
    );
}

export function useRules() {
    return useContext(RulesContext);
}
