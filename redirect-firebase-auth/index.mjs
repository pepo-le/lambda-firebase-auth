import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

// AWS SDKを使用してLambda関数を呼び出すロジック
const LAMBDA_FUNCTION_NAME = 'firebase_auth';
const LAMBDA_REGION = 'us-east-1';

export const handler = async (event) => {
  const request = event.Records[0].cf.request;
  const token = request.headers.authorization ? request.headers.authorization[0].value : null;

  if (!token) {
    return generateResponse(401, 'Unauthorized');
  }

  // 別のLambda関数を呼び出し
  const authResponse = await callAuthLambdaFunction(token);

  if (authResponse.statusCode !== 200) {
    return generateResponse(401, 'Unauthorized');
  }

  // 認証が成功した場合、リクエストを元のCloudFrontディストリビューションにフォワードする
  return request;
};

function generateResponse(status, statusText) {
  return {
    status: String(status),
    statusDescription: statusText,
    body: statusText
  };
}

async function callAuthLambdaFunction(token) {

  const lambdaClient = new LambdaClient({ region: LAMBDA_REGION });

  const params = {
    FunctionName: LAMBDA_FUNCTION_NAME,
    InvocationType: 'RequestResponse',  // レスポンスを待ち受ける設定
    Payload: JSON.stringify({ token: token })
  };

  try {
    const result = await lambdaClient.send(new InvokeCommand(params));
    return JSON.parse(new TextDecoder().decode(result.Payload));  // Lambda関数のレスポンスを返す
  } catch (error) {
    console.error("Error invoking Lambda function:", error);
    throw error;
  }
}
