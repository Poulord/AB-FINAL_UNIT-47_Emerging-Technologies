import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { CATEGORY_SLUGS, LAYOUTS, selectPhotos, groupPairs, collectionPhotos, collectionOptions, COLLECTION_TYPES } from '../src/portfolio.js';
test('Each category and series excludes other categories and unpublished photos', () => {
  const photos = CATEGORY_SLUGS.flatMap(category_slug => [0,1].flatMap(section => [true,false].map(published => ({category_slug, section, published}))));
  for(const slug of CATEGORY_SLUGS) for(const section of [0,1]) {
    const selected = selectPhotos(photos,slug,section); assert.equal(selected.length,1); assert.deepEqual(selected[0],{category_slug:slug,section,published:true});
  }
  assert.equal(selectPhotos(photos,'all').length,10);
  assert.equal(selectPhotos(photos,"weddings' OR true --").length,0);
  assert.equal(LAYOUTS.length,6);
});
test('Collections isolate weddings, sessions and campaigns without pairing across groups', () => {
  for (const category of CATEGORY_SLUGS) {
    assert.ok(COLLECTION_TYPES[category].guidance);
    const groups=[{id:'a',category_slug:category,section:0,position:2,name:'A'}, {id:'b',category_slug:category,section:0,position:1,name:'B'}, {id:'empty',category_slug:category,section:0,position:0,name:'Empty'}, {id:'secondary',category_slug:category,section:1,position:0,name:'Secondary'}, {id:'other',category_slug:'other',section:0,position:0,name:'Other'}];
    const photos=groups.flatMap(g=>Array.from({length:g.id==='empty'?0:3},(_,i)=>({id:`${g.id}${i}`,category_slug:g.category_slug,section:g.section,collection_id:g.id,published:i<2})));
    const selected=collectionPhotos(photos,groups,category,0);
    assert.deepEqual(selected.map(g=>g.group.id),['b','a']);
    assert.deepEqual(selected.flatMap(g=>g.photos.map(p=>p.id)),['b0','b1','a0','a1']);
    const odd=photos.map(p=>({...p,published:true}));
    const pairs=collectionPhotos(odd,groups,category,0).flatMap(g=>groupPairs(g.photos));
    assert.deepEqual(pairs.map(g=>g.length),[2,1,2,1]);
    assert.ok(pairs.every(g=>g.every(p=>p.collection_id===g[0].collection_id)));
    assert.equal(collectionPhotos(photos,groups,category,1).length,1);
    assert.equal(collectionOptions(groups,category).length,4);
    assert.equal(collectionPhotos(photos,groups,"weddings' OR true --",0).length,0);
  }
});
test('Pairs preserve sequence and keep an odd last image without duplication', () => {
  for(let count=0; count<=19; count++) {
    const items=Array.from({length:count},(_,i)=>i); const pairs=groupPairs(items);
    assert.deepEqual(pairs.flat(),items); assert.equal(pairs.length,Math.ceil(count/2));
    for(let i=0;i<pairs.length;i++) assert.equal(pairs[i].length,i===pairs.length-1 && count%2 ? 1 : 2);
  }
});
