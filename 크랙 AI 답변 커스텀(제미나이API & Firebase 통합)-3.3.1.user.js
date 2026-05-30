// ==UserScript==
// @name         크랙 AI 답변 커스텀(제미나이API & Firebase 통합) - 구버전 안정성 패치
// @namespace    http://tampermonkey.net/
// @version      3.3.5
// @description  저장 튕김 버그 완전 해결, 17.0 버전의 완벽한 플로팅 버튼(꾹 눌러 이동) 로직 이식
// @match        https://crack.wrtn.ai/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_xmlhttpRequest
// @connect      generativelanguage.googleapis.com
// ==/UserScript==

(function () {
  "use strict";

  const API_BASE = "https://crack-api.wrtn.ai/crack-gen";

  let generatedHistory = [];
  let historyIndex = -1;

  function getChatRoomId() {
    const match = location.pathname.match(
      /\/stories\/[^/]+\/episodes\/([^/]+)/,
    );
    return match ? match[1] : "global_room";
  }

  // =============================================
  // 1. 스타일 (플로팅 버튼 구버전 방식 적용)
  // =============================================
  GM_addStyle(`
        /* 🌟 플로팅 설정 버튼 (구버전처럼 고정적이고 직관적인 스타일) */
        #crack-floating-btn {
            position: fixed; top: 120px; right: 20px; z-index: 999999;
            background-color: #6A3DE8; color: white; border: none;
            padding: 10px 16px; border-radius: 50px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-size: 13px; font-weight: bold; font-family: var(--font-sans, sans-serif);
            display: flex; align-items: center; gap: 8px;
            cursor: pointer; user-select: none; touch-action: none;
            transition: opacity 0.2s, transform 0.2s;
        }

        /* 채팅창 내 매직 버튼 및 위젯 */
        .crack-right-group { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .crack-pure-magic {
            height: 1.75rem; width: 1.75rem; min-width: 1.75rem; border-radius: 9999px;
            background-color: #6A3DE8; color: white; display: inline-flex; align-items: center; justify-content: center;
            cursor: pointer; border: none; padding: 0; box-shadow: 0 4px 6px var(--shadow-md); transition: all 0.2s;
        }
        .crack-pure-magic:hover { transform: scale(1.1); filter: brightness(0.9); }

        .crack-history-widget {
            display: none; align-items: center; gap: 8px;
            background: var(--bg_elevated_primary, #fff); border: 1px solid var(--border, #ddd);
            border-radius: 12px; padding: 4px 10px; font-size: 13px; font-weight: bold; color: var(--text_primary, #000);
        }
        .crack-history-btn { cursor: pointer; color: var(--text_secondary, #666); transition: 0.2s; user-select: none; }
        .crack-history-btn:hover { color: var(--text_brand, #6A3DE8); transform: scale(1.1); }

        /* AI 패널 설정 */
        #crack-ai-panel {
            position: fixed; top: 80px; right: 30px; z-index: 999998;
            width: min(560px, 90vw); max-height: 85vh;
            background-color: var(--bg_screen, #fff); border: 1px solid var(--border, #ddd); border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5); color: var(--text_primary, #000); font-family: var(--font-sans, sans-serif);
            display: none; flex-direction: column; overflow: hidden;
        }

        .panel-header {
            padding: 16px 20px; background-color: var(--bg_elevated_primary, #f5f5f5);
            border-bottom: 1px solid var(--border, #ddd); display: flex; justify-content: space-between; align-items: center;
            cursor: move; user-select: none; touch-action: none;
        }
        .panel-title { font-size: 16px; font-weight: 800; color: var(--text_brand, #6A3DE8); display: flex; align-items: center; gap: 6px; }
        .panel-close { cursor: pointer; font-size: 18px; color: var(--text_secondary, #666); transition: 0.2s; padding: 0 5px; }
        .panel-close:hover { color: #ff4444; transform: scale(1.1); }

        .panel-content { padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 24px; }
        .panel-content::-webkit-scrollbar { width: 6px; }
        .panel-content::-webkit-scrollbar-thumb { background: var(--border, #ccc); border-radius: 10px; }

        .setting-group { display: flex; flex-direction: column; gap: 8px; }
        .setting-label { font-size: 12px; color: var(--text_secondary, #666); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;}

        .info-box { background: var(--bg_elevated_primary, #f9f9f9); border: 1px solid var(--border, #ddd); border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
        .info-title { font-size: 12px; color: var(--text_action_blue_primary, #0056b3); font-weight: 800; display: flex; align-items: center; gap: 4px; }
