import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { validateFile, MAX_FILE_BYTES } from '../src/images.js';
test('Reject unsupported and oversized uploads before decoding', () => {
  assert.throws(() => validateFile({name:'payload.svg',size:12}));
  assert.throws(() => validateFile({name:'large.jpg',size:MAX_FILE_BYTES+1}));
  for (const name of ['photo.JPG','photo.webp','photo.heic','photo.heif','photo.png']) assert.doesNotThrow(() => validateFile({name,size:100}));
});
