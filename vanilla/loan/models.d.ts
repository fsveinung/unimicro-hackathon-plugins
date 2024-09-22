export interface IPage {
    create(): HTMLElement;
    validate(state: IState): { success: boolean, message?: string, state?: any };
}

export interface IState {
    amount: number;
}