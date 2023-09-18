import "reflect-metadata";

function Strict(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const original = descriptor.value!;
  const parameterTypes = Reflect.getMetadata('design:paramtypes', target, propertyKey);
  const returnType = Reflect.getMetadata('design:returntype', target, propertyKey);

  const expect = (arg: any, paramType: any) => {
    if(arg === undefined || arg === null) return paramType === undefined;
    return arg.constructor === paramType || arg instanceof paramType;
  }

  descriptor.value = function(...args: any[]) {
    args.forEach((arg, index) => {
      if(!expect(arg, parameterTypes[index])) {
        throw new Error(`Invalid args, index: ${index}`);
      }
    })

    const result = original.call(this, ...args);
    if(!expect(result, returnType)) {
        throw new Error(`Invalid resultType, expect: ${returnType}, current: ${result}`);
    }

    return result;
  }
}

class User {
  constructor(public id: string) {}
}
class Test {
  @Strict
  say(
    id: number,
    name: string,
    user?: User
  ): [number, string] {
    console.log(id);
    console.log(name);
    console.log(user);

    return 123 as any; // Arrayではないため、エラーになる
  }
}

new Test().say(1, "test", new User('test'));