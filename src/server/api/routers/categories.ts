import { z } from "zod";

import { createTRPCRouter, publicProcedure, privateProcedure } from "~/server/api/trpc";

// const userIdSchema = z.object({userId: z.string() });

// const userSchema = z.object({
//   name: z.string(),
//   email: z.string(),
//   password: z.string(),
//   verificationCode: z.string(),
// })

const categoryUpdateSchema = z.object({
  categoryId: z.string(),
  isInterested: z.boolean(),
});

type CategorySelect = {
  id: boolean;
  title: boolean;
  users: {
    where: {
      userId: string;
    };
    select: {
      isInterested: boolean;
    };
  };
};

// http://localhost:3000/api/trpc/categories.withName?batch=1&input={"0":{"json":{ "userId": "1"}}}

export const categoriesRouter = createTRPCRouter({

  getAll: privateProcedure
  .input(z.object({
    page: z.number().default(1),
    limit: z.number().default(10)
  }))
  .query( async ({ctx, input}) => {
    const userId = ctx.user.userId;
    const { page, limit } = input;
    const skip = (page - 1) * limit;

    const [userCategories, totalCategories] = await ctx.db.$transaction([
      ctx.db.category.findMany({
        skip,
        take: limit,
        orderBy: {
          id: 'desc'
        },
        select: {
          id: true,
          title: true,
          userCategories: {
            where: {
              userId,
            },
            select: {
              isInterested: true
            }
          }
        }
      }),
      ctx.db.category.count()
    ]);

      const categories = userCategories.map(category => {
        const isInterested = category.userCategories.length > 0 ? category.userCategories[0]?.isInterested : false;
        return {
          id: category.id,
          title: category.title,
          isInterested: isInterested
        };
      });

      return {
        categories,
        totalCategories
      }

  }),

  

  //update user
  updateCategoryInterest: privateProcedure
    .input(categoryUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.userId
      const {categoryId, isInterested} = input;
      const existingCategory =  await ctx.db.userCategory.findUnique({
        where: {
            userId_categoryId: {
              userId,
              categoryId,
            },
          },
      })

      if(existingCategory){
        await ctx.db.userCategory.update({
            where: {
              userId_categoryId: {
                userId,
                categoryId
              },
            },
            data: {
              isInterested: isInterested,
            },
          });
      }
      else {
        await ctx.db.userCategory.create({
          data: {
            userId,
            categoryId,
            isInterested: isInterested,
          },
        });
      }

      return true;

    }),

})
                                            