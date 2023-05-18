import Listen from "../listen";
import Storage from "../services/storage";

export default class Library {

    private listen: Listen;
    private storage: Storage;

    constructor(listen: Listen) {
        this.listen = listen;
        this.storage = new Storage(this.listen.context);
    }
}
