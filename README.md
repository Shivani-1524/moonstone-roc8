# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## Some Features and Approach Highlights
- **Convenient OTP Delivery:** <br /> An 8-digit OTP is sent via email, allowing easy copy-pasting into the OTP input field.
- **Seamless OTP Sign-Up:** <br /> The OTP email includes a link for quick sign-up with your OTP, particularly useful if accessing the email on a different device or if the OTP tab is accidentally closed.
- **Dynamic URL Updates:** <br /> The URL updates with the current page, making it easy to share specific pages with others.
- **User Identification:** <br /> Upon logging in, your name is displayed in the upper right corner, providing a personalized experience.
- **Automated Carousel:** <br /> A simple carousel that updates its content every 3 seconds adds a dynamic element to the interface.
- **Time-Sensitive OTP:** <br /> Note that the OTP is valid for only 15 minutes, so prompt action is required.
- **Timer to Prevent Frequent OTP Generation:** <br />
 A timer mechanism restricts the generation of OTPs to prevent frequent requests from the same user, effectively thwarting brute-force attacks.
- **Login Attempt Lockout:** <br />  If a user inputs incorrect OTP or password values more than five consecutive times, a 5-minute lockout timer is triggered, further securing against brute-force attacks.


## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
