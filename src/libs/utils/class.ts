export function extractMethodNamesFromClass(instance: any): string[] {
  const methodNames = new Set<string>();
  const excludeMethods = new Set([
    'onModuleInit',
    'onModuleDestroy',
    'constructor',
    'toString',
    'toJSON',
    'valueOf',
  ]);

  let proto = Object.getPrototypeOf(instance);

  while (proto && proto !== Object.prototype) {
    const propertyNames = Object.getOwnPropertyNames(proto);

    for (const propertyName of propertyNames) {
      if (
        !excludeMethods.has(propertyName) &&
        !propertyName.startsWith('_') &&
        propertyName !== 'constructor' &&
        typeof instance[propertyName] === 'function'
      ) {
        methodNames.add(propertyName);
      }
    }

    proto = Object.getPrototypeOf(proto);
  }

  return Array.from(methodNames);
}
