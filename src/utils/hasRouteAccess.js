import getToken from './getToken';

const routes = {
    public: [
        '/',
        '/sobre',
    ],
    guest: [
        '/usuarios/login',
        '/usuarios/novo',
    ],
};

const hasRouteAccess = (route) => {
    try {
        const isLoggedIn = Boolean(getToken());
        const isPublicRoute = routes.public.includes(route);
        const isGuestRoute = routes.guest.includes(route);

        // console.table({
        //     route,
        //     logged: isLoggedIn,
        //     public: isPublicRoute,
        //     guest: isGuestRoute,
        //     final: (() => {
        //         // Se é rota pública => sim
        //         if (isPublicRoute) return true;

        //         // Se tá logado e é rota de convidado => não
        //         if (isLoggedIn && isGuestRoute) return false;

        //         // Se não tá logado e não é rota de convidado => não
        //         if (!isLoggedIn && !isGuestRoute) return false;

        //         return true;
        //     })()
        // });

        // Se é rota pública => sim
        if (isPublicRoute) return true;

        // Se tá logado e é rota de convidado => não
        if (isLoggedIn && isGuestRoute) return false;

        // Se não tá logado e não é rota de convidado => não
        if(!isLoggedIn && !isGuestRoute) return false;

        return true;

    } catch (error) {
        console.log(`Erro na verificação de rota ${route}`, error);
        return false;
    }
};

export default hasRouteAccess;