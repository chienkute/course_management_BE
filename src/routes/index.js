const userRouter = require("./user");
const courseCategoryRouter = require("./courseCategory");
const courseRouter = require("./course");
const orderRouter = require("./order");
const chapterRouter = require("./chapter");
const { notFound, errHandler } = require("../middleware/errHandler");

const initRoutes = (app) => {
  app.use("/api/user", userRouter);
  app.use("/api/coursecategory", courseCategoryRouter);
  app.use("/api/course", courseRouter);
  app.use("/api/order", orderRouter);
  app.use("/api/chapter", chapterRouter);

  app.use(notFound);
  app.use(errHandler);
};

module.exports = initRoutes;
