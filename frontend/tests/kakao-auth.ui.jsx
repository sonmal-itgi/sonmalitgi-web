import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import AuthPage from '../src/pages/auth/AuthPage.jsx';
import {authService} from '../src/lib/supabase.js';
vi.mock('../src/auth/context.js',()=>({useAuth:()=>({configured:true})}));
vi.mock('../src/lib/supabase.js',()=>({authService:{kakaoAvailable:vi.fn(),loginWithKakao:vi.fn()}}));
afterEach(()=>cleanup());
beforeEach(()=>{vi.clearAllMocks();});
it('enables Kakao login only when the provider is enabled',async()=>{
 authService.kakaoAvailable.mockResolvedValue(true);authService.loginWithKakao.mockResolvedValue({});
 render(<MemoryRouter initialEntries={['/login?next=%2Fdictionary']}><AuthPage /></MemoryRouter>);
 await waitFor(()=>expect(screen.getByRole('button',{name:'카카오로 로그인'}).disabled).toBe(false));
 fireEvent.click(screen.getByRole('button',{name:'카카오로 로그인'}));
 expect(authService.loginWithKakao).toHaveBeenCalledWith({origin:window.location.origin,next:'/dictionary'});
});
it('keeps the button disabled while Kakao app configuration is missing',async()=>{
 authService.kakaoAvailable.mockResolvedValue(false);
 render(<MemoryRouter><AuthPage /></MemoryRouter>);
 await waitFor(()=>expect(authService.kakaoAvailable).toHaveBeenCalledOnce());
 expect(screen.getByRole('button',{name:'카카오 로그인 준비 중'}).disabled).toBe(true);
 expect(authService.loginWithKakao).not.toHaveBeenCalled();
});
it('shows an actionable OAuth start error without removing password login',async()=>{
 authService.kakaoAvailable.mockResolvedValue(true);authService.loginWithKakao.mockRejectedValue(new Error('카카오 로그인을 시작하지 못했습니다.'));
 render(<MemoryRouter><AuthPage /></MemoryRouter>);
 fireEvent.click(await screen.findByRole('button',{name:'카카오로 로그인'}));
 expect(await screen.findByRole('alert')).toHaveProperty('textContent','카카오 로그인을 시작하지 못했습니다.');
 expect(screen.getByRole('button',{name:'로그인'})).toBeTruthy();
});
