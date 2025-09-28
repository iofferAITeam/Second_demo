const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('All properties:');
console.log(Object.getOwnPropertyNames(prisma).filter(name => !name.startsWith('_') && !name.startsWith('$')).join(', '));

console.log('\nChat-related properties:');
console.log(Object.getOwnPropertyNames(prisma).filter(name => name.toLowerCase().includes('chat')).join(', '));