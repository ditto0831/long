// ==UserScript==
// @name         Crack Script Test
// @namespace    test
// @version      0.1
// @match        https://crack.wrtn.ai/*
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  const box = document.createElement("div");
  box.textContent = "✅ 유저스크립트 실행됨";
  box.style.cssText = `
    position: fixed;
    top: 120px;
    right: 16px;
    z-index: 2147483647;
    background: #6A3DE8;
    color: white;
    padding: 10px 14px;
    border-radius: 9999px;
    font-size: 14px;
    font-weight: 700;
    box-shadow: 0 8px 20px rgba(0,0,0,.35);
  `;

  document.body.appendChild(box);
})();
