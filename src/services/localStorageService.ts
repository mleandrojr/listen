import { Memento } from "vscode";

export default class LocalStorageService {

    constructor(private storage: Memento) {}

    public get(key: string): any {
        return this.storage.get(key, null);
    }

    public set(key : string, value: any) {
        this.storage.update(key, value);
    }
}
