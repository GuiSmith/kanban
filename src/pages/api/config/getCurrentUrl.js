const getCurrentUrl = () => {

    if(process.env.STAGE == 'production'){
        const fullUrl = process.env.PRODUCTION_URL;

        return {
            fullUrl,
            origin: new URL(fullUrl).origin,
        }
    }

    if(process.env.STAGE == 'development'){
        return {
            fullUrl: `http://localhost:3000`,
            origin: `http://localhost`,
        };
    }

    throw new Error(`STAGE inválido: ${process.env.STAGE}`);
}

export default getCurrentUrl;