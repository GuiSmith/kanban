const getCurrentUrl = () => {
    if(process.env.STAGE == 'production'){
        return 'http://localhost';
    }

    if(process.env.STAGE == 'development'){
        return 'http://localhost';
    }
}

export default getCurrentUrl;