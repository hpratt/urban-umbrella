export const logLikelihood = backgroundFrequencies => r => {
    let sum = 0.0;
    r.map((x, i) => (sum += x === 0 ? 0 : x * Math.log2(x / (backgroundFrequencies[i] || 0.01))));
    return r.map(x => {
        const v = x * sum;
        return v <= 0.0 ? 0.0 : v;
    });
};
