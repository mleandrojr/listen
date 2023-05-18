import * as vscode from 'vscode';
import Listen from '../listen';
import Storage from '../services/storage';
import { RadioType } from '../types/radio';
import { RadioItem } from './treeItem';

export default class Radio {

    private listen: Listen;
    private storage: Storage;

    constructor(listen: Listen) {
        this.listen = listen;
        this.storage = new Storage(this.listen.context);
    }

    openDialog = async () => {

        const url = await vscode.window.showInputBox({
            placeHolder: "Enter the URL of the radio stream",
            validateInput: (feed: string) => {
                try {
                    new URL(feed);
                    return "";
                } catch (error) {
                    return "The URL must be a valid URL";
                }
            }
        });

        if (!url || !url.length) {
            vscode.window.showErrorMessage(`Invalid URL ${url}`);
            return;
        }

        const name = await vscode.window.showInputBox({
            placeHolder: "Enter a name for the radio stream (optional)"
        });

        this.add(url, name);
    };

    add = async (url: string, name?: string) => {

        const radios: Record<string, any> = this.storage.get("radios") || {};

        if (radios && radios.hasOwnProperty(url)) {
            vscode.window.showErrorMessage(`The radio stream ${url} is already in the library.`);
            return;
        }

        const radio = <RadioType>{
            title: name && name.length ? name : undefined,
            url: url
        };

        radios[url] = radio;
        this.storage.set("radios", radios);

        vscode.window.showInformationMessage(`The radio stream ${name || url} was successfully added.`);
        this.listen.libraryProvider.refresh();
    };

    remove = async (radio: RadioItem) => {

        const radios: Record<string, any> = this.storage.get("radios") || {};
        delete radios[radio.description];

        const label = radio.label || radio.description;
        this.storage.set("radios", radios);

        vscode.window.showInformationMessage(`The radio stream ${label} was successfully removed.`);
        this.listen.libraryProvider.refresh();
    };
}
