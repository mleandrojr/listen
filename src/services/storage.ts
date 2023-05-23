import * as vscode from "vscode";
import * as fs from "fs";

export default class Storage {

    private context: vscode.ExtensionContext;
    private path: string;

    constructor(context: vscode.ExtensionContext) {

        if (!context.globalStorageUri.path) {
            throw new Error("Global storage path not found");
        }

        this.context = context;
        this.path = this.context.globalStorageUri.path.replace(/\s/g, "\\ ");

        if (!fs.existsSync(`${this.path}`)) {
            fs.mkdirSync(`${this.path}`);
        }
    }

    public get(key: string): any {

        if (!fs.existsSync(`${this.path}/${key}.json`)) {
            return null;
        }

        const data = fs.readFileSync(`${this.path}/${key}.json`, "utf8");
        return JSON.parse(data);
    }

    public set(key : string, value: any) {
        fs.writeFileSync(`${this.path}/${key}.json`, JSON.stringify(value));
    }
}
