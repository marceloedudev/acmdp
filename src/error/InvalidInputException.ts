import Exception from "./Exception";

export default class InvalidInputException extends Exception {
    constructor(message: string) {
        super(message);
    }
}
