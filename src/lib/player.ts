import * as vscode from "vscode";
import { ContentTreeItem } from "./treeItem";

export default class Player {

    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    play = async (item: ContentTreeItem) => {
    };
}
