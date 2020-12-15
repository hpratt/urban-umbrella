export function isRSID(text: string): boolean {
    return /rs[0-9]+/g.exec(text) !== null;
}
