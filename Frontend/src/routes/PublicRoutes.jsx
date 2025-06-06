import { lazy } from "react";


const Home = lazy(() => import("../pages/Home"));

export const publicRoutes = [{ path: "/", element: <Home /> }];