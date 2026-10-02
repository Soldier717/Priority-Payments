// Separate the full circle-and-label bounds. Root stays fixed; other nodes
// move the minimum distance needed, with category anchors moving less.
export function separateNodes(nodes,bounds,{padding=16,passes=240}={}){
 for(let pass=0;pass<passes;pass++){
  let collisions=0;
  for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
   const a=nodes[i],b=nodes[j],ab=bounds.get(a.id),bb=bounds.get(b.id);
   if(!ab||!bb)continue;
   const ax=a.x+ab.x,ay=a.y+ab.y,bx=b.x+bb.x,by=b.y+bb.y;
   const ox=Math.min(ax+ab.width+padding,bx+bb.width+padding)-Math.max(ax-padding,bx-padding);
   const oy=Math.min(ay+ab.height+padding,by+bb.height+padding)-Math.max(ay-padding,by-padding);
   if(ox<=.05||oy<=.05)continue;
   const aw=a.kind==='root'?0:a.kind==='category'?.2:1,bw=b.kind==='root'?0:b.kind==='category'?.2:1,total=aw+bw;
   if(!total)continue;collisions++;
   const horizontal=ox<oy,axis=horizontal?'x':'y';
   const ac=horizontal?ax+ab.width/2:ay+ab.height/2,bc=horizontal?bx+bb.width/2:by+bb.height/2;
   const shift=((horizontal?ox:oy)+.1)*(ac<=bc?-1:1);
   a[axis]+=shift*aw/total;b[axis]-=shift*bw/total;
  }
  if(!collisions)break;
 }
 return nodes;
}
