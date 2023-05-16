import * as vscode from 'vscode';
import { ContentTreeItem } from '../libs/treeItem';

export default class LibraryProvider implements vscode.TreeDataProvider<vscode.TreeItem> {

    public onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void>;
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void>;
    private context: vscode.ExtensionContext;
    private data: ContentTreeItem[] = [];

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this._onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }

    refresh(data: ContentTreeItem[]): void {
        this.data = data;
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ContentTreeItem): ContentTreeItem {
        return element;
    }

    getChildren(element?: ContentTreeItem|undefined): Promise<ContentTreeItem[]> {

        if (typeof element === "undefined") {
            return Promise.resolve(this.data);
        }

        if (element.children) {
            return Promise.resolve(element.children);
        }

        return Promise.resolve([]);
    }
}
