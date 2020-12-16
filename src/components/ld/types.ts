export type LDPreferences = {
    population: string;
    rSquared: number;
    using: boolean;
};

export type ExampleProps = {
    onLDPreferencesChanged: (l: LDPreferences) => void;
    ldPreferences: LDPreferences;
};
