import "reflect-metadata";

function immutable(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.set;
  if(original === undefined) return;

  // setterを上書きしている
  descriptor.set = function (value: any) {
    return original.call(this, { ...value })
  }
}

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