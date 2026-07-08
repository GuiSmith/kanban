const buildImgSrc = (public_url) => {
    return `${process.env.OPERA_URL}/files/${public_url}`;
};

export default buildImgSrc;