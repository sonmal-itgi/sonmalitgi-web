export const USERNAME_PATTERN = /^[a-z0-9_]{4,20}$/;
export const AUTH_DOMAIN = 'accounts.sonmalitgi.invalid';

export function normalizeUsername(value) {
  return value.trim().toLowerCase();
}

export function validateCredentials({ username, password, name }, signup = false) {
  const normalized = normalizeUsername(username);
  if (!USERNAME_PATTERN.test(normalized)) throw new Error('아이디는 영문, 숫자, 밑줄(_)로 4~20자 입력해주세요.');
  if (!password || (signup && password.length < 8)) {
    throw new Error(signup ? '비밀번호는 8자 이상 입력해주세요.' : '비밀번호를 입력해주세요.');
  }
  if (signup && password.length > 128) throw new Error('비밀번호가 너무 깁니다.');
  if (signup && (!name?.trim() || name.trim().length > 50)) throw new Error('이름은 1~50자로 입력해주세요.');
  return normalized;
}

export function authErrorMessage(error) {
  const messages = {
    invalid_credentials: '아이디 또는 비밀번호가 올바르지 않습니다.',
    user_already_exists: '이미 사용 중인 아이디입니다.',
    email_exists: '이미 사용 중인 아이디입니다.',
    email_not_confirmed: '회원가입 설정을 확인해야 합니다. 관리자에게 문의해주세요.',
    signup_disabled: '현재 회원가입이 중지되어 있습니다.',
    weak_password: '더 안전한 비밀번호를 입력해주세요.',
    over_request_rate_limit: '요청이 많습니다. 잠시 후 다시 시도해주세요.',
    over_email_send_rate_limit: '회원가입 설정을 확인해야 합니다. 관리자에게 문의해주세요.',
    unexpected_failure: '회원 정보를 저장하지 못했습니다. 잠시 후 다시 시도해주세요.',
  };
  if (messages[error?.code]) return messages[error.code];
  if (error?.name === 'AuthRetryableFetchError' || error instanceof TypeError) return '서버에 연결할 수 없습니다. 네트워크를 확인해주세요.';
  return '요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.';
}

export function createAuthService(client) {
  function requireClient() {
    if (!client) throw new Error('회원 서비스 연결을 준비 중입니다. 잠시 후 다시 이용해주세요.');
    return client;
  }
  return {
    async signup(values) {
      const username = validateCredentials(values, true);
      const api = requireClient();
      const { data, error } = await api.functions.invoke('username-signup', {
        body: { username, name: values.name.trim(), password: values.password },
      });
      if (error) {
        let code = error.code;
        try { code = (await error.context?.json())?.code || code; } catch { /* Use generic error. */ }
        throw new Error(authErrorMessage({ code }));
      }
      if (!data?.ok) throw new Error('회원 정보를 저장하지 못했습니다. 다시 시도해주세요.');
      const { data: loginData, error: loginError } = await api.auth.signInWithPassword({
        email: `${username}@${AUTH_DOMAIN}`, password: values.password,
      });
      if (loginError || !loginData?.session) throw new Error('가입이 완료되었습니다. 로그인 화면에서 로그인해주세요.');
      return loginData;
    },
    async login(values) {
      const username = validateCredentials(values);
      const { data, error } = await requireClient().auth.signInWithPassword({
        email: `${username}@${AUTH_DOMAIN}`, password: values.password,
      });
      if (error) throw new Error(authErrorMessage(error));
      if (!data.session) throw new Error('로그인 정보를 확인할 수 없습니다. 다시 시도해주세요.');
      return data;
    },
    async logout() {
      const { error } = await requireClient().auth.signOut({ scope: 'local' });
      if (error) throw new Error(authErrorMessage(error));
    },
    async getProfile(userId) {
      const { data, error } = await requireClient().from('member_profiles')
        .select('id, username, name, created_at').eq('id', userId).single();
      if (error) throw new Error('회원 정보를 불러오지 못했습니다. 다시 로그인해주세요.');
      return data;
    },
  };
}
