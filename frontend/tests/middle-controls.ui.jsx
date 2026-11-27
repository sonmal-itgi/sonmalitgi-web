import {afterEach,expect,it,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {SignEvaluation} from '../src/pages/practice/Practice.jsx';
vi.mock('../src/lib/live-landmarker',()=>({createLiveLandmarker:vi.fn(async()=>({close:vi.fn()})),clearStaleOverlay:vi.fn()}));
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});
it.each(['WORD1290','WORD1201','WORD1589','WORD1191','WORD1185','WORD1342','WORD1343','WORD1345','WORD1149','WORD1295','WORD1274'])('uses identical next-performance controls for %s',async targetId=>{
 Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:vi.fn(async()=>({getTracks:()=>[{stop:vi.fn()}]}))}});
 vi.spyOn(HTMLMediaElement.prototype,'play').mockResolvedValue();
 vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue({clearRect:vi.fn()});
 let socket;
 class Socket { static OPEN=1; constructor(){socket=this;this.readyState=1;this.send=vi.fn();this.close=vi.fn();} }
 vi.stubGlobal('WebSocket',Socket);
 render(<SignEvaluation evaluationKind="word" targetId={targetId} />);
 const next=screen.getByRole('button',{name:'다음 동작 시작'});
 expect(next.disabled).toBe(true);
 fireEvent.click(screen.getByRole('button',{name:'평가 시작'}));
 await waitFor(()=>expect(socket).toBeTruthy());
 act(()=>socket.onopen());
 const receive=msg=>act(()=>socket.onmessage({data:JSON.stringify(msg)}));
 receive({type:'ready'});
 receive({type:'prediction',result:'RETRY',success_count:1,success_required:3,waiting_for_reset:true});
 expect(next.disabled).toBe(false);
 fireEvent.click(next);
 expect(JSON.parse(socket.send.mock.calls.at(-1)[0])).toEqual({type:'next_repetition'});
 receive({type:'repetition_ready',result:'RETRY',success_count:1,success_required:3,waiting_for_reset:false});
 expect(screen.getByRole('button',{name:'다음 동작 시작'}).disabled).toBe(true);
 expect(screen.getByText('1/3')).toBeTruthy();
});
