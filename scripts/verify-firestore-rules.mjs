const projectId = process.env.FIREBASE_EMULATOR_PROJECT_ID || 'demo-real-chat';

function toBaseUrl(explicitUrl, hostEnv, fallbackPort) {
  if (explicitUrl) {
    return explicitUrl;
  }

  if (hostEnv) {
    return `http://${hostEnv}`;
  }

  return `http://127.0.0.1:${fallbackPort}`;
}

const authBaseUrl = toBaseUrl(
  process.env.FIREBASE_AUTH_EMULATOR_URL,
  process.env.FIREBASE_AUTH_EMULATOR_HOST,
  9199
);
const firestoreBaseUrl = toBaseUrl(
  process.env.FIRESTORE_EMULATOR_URL,
  process.env.FIRESTORE_EMULATOR_HOST,
  8180
);
const apiKey = 'demo-api-key';
const timestampFields = new Set(['createdAt', 'updatedAt', 'lastCommentAt']);

function nowIso() {
  return new Date().toISOString();
}

function chatId(userId1, userId2) {
  const [uidA, uidB] = [String(userId1), String(userId2)].sort();
  return `dm:v1:${uidA.length}:${uidA}|${uidB.length}:${uidB}`;
}

function stringField(value) {
  return { stringValue: value };
}

function boolField(value) {
  return { booleanValue: value };
}

function timestampField(value = nowIso()) {
  return { timestampValue: value };
}

function listField(values) {
  return {
    arrayValue: {
      values: values.map((value) => stringField(value))
    }
  };
}

function fields(data) {
  const result = {};

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      result[key] = listField(value);
      return;
    }

    if (typeof value === 'boolean') {
      result[key] = boolField(value);
      return;
    }

    if (typeof value === 'number') {
      result[key] = { integerValue: String(value) };
      return;
    }

    if (timestampFields.has(key)) {
      result[key] = timestampField(value);
      return;
    }

    result[key] = stringField(String(value));
  });

  return { fields: result };
}

async function clearFirestore() {
  const response = await fetch(
    `${firestoreBaseUrl}/emulator/v1/projects/${projectId}/databases/(default)/documents`,
    { method: 'DELETE' }
  );

  if (!response.ok) {
    throw new Error(`Firestore emulator の初期化に失敗しました: ${response.status}`);
  }
}

async function createUser(label) {
  const email = `${label}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
  const response = await fetch(
    `${authBaseUrl}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email,
        password: 'passw0rd!',
        returnSecureToken: true
      })
    }
  );

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(`Auth emulator のユーザー作成に失敗しました: ${JSON.stringify(payload)}`);
  }

  return {
    email,
    uid: payload.localId,
    idToken: payload.idToken
  };
}

