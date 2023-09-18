import "reflect-metadata";

const requiredMetadataKey = Symbol("required");
// indexは引数のindex
function required(target: any, propertyKey: string, index: number) {

  let existingRequiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyKey) || [];

  existingRequiredParameters.push(index);
  // 必須になっている引数のindexをMetadataで保存しておく
  Reflect.defineMetadata(requiredMetadataKey, existingRequiredParameters, target, propertyKey);
}

function validate(target: any, peropertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value!;
  descriptor.value = function() {
    // 保存していたメタデータを取得
    const requiredParameterIndexes: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, peropertyKey); 
    if(requiredParameterIndexes) {
      const isExistAllParameter = requiredParameterIndexes.every(index => index < arguments.length && arguments[index] !== undefined) ;
      if(!isExistAllParameter) {
        throw new Error("Missing required arguments");
      }
    }

    return original.apply(this, arguments);
  }
}

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