import "reflect-metadata";

type constructor<T> = new (...args: any[]) => T;



class Container {
  private static metaKey = Symbol
}