const buildImgSrc = (public_url) => {
    return `${process.env.OPERA_URL}/${public_url}`;
};

export default buildImgSrc;