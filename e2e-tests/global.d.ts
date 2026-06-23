// Global type declarations for WebdriverIO E2E tests
// This file ensures `browser`, `describe`, `it`, `expect` are all recognized
// by TypeScript without any errors.

/// <reference types="@wdio/globals/types" />
/// <reference types="mocha" />
/// <reference types="node" />

declare global {
  // Ensure `browser` WebdriverIO global is typed
  const browser: WebdriverIO.Browser
  const $: WebdriverIO.ChainableSelectorPromise<WebdriverIO.Element>
  const $$: WebdriverIO.ChainableSelectorPromiseArray<WebdriverIO.Element[]>
}

export {}
