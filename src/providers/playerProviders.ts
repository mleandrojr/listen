import path from "path";
import * as fs from "fs";
import * as vscode from "vscode";
import { QueueTreeItem } from "../libs/treeItem";
import { QueueType } from "../types/queue";

export default class PlayerProvider implements vscode.WebviewViewProvider {

    private context: vscode.ExtensionContext;
    private view?: vscode.WebviewView;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    public postMessage(message: any) {
        this.view?.webview.postMessage(message);
    }

    public onDidReceiveMessage(callback: (e: any) => any) {
        this.view!.webview.onDidReceiveMessage(callback);
    }

    public resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, token: vscode.CancellationToken) {

        this.view = webviewView;
        this.view.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this.context.extensionUri
            ]
        };

        this.getWebviewContent();
    }

    private getWebviewContent(media?: QueueTreeItem) {

        const cssPath = vscode.Uri.joinPath(this.context.extensionUri, "html", "assets", "css", "listen.css");
        const styleUri = this.view!.webview.asWebviewUri(cssPath);

        const scriptPath = vscode.Uri.joinPath(this.context.extensionUri, "html", "assets", "js", "listen.js");
        const scriptUri = this.view!.webview.asWebviewUri(scriptPath);

        const nonce = this.getNonce();
        const filePath = vscode.Uri.file(
            path.join(this.context.extensionPath, "html", "audioPlayer.html")
        );

        const content = fs.readFileSync(filePath.fsPath, "utf-8")
            .replace(/{title}/g, media && media.label ? media.label : "")
            .replace(/{media}/g, media && media.url ? media.url : "")
            .replace(/{nonce}/g, nonce)
            .replace(/{cspSource}/g, this.view!.webview.cspSource)
            .replace(/{styleUri}/g, styleUri.toString())
            .replace(/{scriptUri}/g, scriptUri.toString());

        this.view!.webview.html = content;
        return;
    }

    private getNonce() {

        let text = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }
}
