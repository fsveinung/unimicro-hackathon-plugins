export interface IPage {
    create(): HTMLElement;
    validate(state: IState): { success: boolean, message?: string, state?: any };
    activate(state: IState): void;
}

export interface IState {
    amount: number;
    equity: number;
}