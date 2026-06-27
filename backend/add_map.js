const fs = require('fs');
const schemaPath = 'prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf-8');

// Use regex to find `model ModelName {` and inject `\n  @@map("modelname")`
schema = schema.replace(/model\s+([A-Za-z0-9_]+)\s*\{/g, (match, modelName) => {
  const lowercaseName = modelName.toLowerCase();
  return `model ${modelName} {\n  @@map("${lowercaseName}")`;
});

fs.writeFileSync(schemaPath, schema);
console.log('Added @@map to all models!');
