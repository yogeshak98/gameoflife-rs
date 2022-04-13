### 🔬 Test in Headless Browsers with `wasm-pack test`

```
wasm-pack test --chrome --headless
```

### To start the game
* Install rust nightly (mandatory for using wee_alloc).
* run `wasm-pack build` to create wasm files
* change working directory to `/www` and run `npm install` 
* run `npm run start` and open `localhost:8080` in browser.
