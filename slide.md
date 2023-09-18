---
marp: true
---

# TypeScriptのDecorator勉強してみた

---

# Table of contents

- Decoratorとは
- Decoratorの説明
  - Class Decorators
  - Property Decorators
  - Method Decorators
  - Accessor Decorators
  - Parameter Decorators
- Reflect-metadata
- 所感
---

# 注意点

今回説明するのは`experimentalDecorators`オプションを使用することで使えるようになる実験的なDecoratorです。

Typescript@5.0.0以上で使用できるDecoratorとは仕様が違うため注意してください。

---

# Decoratorとは

---

# Decoratorとは

「装飾者」を意味しています。
Methodの定義自体を変えずに、例えばLogging処理を追加したりすることができます。

---

# Decoratorの種類

Typescriptのデコレーターは以下の様な種類があります。

- Class Decorators
  - クラス宣言に付加する
- Property Decorators
  - クラスのプロパティに付加する
- Method Decorators
  - クラスに属するメソッドに付加する
- Accessor Decorators
  - `get(), set()`などのアクセサに付加する
- Parameter Decorators
  - クラスに属するメソッドの引数に付加する

---

# サンプル

```typescript
@classDecorator
class Bird {
  @propertyDecorator
  name: string;

  @methodDecorator
  fly(
    @parameterDecorator meters: number,
  ) {}

  @accessorDecorator
  get egg() {}
}
```

---

## Class Decorators

```typescript
// constructorは該当クラスのconstructor
// 値を返す場合、その値がクラス宣言になる
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
```

---

## Property Decorators

```typescript
// reflect-metadataは関数やプロパティのメタデータを操作できるライブラリ（後述）
import 'reflect-metadata';

const formatMetaDataKey = Symbol("format");

// @format("formatString")とするとメタデータに登録される
function format(formatString: string) {
  return Reflect.metadata(formatMetaDataKey, formatString);
}
function getFormat(target: any, propertyKey: string) {
  // @formatで登録したメタデータを取得している
  return Reflect.getMetadata(formatMetaDataKey, target, propertyKey);
}
```
---

## Property Decorators

```typescript
class Greeter {
  @format("Hello %s")
  greeting: string;

  constructor(message: string) {
    this.greeting = message;
  }

  greet() {
    // @formatで登録したstringをreflect-metadataを使用して取得している
    let formatString: string = getFormat(this, "greeting");
    return formatString.replace("%s", this.greeting);
  }
}

// Hello Testと表示される
console.log(new Greeter("Test").greet());
```

--- 

## Method Decorators

```typescript
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
```

---


## Method Decorators

```typescript
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
```

---

## Accessor Decorators

```typescript
import "reflect-metadata";

function immutable(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.set;
  if(original === undefined) return;

  // setterを上書きしている
  descriptor.set = function (value: any) {
    return original.call(this, { ...value })
  }
}
```

---

## Accessor Decorators

```typescript
class Pointer {
  private _point = { x: 0, y: 0 };
  
  @immutable
  set point(value: { x: number, y: number }) {
    this._point = value;
  }

  get point() {
    return this._point;
  }
}

const pointer = new Pointer();
const point = { x: 0, y: 0 };
pointer.point = point;

console.log(pointer.point === point);
// -> falseと表示される
```

---

## Parameter Decorators

```typescript
import "reflect-metadata";

const requiredMetadataKey = Symbol("required");
// indexは引数のindex
function required(target: any, propertyKey: string, index: number) {

  let existingRequiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyKey) || [];

  existingRequiredParameters.push(index);
  // 必須になっている引数のindexをMetadataで保存しておく
  Reflect.defineMetadata(requiredMetadataKey, existingRequiredParameters, target, propertyKey);
}
```

---

## Parameter Decorators

```typescript
function validate(target: any, peropertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value!;
  descriptor.value = function() {
    // 保存していたメタデータを取得
    const requiredParameterIndexes: number[] =
      Reflect.getOwnMetadata(requiredMetadataKey, target, peropertyKey); 
    if(requiredParameterIndexes) {
      const isExistAllParameter = requiredParameterIndexes.every((index) => {
        return index < arguments.length && arguments[index] !== undefined
      });

      if(!isExistAllParameter) {
        throw new Error("Missing required arguments");
      }
    }

    return original.apply(this, arguments);
  }
}
```

---

## Parameter Decorators

```typescript
class Report {
  @validate
  static print(
    @required name: string
  ) {
    console.log(name);
  }
}

Report.print("test"); // エラーにならない
Report.print(undefined as any); // 実行時エラーになる
```