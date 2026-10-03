import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { CATEGORY_SLUGS, LAYOUTS, selectPhotos, groupPairs } from '../src/portfolio.js';
test('Each category and series excludes other categories and unpublished photos', () => {
  const photos = CATEGORY_SLUGS.flatMap(category_slug => [0,1].flatMap(section => [true,false].map(published => ({category_slug, section, published}))));
  for(const slug of CATEGORY_SLUGS) for(const section of [0,1]) {
    const selected = selectPhotos(photos,slug,section); assert.equal(selected.length,1); assert.deepEqual(selected[0],{category_slug:slug,section,published:true});
  }
  assert.equal(selectPhotos(photos,'all').length,10);
  assert.equal(selectPhotos(photos,"weddings' OR true --").length,0);
  assert.equal(LAYOUTS.length,6);
});
test('Pairs preserve sequence and keep an odd last image without duplication', () => {
  for(let count=0; count<=19; count++) {
    const items=Array.from({length:count},(_,i)=>i); const pairs=groupPairs(items);
    assert.deepEqual(pairs.flat(),items); assert.equal(pairs.length,Math.ceil(count/2));
    for(let i=0;i<pairs.length;i++) assert.equal(pairs[i].length,i===pairs.length-1 && count%2 ? 1 : 2);
  }
});
