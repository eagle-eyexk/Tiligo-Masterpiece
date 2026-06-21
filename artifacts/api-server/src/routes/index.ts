import { Router, type IRouter } from "express";
import healthRouter from "./health";
import businessesRouter from "./businesses";
import productsRouter from "./products";
import offersRouter from "./offers";
import ordersRouter from "./orders";
import deliveriesRouter from "./deliveries";
import couponsRouter from "./coupons";
import settingsRouter from "./settings";
import ticketsRouter from "./tickets";
import dashboardRouter from "./dashboard";
import customersRouter from "./customers";

const router: IRouter = Router();

router.use(healthRouter);
router.use(businessesRouter);
router.use(productsRouter);
router.use(offersRouter);
router.use(ordersRouter);
router.use(deliveriesRouter);
router.use(couponsRouter);
router.use(settingsRouter);
router.use(ticketsRouter);
router.use(dashboardRouter);
router.use(customersRouter);

export default router;
