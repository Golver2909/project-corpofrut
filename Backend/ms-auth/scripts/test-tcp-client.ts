import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { AUTH_PATTERNS } from '../src/contracts/auth.contract';

async function main() {
  const client = ClientProxyFactory.create({
    transport: Transport.TCP,
    options: { host: 'localhost', port: 3010 },
  });

  await client.connect();

  const loginResult = await client
    .send(AUTH_PATTERNS.LOGIN, { email: 'admin@corpofrut.com', password: 'admin123' })
    .toPromise();

  console.log('LOGIN:', JSON.stringify(loginResult, null, 2));

  const validateResult = await client
    .send(AUTH_PATTERNS.VALIDATE_SESSION, { accessToken: loginResult.accessToken })
    .toPromise();

  console.log('VALIDATE_SESSION:', JSON.stringify(validateResult, null, 2));

  client.close();
}

main().catch((err) => {
  console.error('ERROR:', err);
  process.exit(1);
});