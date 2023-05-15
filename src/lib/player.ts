import * as vscode from "vscode";
import PlayerProvider from "../providers/playerProviders";
import { QueueTreeItem } from "./treeItem";

export default class Player {

    private context: vscode.ExtensionContext;
    private provider: PlayerProvider;

    constructor(context: vscode.ExtensionContext, provider: PlayerProvider) {
        this.context = context;
        this.provider = provider;
    }

    play = async (item: QueueTreeItem) => {
        this.provider.play(item);
        // this.provider.getWebviewContent(item);
    };
}
