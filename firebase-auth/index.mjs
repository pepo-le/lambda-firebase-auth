import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from "firebase-admin/auth";

const serviceAccount = {
  // ここにFirebase Admin SDKの秘密鍵を貼り付ける
};

initializeApp({
  credential: cert(serviceAccount),
});

export const handler = async (event) => {
  const token = event.headers.Authorization;

  try {
    const auth = getAuth();
    await auth.verifyIdToken(token);
    return {
      statusCode: 200,
      body: "Authorized"
    };
  } catch (error) {
    return {
      statusCode: 401,
      body: "Unauthorized"
    };
  }
};
