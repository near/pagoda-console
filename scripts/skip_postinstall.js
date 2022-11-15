// We have a postinstall script to build the database and eslint packages. We don't need these packages to be built in Vercel's CI when building the frontend and this script allows us to skip this step.
// Vercel environment variables: https://vercel.com/docs/concepts/projects/environment-variables#system-environment-variables
if (process.env.VERCEL === "1" && process.env.CI === "1") {
  process.exit(0);
} else {
  process.exit(1);
}
