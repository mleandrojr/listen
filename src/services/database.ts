import * as vscode from "vscode";

export default class Database {

    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    public get(key: string): any {
        return this.context.globalState.get(key);
    }

    public set(key : string, value: any) {
        this.context.globalState.update(key, value);
    }
}
