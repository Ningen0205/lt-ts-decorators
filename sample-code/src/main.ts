import "reflect-metadata";

function Logging(): MethodDecorator {
  return (
    target: any,
    methodName: string | symbol,
    descriptor: TypedPropertyDescriptor<any>
  ) => {
    const original = descriptor.value;

    descriptor.value = function (...args: any[]) {
      console.log('args: ', args);
      const result = original.apply(this, args);
      console.log('result: ', result)
      return result;
    }
  }
}

type Constructor = new (...args: any[]) => any;
type DataClass<T> = T & {
  toString(): string
}
function DataClass<T extends Constructor>(target: T) {
  return class extends target {
    toString() {
      return JSON.stringify(this);
    }
  }
}

type User = {
  id: number,
  name: string
}


@DataClass
class UserInput {
  constructor(public id: number, public name: string) {}
}

const a: DataClass<UserInput> = new UserInput(1, 'test')
console.log(a.toString())

class TestUserApi {
  // inmemory
  private users: User[] = [
    {
      id: 1,
      name: "admin"
    }
  ]

  @Logging()
  find(userId: User["id"]): User | undefined {
    return this.users.find(u => u.id === userId)
  }
}

// new TestUserApi().find(1)