import CryptoJS from "crypto-js";

function generateXSignature(url, body = "") {
  const timestamp = '1755062701'
  const pathname = new URL(url).pathname;
  console.log(pathname);

  let bodyString = "";
  if (typeof body === "string" && body.length > 0) {
    bodyString = body;
  } else if (body instanceof FormData) {
    bodyString = "multipart/form-data";
  }

  const signString = `${pathname}|${timestamp}|${''}`;
  const secretKey = "ydqXY0ocnFLmJGHr_zNzFcpjwAsXq_8JcBNURAkRscg";

  const signature = CryptoJS.HmacSHA256(signString, secretKey)
                             .toString(CryptoJS.enc.Base64);

  return { timestamp, signature };
}

// 사용 예시
const { timestamp, signature } = generateXSignature(
  "https://cgv.co.kr/cnm/atkt/searchSchByMov?coCd=A420&siteNo=0013&scnYmd=20250827&movNo=89833&rtctlScopCd=08",
  '{"param":"value"}'
);

console.log("X-TIMESTAMP:", timestamp);
console.log("X-SIGNATURE:", signature);

