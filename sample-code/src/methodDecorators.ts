import "reflect-metadata";

// target: 該当クラスのコンストラクタ関数
// propertyKey: プロパティ名
// descriptor: プロパティの構成を説明するObject
function logger(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  // descriptor.valueが該当の関数自体を表す
  const original = descriptor.value;

  descriptor.value = function(...args: any[]) {
    console.log("params:", ...args);
    const result = original.call(this, ...args);
    console.log("result:", result);
    return result;
  }
}

class Calc {
  @logger
  static add(x: number, y: number) {
    return x + y
  }
}

// 以下が表示される
// params: 1 2
// result: 3
Calc.add(1, 2);