import * as vscode from "vscode";
import Listen from "./listen";

export function activate(context: vscode.ExtensionContext) {

    context.globalState.setKeysForSync(["podcasts", "radios"]);
    const listen = new Listen(context);

    const disposables = [
        vscode.commands.registerCommand("listen.addPodcast", listen.podcast.openDialog),
        vscode.commands.registerCommand("listen.refreshAllPodcasts", listen.libraryProvider.updateAllPodcasts),
        vscode.commands.registerCommand("listen.refreshPodcast", listen.libraryProvider.updatePodcast),
        vscode.commands.registerCommand("listen.removePodcast", listen.libraryProvider.removePodcast),
        vscode.commands.registerCommand("listen.addRadioStream", listen.radio.openDialog),
        vscode.commands.registerCommand("listen.removeRadio", listen.radio.remove),
        vscode.commands.registerCommand("listen.addToQueue", listen.queueProvider.add),
        vscode.commands.registerCommand("listen.removeFromQueue", listen.queueProvider.remove),
        vscode.commands.registerCommand("listen.play", listen.queueProvider.play),
        vscode.commands.registerCommand("listen.next", listen.queueProvider.next)
    ];

    for (const disposable of disposables) {
        context.subscriptions.push(disposable);
    }
}

export function deactivate() {}
