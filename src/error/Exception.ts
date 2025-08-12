export default class Exception extends Error {
    public timestamp: Date;

    constructor(readonly message: string, timestamp?: Date) {
        super(message);
        this.timestamp = timestamp ?? new Date();
    }
}
