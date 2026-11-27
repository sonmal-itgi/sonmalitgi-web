import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthService, validateCredentials } from '../src/lib/auth.js';

test('invalid usernames, blank names and short passwords never reach signup', async () => {
  const service = createAuthService({ functions: { invoke() { assert.fail('must not call server'); } } });
  for (const values of [
    { username: 'a@b.com', name: '테스트', password: 'longpassword' },
    { username: 'valid_user', name: ' ', password: 'longpassword' },
    { username: 'valid_user', name: '테스트', password: 'short' },
  ]) await assert.rejects(service.signup(values));
  assert.equal(validateCredentials({ username: ' TEST_User ', password: 'pw' }), 'test_user');
});

test('signup sends only username/name/password to the server and then authenticates', async () => {
  const service = createAuthService({
    functions: { async invoke(name, { body }) {
      assert.equal(name, 'username-signup');
      assert.deepEqual(body, { username: 'test_user', name: '테스트', password: 'Password#123' });
      return { data: { ok: true } };
    } },
    auth: { async signInWithPassword(credentials) {
      assert.equal(credentials.email, 'test_user@accounts.sonmalitgi.invalid');
      return { data: { session: { user: { id: 'member-id' } } } };
    } },
  });
  const data = await service.signup({ username: 'Test_User', name: ' 테스트 ', password: 'Password#123' });
  assert.equal(data.session.user.id, 'member-id');
});

test('duplicate signup returns Korean error and does not log in', async () => {
  const service = createAuthService({ functions: { async invoke() {
    return { error: { context: { async json() { return { code: 'user_already_exists' }; } } } };
  } } });
  await assert.rejects(service.signup({ username: 'test_user', name: '테스트', password: 'Password#123' }), /이미 사용 중/);
});

test('bad credentials and failed automatic login cannot report success', async () => {
  const client = { functions: { async invoke() { return { data: { ok: true } }; } },
    auth: { async signInWithPassword() { return { error: { code: 'invalid_credentials' } }; } } };
  const service = createAuthService(client);
  await assert.rejects(service.login({ username: 'test_user', password: 'wrong' }), /아이디 또는 비밀번호/);
  await assert.rejects(service.signup({ username: 'test_user', name: '테스트', password: 'Password#123' }), /가입이 완료되었습니다/);
});

test('missing configuration fails clearly', async () => {
  await assert.rejects(createAuthService(null).login({ username: 'test_user', password: 'password' }), /연결을 준비 중/);
});

test('Kakao OAuth redirects to our login and rejects external return paths', async () => {
  const calls=[];
  const service=createAuthService({auth:{async signInWithOAuth(value){calls.push(value);return {data:{url:'https://auth.example/authorize'}};}}});
  await service.loginWithKakao({origin:'https://sonmal.example',next:'https://evil.example'});
  assert.equal(calls[0].provider,'kakao');
  assert.equal(calls[0].options.redirectTo,'https://sonmal.example/login?next=%2Flevel');
  assert.equal(calls[0].options.scopes,'profile_nickname');
  await service.loginWithKakao({origin:'https://sonmal.example',next:'/dictionary'});
  assert.equal(new URL(calls[1].options.redirectTo).searchParams.get('next'),'/dictionary');
});

test('Kakao availability uses only public project settings', async () => {
  const service=createAuthService({}, {url:'https://example.supabase.co',key:'public-key',fetcher:async(url,options)=>{
    assert.equal(url,'https://example.supabase.co/auth/v1/settings');
    assert.deepEqual(options.headers,{apikey:'public-key'});
    return {ok:true,json:async()=>({external:{kakao:true}})};
  }});
  assert.equal(await service.kakaoAvailable(),true);
  assert.equal(await createAuthService(null).kakaoAvailable(),false);
});
