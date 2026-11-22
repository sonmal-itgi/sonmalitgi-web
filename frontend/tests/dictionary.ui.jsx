vi.mock('../src/lib/live-landmarker', () => ({ createLiveLandmarker: vi.fn(async () => ({ close: vi.fn() })), clearStaleOverlay: vi.fn() }));
import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import Dictionary from '../src/pages/dictionary/Dictionary.jsx';
vi.mock('../src/lib/mediapipe', () => ({ createLandmarker: vi.fn(async () => ({ close: vi.fn() })), landmarkFrame: vi.fn(), drawLandmarks: vi.fn() }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it('shows continuous word candidates and releases camera on stop', async () => {
  const stop = vi.fn();
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: vi.fn(async () => ({ getTracks: () => [{ stop }] })) } });
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ clearRect: vi.fn() });
  let socket;
  class Socket {
    static OPEN = 1;
    constructor() { socket = this; this.send = vi.fn(); this.close = vi.fn(); }
  }
  vi.stubGlobal('WebSocket', Socket);
  render(<Dictionary />);
  fireEvent.click(screen.getByRole('button', { name: '카메라로 시작' }));
  await waitFor(() => expect(socket).toBeTruthy());
  act(() => socket.onopen());
  expect(JSON.parse(socket.send.mock.calls[0][0])).toEqual({ type: 'start', scope: 'intermediate' });
  act(() => socket.onmessage({ data: JSON.stringify({ type: 'prediction', stable: true, predicted_id: 'WORD1290', confidence: .92 }) }));
  expect(screen.getByRole('heading', { name: '감사' })).toBeTruthy();
  expect(screen.getByRole('button', { name: '인식 종료' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: '인식 종료' }));
  expect(stop).toHaveBeenCalledOnce();
  expect(socket.close).toHaveBeenCalledOnce();
  expect(screen.getByRole('heading', { name: '어떤 단어일까요?' })).toBeTruthy();
});

it('handles camera permission denial without opening a server connection', async () => {
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: vi.fn(async () => { throw new DOMException('denied', 'NotAllowedError'); }) } });
  render(<Dictionary />);
  fireEvent.click(screen.getByRole('button', { name: '카메라로 시작' }));
  expect(await screen.findByText('카메라 권한을 허용한 뒤 다시 시작해 주세요.')).toBeTruthy();
  expect(screen.getByRole('button', { name: '카메라로 시작' })).toBeTruthy();
});
