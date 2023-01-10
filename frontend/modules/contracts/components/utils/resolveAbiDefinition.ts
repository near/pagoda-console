import type { AbiRoot } from 'near-abi-client-js';

// Recursively resolve references to collapse type.
// This is useful to be able to infer the actual types of data and avoid accepting the
// fallback JSON input when possible.
const resolveDefinition = (abi: AbiRoot, def: any) => {
  const jsonRoot = abi.body.root_schema;
  while (def && def.$ref) {
    const ref: string = def.$ref;
    if (ref.slice(0, 14) === '#/definitions/') {
      // It's a JSON Pointer reference, resolve the type.
      const defName = ref.slice(14);
      if (!jsonRoot.definitions || !jsonRoot.definitions[defName]) {
        break;
      }

      def = jsonRoot.definitions[defName];
    }
  }
  return def.type;
};

export default resolveDefinition;
