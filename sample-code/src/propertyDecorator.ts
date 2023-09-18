import 'reflect-metadata';

const formatMetaDataKey = Symbol("format")
function format(formatString: string) {
  return Reflect.metadata(formatMetaDataKey, formatString);
}
function getFormat(target: any, propertyKey: string) {
  return Reflect.getMetadata(formatMetaDataKey, target, propertyKey);
}

class Greeter {
  @format("Hello %s")
  greeting: string;

  constructor(message: string) {
    this.greeting = message;
  }

  greet() {
    let formatString: string = getFormat(this, "greeting");
    return formatString.replace("%s", this.greeting);
  }
}
console.log(new Greeter("Test").greet());