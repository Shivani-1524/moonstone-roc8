import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()


const generateFakeCategories = () => ({
  id: faker.string.uuid(),
  title: faker.commerce.product()
});

const seedDatabase = async () => {
  const categories = Array.from({length: 100}, generateFakeCategories)
  for(const ctg of categories){
    await db.category.create({
      data: ctg
    })
  }

  console.log('Database seeded successfully');
}

seedDatabase()
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1)
  })
  .finally(() => {
    db.$disconnect();
  });