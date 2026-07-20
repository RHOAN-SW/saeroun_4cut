import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';

const Screen = styled.main`
  width: 100%;
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 28px 24px calc(28px + env(safe-area-inset-bottom));
  background: ${({ theme }) => theme.colors.background};
`;

const Card = styled.form`
  width: min(440px, 100%);
  padding: clamp(28px, 5vw, 42px);
  border-radius: 28px;
  background: #fff;
  text-align: center;
  box-shadow: 0 18px 54px rgba(0, 0, 0, .08);

  img { width: 180px; max-width: 58%; }
  h1 { margin-top: 28px; color: ${({ theme }) => theme.colors.text}; font-size: 25px; line-height: 1.35; }
  p { margin-top: 8px; color: ${({ theme }) => theme.colors.secondaryText}; font-size: 14px; line-height: 1.55; }
`;

const CodeInput = styled.input`
  width: 100%;
  height: 64px;
  margin-top: 28px;
  border: 2px solid ${({ $error }) => $error ? '#f04452' : '#e5e8eb'};
  border-radius: 18px;
  background: #f9fafb;
  color: ${({ theme }) => theme.colors.text};
  font: 700 23px ui-monospace, SFMono-Regular, Menlo, monospace;
  letter-spacing: .3em;
  text-align: center;
  text-transform: lowercase;
  outline: none;
  transition: border-color 150ms ease, background 150ms ease;

  &:focus { border-color: ${({ theme }) => theme.colors.accent}; background: #fff; }
`;

const LoginButton = styled.button`
  width: 100%;
  min-height: 58px;
  margin-top: 12px;
  border: 0;
  border-radius: ${({ theme }) => theme.radius.button};
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font: inherit;
  font-size: 16px;
  font-weight: 700;
  transition: transform 120ms ease, opacity 120ms ease;
  &:active:not(:disabled) { transform: scale(.98); }
  &:disabled { opacity: .42; }
`;

const Message = styled.div`
  min-height: 20px;
  margin-top: 10px;
  color: #e42939;
  font-size: 13px;
`;

const Loading = styled.div`
  color: ${({ theme }) => theme.colors.secondaryText};
  font-size: 14px;
`;

export default function AuthGate({ children }) {
  const [status, setStatus] = useState('loading');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/auth', { cache: 'no-store' })
      .then(response => response.json())
      .then(data => setStatus(data.authenticated ? 'authenticated' : 'login'))
      .catch(() => setStatus('login'));
  }, []);

  const login = async event => {
    event.preventDefault();
    if (code.length !== 6 || status === 'submitting') return;
    setStatus('submitting');
    setMessage('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '코드를 다시 확인해주세요.');
      setStatus('authenticated');
    } catch (error) {
      setMessage(error.message);
      setStatus('login');
    }
  };

  if (status === 'authenticated') return children;
  if (status === 'loading') return <Screen><Loading>스튜디오를 준비하고 있어요...</Loading></Screen>;

  return (
    <Screen>
      <Card onSubmit={login}>
        <img src="/logo.png" alt="JR self studio" />
        <h1>스튜디오 코드 입력</h1>
        <p>두 iPad에서 같은 6자리 코드를 사용하면 돼요.</p>
        <CodeInput
          value={code}
          onChange={event => setCode(event.target.value.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 6))}
          maxLength={6}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          inputMode="text"
          autoFocus
          aria-label="6자리 스튜디오 코드"
          aria-invalid={Boolean(message)}
          $error={Boolean(message)}
        />
        <LoginButton type="submit" disabled={code.length !== 6 || status === 'submitting'}>
          {status === 'submitting' ? '확인하는 중...' : '시작하기'}
        </LoginButton>
        <Message role="alert">{message}</Message>
      </Card>
    </Screen>
  );
}
