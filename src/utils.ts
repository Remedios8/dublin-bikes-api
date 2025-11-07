import { isBoolean } from "lodash";

export function normalizeEmpty(v: any) {
    if (v === '' || v === undefined) return null;
    if (typeof v === 'string') {
        const t = v.trim();
        if (t === '' || t.toLowerCase() === 'null' || t.toLowerCase() === 'undefined') return null;
        return t;
    }
    return v;
}

export function isLikeDate(value: any): boolean {
    const t = Date.parse(String(value));
    return !isNaN(t);
}

export function isLikeBoolean(value: any): boolean {
    const ls = String(value).toLowerCase().trim();
    return (isBoolean(ls) || ls === 'true' || ls === 'false' || ls === '0' || ls === '1' || ls === 'yes' || ls === 'no');
}

export function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

export function compareEq(a: any, b: any,) { return a === b; }
export function compareGt(a: any, b: any) { return a > b; }
export function compareLt(a: any, b: any) { return a < b; }
