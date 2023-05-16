export const getConfig = () => ({
  // ...
  secret: process.env.SECRET || "secretkey",
});
