import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateRoomCode, getSessionId } from './roomService';

describe('roomService', () => {
  beforeEach(() => {
    // localStorageをクリア
    window.localStorage.clear();
  });

  describe('generateRoomCode', () => {
    it('should generate a 6-character code', () => {
      const code = generateRoomCode();
      expect(code).toHaveLength(6);
    });

    it('should only contain uppercase letters and numbers', () => {
      const code = generateRoomCode();
      expect(code).toMatch(/^[A-Z0-9]{6}$/);
    });

    it('should generate different codes', () => {
      const code1 = generateRoomCode();
      const code2 = generateRoomCode();
      const code3 = generateRoomCode();

      // At least one should be different
      const allSame = code1 === code2 && code2 === code3;
      expect(allSame).toBe(false);
    });
  });

  describe('getSessionId', () => {
    it('should generate a session ID if none exists', () => {
      const sessionId = getSessionId();
      expect(sessionId).toBeTruthy();
      expect(sessionId).toMatch(/^session_/);
    });

    it('should return the same session ID on subsequent calls', () => {
      const sessionId1 = getSessionId();
      const sessionId2 = getSessionId();

      expect(sessionId1).toBe(sessionId2);
    });

    it('should persist session ID in localStorage', () => {
      const sessionId = getSessionId();
      const stored = window.localStorage.getItem('codenames_session_id');

      expect(stored).toBe(sessionId);
    });

    it('should reuse existing session ID from localStorage', () => {
      const existingId = 'session_12345';
      window.localStorage.setItem('codenames_session_id', existingId);

      const sessionId = getSessionId();
      expect(sessionId).toBe(existingId);
    });
  });
});
