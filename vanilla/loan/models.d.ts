export interface IPage {
    create(): HTMLElement;
    validate(): { success: boolean, message?: string };
}