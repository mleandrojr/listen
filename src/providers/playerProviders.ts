import path from "path";
import * as fs from "fs";
import * as vscode from "vscode";
import Listen from "../listen";
import { QueueTreeItem } from "../libs/treeItem";

export default class PlayerProvider implements vscode.WebviewViewProvider {

    private listen: Listen;
    private view?: vscode.WebviewView;

    constructor(listen: Listen) {
        this.listen = listen;
    }

    public postMessage(message: any) {
        this.view?.webview.postMessage(message);
    }

    public onDidReceiveMessage = (e: Record<string, any>) => {
        if (this.commands.hasOwnProperty(e.command)) {
            this.commands[e.command](e);
        }
    };

    public resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, token: vscode.CancellationToken) {

        this.view = webviewView;
        this.view.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this.listen.context.extensionUri
            ]
        };

        this.getWebviewContent();
        this.view.webview.onDidReceiveMessage(this.onDidReceiveMessage);
    }

    private getWebviewContent(media?: QueueTreeItem) {

        const cssPath = vscode.Uri.joinPath(this.listen.context.extensionUri, "html", "assets", "css", "listen.css");
        const styleUri = this.view!.webview.asWebviewUri(cssPath);

        const scriptPath = vscode.Uri.joinPath(this.listen.context.extensionUri, "html", "assets", "js", "listen.js");
        const scriptUri = this.view!.webview.asWebviewUri(scriptPath);

        const nonce = this.getNonce();
        const filePath = vscode.Uri.file(
            path.join(this.listen.context.extensionPath, "html", "audioPlayer.html")
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

    private commands: Record<string, Function> = {

        playing: (e: any) => {
            const episode = this.listen.episode.findByUrl(e.media);
            if (episode) {
                this.listen.episode.markAsRead(episode);
            }
        },

        previous: () => {
            this.listen.queue.previous();
        },

        next: () => {
            this.listen.queue.next();
        },
    };
}
