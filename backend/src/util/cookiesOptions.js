// Cookie options suitable for cross-site dev (frontend :5173, API :5001)
const isProd = process.env.NODE_ENV === 'production';

const cookieOptions = (time = 0) => {
    return {
        httpOnly: true,
        secure: isProd ? true : false, // allow http on localhost; set true in prod
        sameSite: 'lax', // required for cross-site cookies when using credentials
        maxAge: time, // 1 hour
        path: '/',
    };
};

export default cookieOptions;