async function firestoreRequest({ method = 'GET', path, token, body }) {
  const response = await fetch(
    `${firestoreBaseUrl}/v1/projects/${projectId}/databases/(default)/documents/${path}`,
    {
      method,
      headers: {
        ...(body ? { 'content-type': 'application/json' } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    }
  );

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  return {
    ok: response.ok,
    status: response.status,
    payload
  };
}

function isPermissionDenied(response) {
  return !response.ok && response.payload?.error?.status === 'PERMISSION_DENIED';
}

async function expectAllowed(name, request) {
  const response = await request();
  if (!response.ok) {
    throw new Error(`${name} should be allowed but failed: ${response.status} ${JSON.stringify(response.payload)}`);
  }

  console.log(`PASS: ${name}`);
  return response;
}

async function expectDenied(name, request) {
  const response = await request();
  if (!isPermissionDenied(response)) {
    throw new Error(`${name} should be denied but got: ${response.status} ${JSON.stringify(response.payload)}`);
  }

  console.log(`PASS: ${name}`);
  return response;
}

async function run() {
  await clearFirestore();

  const alice = await createUser('alice');
  const bob = await createUser('bob');
  const charlie = await createUser('charlie');

  const aliceProfile = {
    displayName: 'Alice',
    username: 'Alice',
    email: alice.email,
    profileImageUrl: '',
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
  const bobProfile = {
    displayName: 'Bob',
    username: 'Bob',
    email: bob.email,
    profileImageUrl: '',
    createdAt: nowIso(),
    updatedAt: nowIso()
  };

  await expectAllowed('users create by self: alice', () =>
    firestoreRequest({
      method: 'PATCH',
      path: `users/${alice.uid}`,
      token: alice.idToken,
      body: fields(aliceProfile)
    })
  );

  await expectAllowed('users create by self: bob', () =>
    firestoreRequest({
      method: 'PATCH',
      path: `users/${bob.uid}`,
      token: bob.idToken,
      body: fields(bobProfile)
    })
  );

  await expectDenied('users list without auth', () =>
    firestoreRequest({ path: 'users' })
  );

  await expectAllowed('users list with auth', () =>
    firestoreRequest({
      path: 'users',
      token: bob.idToken
    })
  );

  await expectDenied('users update by other user', () =>
    firestoreRequest({
      method: 'PATCH',
      path: `users/${alice.uid}`,
      token: bob.idToken,
      body: fields({
        ...aliceProfile,
        profileImageUrl: 'https://example.com/hijack.png',
        updatedAt: nowIso()
      })
    })
  );

  await expectAllowed('users update by self', () =>
    firestoreRequest({
      method: 'PATCH',
      path: `users/${alice.uid}`,
      token: alice.idToken,
      body: fields({
        ...aliceProfile,
        isOnline: true,
        updatedAt: nowIso()
      })
    })
  );

  const threadId = 'thread-alpha';
  const threadBody = {
    title: 'Firestore Rules の相談',
    body: 'Rules をどこまで厳密に検証するべきか確認したいです。',
    tags: ['firebase', 'rules'],
    authorId: alice.uid,
    authorName: 'Alice',
    createdAt: nowIso(),
    updatedAt: nowIso()
  };

  await expectAllowed('threads create by author', () =>
    firestoreRequest({
      method: 'PATCH',
      path: `threads/${threadId}`,
      token: alice.idToken,
      body: fields(threadBody)
    })
  );

  await expectDenied('threads read without auth', () =>
    firestoreRequest({ path: `threads/${threadId}` })
  );

  await expectAllowed('threads read by authenticated user', () =>
    firestoreRequest({
      path: `threads/${threadId}`,
      token: bob.idToken
    })
  );

  await expectDenied('threads update by non-author', () =>
    firestoreRequest({
      method: 'PATCH',
      path: `threads/${threadId}`,
      token: bob.idToken,
      body: fields({
        ...threadBody,
        body: '乗っ取り更新',
        updatedAt: nowIso()
      })
    })
  );

  await expectAllowed('threads update by author', () =>
    firestoreRequest({
      method: 'PATCH',
      path: `threads/${threadId}`,
      token: alice.idToken,
      body: fields({
        ...threadBody,
        body: '作成者本人の更新',
        updatedAt: nowIso()
      })
    })
  );

  const commentId = 'comment-alpha';
  const commentBody = {
    body: 'コメント本文',
    authorId: bob.uid,
    authorName: 'Bob',
    createdAt: nowIso(),
    updatedAt: nowIso()
  };

  await expectAllowed('comments create by authenticated author', () =>
    firestoreRequest({
      method: 'PATCH',
      path: `threads/${threadId}/comments/${commentId}`,
      token: bob.idToken,
      body: fields(commentBody)
    })
  );

  await expectDenied('comments delete by non-author', () =>
    firestoreRequest({
      method: 'DELETE',
      path: `threads/${threadId}/comments/${commentId}`,
      token: alice.idToken
    })
  );

  await expectAllowed('comments update by author', () =>
    firestoreRequest({
      method: 'PATCH',
      path: `threads/${threadId}/comments/${commentId}`,
      token: bob.idToken,
      body: fields({
        ...commentBody,
        body: '更新したコメント本文',
        updatedAt: nowIso()
      })
    })
  );

  const dmId = 'dm-alpha';
  const dmBody = {
    chatId: chatId(alice.uid, bob.uid),
    senderId: alice.uid,
    senderName: 'Alice',
    receiverId: bob.uid,
    text: 'こんにちは',
    createdAt: nowIso()
  };

  await expectAllowed('directMessages create by sender', () =>
    firestoreRequest({
      method: 'PATCH',
      path: `directMessages/${dmId}`,
      token: alice.idToken,
      body: fields(dmBody)
    })
  );

  await expectAllowed('directMessages read by participant', () =>
    firestoreRequest({
      path: `directMessages/${dmId}`,
      token: bob.idToken
    })
  );

  await expectDenied('directMessages read by third party', () =>
    firestoreRequest({
      path: `directMessages/${dmId}`,
      token: charlie.idToken
    })
  );

  await expectDenied('directMessages spoofed sender create', () =>
    firestoreRequest({
      method: 'PATCH',
      path: 'directMessages/dm-spoofed',
      token: bob.idToken,
      body: fields({
        ...dmBody,
        senderId: alice.uid,
        senderName: 'Alice',
        receiverId: charlie.uid,
        chatId: chatId(alice.uid, charlie.uid),
        createdAt: nowIso()
      })
    })
  );

  await expectDenied('directMessages update denied', () =>
    firestoreRequest({
      method: 'PATCH',
      path: `directMessages/${dmId}`,
      token: alice.idToken,
      body: fields({
        ...dmBody,
        text: '本文の編集は不可',
        createdAt: nowIso()
      })
    })
  );

  console.log('All Firestore rules checks passed.');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
