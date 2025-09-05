export class Log {
  constructor(
    private message: string,
    private meta: object,
  ) {}

  toString() {
    return JSON.stringify({ message: this.message, meta: this.meta });
  }

  static escapeEmail(email: string) {
    return email.split('@')[0];
  }
}
