import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compareFist,fistIssue} from '../src/lib/fist-feedback.js';
function hand(open=true){
 const p=Array.from({length:21},()=>({x:.5,y:.7,z:0}));
 p[0]={x:.5,y:.8,z:0};
 for(const [i,x] of [[5,.43],[9,.48],[13,.53],[17,.58]]){
   p[i]={x,y:.62,z:0};p[i+1]={x,y:.53,z:0};
   p[i+2]=open?{x,y:.46,z:0}:{x,y:.58,z:-.06};
   p[i+3]=open?{x,y:.40,z:0}:{x,y:.65,z:-.04};
 }
 return p;
}
const frame=(open=true)=>({left_hand:hand(open),right_hand:hand(false),image_width:640,image_height:480});
test('펴진 여러 손가락만 안내하고 주먹은 안내하지 않는다',()=>{
 assert.equal(compareFist(hand(true),640,480).underCurled,true);
 assert.equal(compareFist(hand(false),640,480).underCurled,false);
 assert.equal(fistIssue(frame(),true).id,'driving-fist-open');
 assert.equal(fistIssue(frame(false),true),null);
 assert.equal(fistIssue(frame(),false),null);
});
test('미검출·불완전 좌표·작은 손·화면 밖·측면은 판단하지 않는다',()=>{
 assert.equal(fistIssue({...frame(),right_hand:[]},true),null);
 assert.equal(compareFist(hand().map(({x,y})=>({x,y})),640,480),null);
 assert.equal(compareFist(hand().map(p=>({...p,x:.5+(p.x-.5)*.01,y:.5+(p.y-.5)*.01})),640,480),null);
 const edge=hand();edge[8].x=.99;assert.equal(compareFist(edge,640,480),null);
 const side=hand().map(p=>({x:.5,y:p.y,z:p.x-.5}));assert.equal(compareFist(side,640,480),null);
});

test('수형 안내도 지속 시간과 운전 단계 전환을 따른다',async()=>{
 const {createCaptureFeedback}=await import('../src/lib/capture-feedback.js');
 const update=createCaptureFeedback();
 assert.equal(update(frame(),true,0),null);
 assert.equal(update(frame(),true,400),null);
 assert.equal(update(frame(),true,800).id,'driving-fist-open');
 assert.equal(update(frame(false),true,900),null);
 assert.equal(update(frame(),false,1000),null);
});
