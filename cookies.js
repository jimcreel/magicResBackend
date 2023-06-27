const tough = require('tough-cookie');
const axios = require('axios');

const cookieJar = new tough.CookieJar();

// Create an Axios instance with custom configuration
const axiosWithCookieJar = axios.create({
  jar: cookieJar,
  withCredentials: true
});

async function getAllRestaurants(req) {
  const result = await axiosWithCookieJar.get(`https://disneyland.disney.go.com/authentication/status/`);
  const accessToken = result;
  console.log(accessToken);
  const tokenHeader = result.data.csrf.header
  console.log(tokenHeader);
  const cookieString = result.headers['set-cookie'];

  // Extract necessary cookie values
  let akavpauKey = cookieString[4].split(';')[0].split('=')[0];
  let akavpauValue = cookieString[4].split(';')[0].split('=')[1];
  let abckKey = cookieString[5].split(';')[0].split('=')[0];
  let abckValue = cookieString[5].split(';')[0].split('=')[1];
  let bmscKey = cookieString[6].split(';')[0].split('=')[0];
  let bmscValue = cookieString[6].split(';')[0].split('=')[1];
  let bm_szKey = cookieString[7].split(';')[0].split('=')[0];
  let bm_szValue = cookieString[7].split(';')[0].split('=')[1];
  let geoKey = cookieString[3].split(';')[0].split('=')[0];

  let geoValue = cookieString[3].split(';')[0].split('=')[1];

  let header = {
    'authority': 'disneyland.disney.go.com',
    'method': 'GET',
    'scheme': 'https',
    'accept': 'application/json',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-US,en;q=0.9,es;q=0.8',
    'Authorization': `BEARER ${accessToken}`,
    'cookie': `geo=${geoValue}; ${bm_szKey}=${bm_szValue}; ${bmscKey}=${bmscValue}; ${abckKey}=${abckValue}; ${akavpauKey}=${akavpauValue};`,
    'referer': 'https://disneyland.disney.go.com/dining/',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
  };

  // Set cookies in the cookie jar
  let cookie = new tough.Cookie({
    key: akavpauKey,
    value: akavpauValue,
    domain: 'disneyland.disney.go.com',
    httpOnly: true,
    maxAge: 31536000
  });
  cookieJar.setCookie(cookie, 'https://disneyland.disney.go.com');

  let cookie2 = new tough.Cookie({
    key: abckKey,
    value: abckValue,
    domain: 'disneyland.disney.go.com',
    httpOnly: true,
    maxAge: 31536000
  });
  cookieJar.setCookie(cookie2, 'https://disneyland.disney.go.com');

  let cookie3 = new tough.Cookie({
    key: bmscKey,
    value: bmscValue,
    domain: 'disneyland.disney.go.com',
    httpOnly: true,
    maxAge: 31536000
  });
  cookieJar.setCookie(cookie3, 'https://disneyland.disney.go.com');

  let cookie4 = new tough.Cookie({
    key: bm_szKey,
    value: bm_szValue,
    domain: 'disneyland.disney.go.com',
    httpOnly: true,
    maxAge: 31536000
  });
  cookieJar.setCookie(cookie4, 'https://disneyland.disney.go.com');

  let cookie5 = new tough.Cookie({
    key: geoKey,
    value: geoValue,
    domain: 'disneyland.disney.go.com',
    httpOnly: true,
    maxAge: 31536000
  });
  cookieJar.setCookie(cookie5, 'https://disneyland.disney.go.com');

  let cookie6 = new tough.Cookie({
    key: tokenHeader,
    value: accessToken,
    domain: 'disneyland.disney.go.com',
    httpOnly: true,
    maxAge: 31536000
  });
  cookieJar.setCookie(cookie6, 'https://disneyland.disney.go.com');

  console.log(header);
  const result2 = await axiosWithCookieJar.get(
    `https://disneyland.disney.go.com/finder/api/v1/explorer-service/list-ancestor-entities/dlr/80008297;entityType=destination/2023-06-22/dining`,
    { headers: header }
  );
}

getAllRestaurants();
