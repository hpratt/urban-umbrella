export type ConfirmModalProps = {
    onAccept: () => void;
    onCancel: () => void;
};

export type LDDetailsModalProps = {
    onAccept: (options: LDOptions) => void;
};

export type LDModalProps = {
    onAccept: (options: LDOptions) => void;
    onCancel: () => void;
};

export type LDOptions = {
    population: string;
    rSquaredThreshold: number;
};

type SetPopulationAction = {
    type: "SET_POPULATION";
    population: string;
};

type SetRSquaredThresholdAction = {
    type: "SET_R_SQUARED_THRESDHOLD";
    rSquaredThreshold: number;
};

export type LDDetailsModalAction = SetPopulationAction | SetRSquaredThresholdAction;

export type LDDetailsModalReducer = (state: LDOptions, action: LDDetailsModalAction) => LDOptions;
