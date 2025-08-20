// Cookie options suitable for cross-site dev (frontend :5173, API :5001)
const isProd = process.env.NODE_ENV === 'production';

const cookieOptions = {
    httpOnly: true,
    secure: isProd ? true : false, // allow http on localhost; set true in prod
    sameSite: 'lax', // required for cross-site cookies when using credentials
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
};

export default cookieOptions;
