const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

const categories = [
    { name: 'Famous People' },
    { name: 'Movies & TV' },
    { name: 'Musicians' },
    { name: 'Games' },
    { name: 'Animals' },
    { name: 'Philosophy' },
    { name: 'Scientists' },
];

async function main() {
    try {
        for (let i = 0; i < categories.length; i++) {
            await db.category.create({ data: categories[i] });
        }
    } catch (error) {
        console.error('Error seeding default categories:', error);
    } finally {
        await db.$disconnect();
    }
}

main();
