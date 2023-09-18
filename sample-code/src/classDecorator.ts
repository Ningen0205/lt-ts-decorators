function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class BugReport {
  static type: string | undefined = "report";
  constructor(public title: string) {}

  static print() {
    console.log(`print()`)
  }
}

delete BugReport.type; // Decoratorの@sealによってこれはエラーになる
console.log(BugReport.type);