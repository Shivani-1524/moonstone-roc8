import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()


const generateFakeCategories = () => ({
  id: faker.string.uuid(),
  title: faker.commerce.product()
});

const seedDatabase = async () => {
  const existingCategoriesCount = await db.category.count();
  if(existingCategoriesCount === 0){
    const categories = Array.from({length: 100}, generateFakeCategories)
    for(const ctg of categories){
      await db.category.create({
        data: ctg
      })
    }
    console.log('Database seeded successfully');
  }else{
    console.log("Database already contains data")
  }
}

seedDatabase()
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1)
  })
  .finally(() => {
    db.$disconnect();
  });