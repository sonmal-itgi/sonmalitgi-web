import { afterEach, expect, it, vi } from 'vitest';
import { createLiveLandmarker, clearStaleOverlay } from '../src/lib/live-landmarker.js';
afterEach(()=>vi.unstubAllGlobals());
it('keeps one frame in flight, drops queued frames, releases worker on close',async()=>{
 let worker; class FakeWorker {
  constructor(){worker=this;this.terminate=vi.fn();}
  postMessage(data){if(data.type==='init')queueMicrotask(()=>this.onmessage({data:{type:'ready'}}));}
 }
 vi.stubGlobal('Worker',FakeWorker);
 const bitmap={close:vi.fn()};vi.stubGlobal('createImageBitmap',vi.fn(async()=>bitmap));
 const model=await createLiveLandmarker();
 const first=model.detectForVideo({},1);
 await Promise.resolve();
 expect(await model.detectForVideo({},2)).toBeNull();
 worker.onmessage({data:{type:'result',result:{landmarks:[]}}});
 expect(await first).toEqual({landmarks:[]});
 const last=model.detectForVideo({},3);await Promise.resolve();model.close();
 expect(await last).toBeNull();expect(worker.terminate).toHaveBeenCalledOnce();
});
it('clears old overlay without changing fresh coordinates',()=>{
 const ctx={clearRect:vi.fn()}, canvas={width:640,height:480,getContext:()=>ctx};
 clearStaleOverlay(canvas,100,200);expect(ctx.clearRect).not.toHaveBeenCalled();
 clearStaleOverlay(canvas,100,301);expect(ctx.clearRect).toHaveBeenCalledOnce();
});
