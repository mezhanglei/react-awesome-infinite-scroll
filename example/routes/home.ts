import loadable from "@/components/lazy";

export const Home = loadable({ loader: () => import(/* webpackChunkName: "home" */ '@/pages/home/index') });

export const HomeRoutes = [
    {
        path: "/home",
        component: Home,
        meta: {
            title: "首页",
        }
    }
];
