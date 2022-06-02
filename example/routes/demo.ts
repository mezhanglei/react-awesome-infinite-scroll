import loadable from "../components/lazy";

export const Demo = loadable({ loader: () => import('../demo/index') });

export const DemoRoutes = [
  {
    path: "/",
    component: Demo
  }
];
