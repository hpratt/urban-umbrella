export function range(start: number, end: number, step: number): number[] {
    const r: number[] = [];
    for (let i: number = start; i <= end; i += step) r.push(i);
    return r;
}
