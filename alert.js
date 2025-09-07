/*!
 * Mobile Alert Widget for StreamElements
 * Version 1.0.0
 * https://github.com/yourname/mobile-alert-widget
 * 
 * Copyright (c) 2025 Your Name
 * Licensed under MIT License
 */

(function(window, document) {
  'use strict';

  // Widget Configuration
  class MobileAlertWidget {
    constructor(config = {}) {
      this.config = {
        alertSound: config.alertSound || '',
        alertVolume: parseInt(config.alertVolume) || 50,
        backgroundVideo: config.backgroundVideo || '',
        textAppearanceDelay: parseInt(config.textAppearanceDelay) || 7,
        alertDuration: parseInt(config.alertDuration) || 13,
        monetaryColor: config.monetaryColor || '#34D399',
        infoBoxBaseColor: config.infoBoxBaseColor || '#FF6B6B'
      };
      
      this.audio = null;
      this.timers = { in: null, reveal: null, out: null };
      this.isInitialized = false;
      
      this.init();
    }

    init() {
      if (this.isInitialized) return;
      
      this.setupColors();
      this.bindEvents();
      this.isInitialized = true;
    }

    // StreamElements compatibility layer
    static createFromSE() {
      const readSE = (raw, fallback) => {
        if (typeof raw === 'string' && raw.startsWith('{') && raw.endsWith('}')) return fallback;
        return raw || fallback;
      };

      return new MobileAlertWidget({
        alertSound: readSE('{alertSound}', ''),
        alertVolume: readSE('{alertVolume}', 50),
        backgroundVideo: readSE('{backgroundVideo}', ''),
        textAppearanceDelay: readSE('{textAppearanceDelay}', 7),
        alertDuration: readSE('{alertDuration}', 13),
        monetaryColor: readSE('{monetaryColor}', '#34D399'),
        infoBoxBaseColor: readSE('{infoBoxBaseColor}', '#FF6B6B')
      });
    }

    clearTimers() {
      Object.values(this.timers).forEach(timer => {
        if (timer) clearTimeout(timer);
      });
      this.timers = { in: null, reveal: null, out: null };
    }

    setupVideo() {
      const video = document.querySelector('#backgroundVideo');
      if (!video || !this.config.backgroundVideo) return;
      
      if (video.src !== this.config.backgroundVideo) {
        video.pause();
        video.src = this.config.backgroundVideo;
        video.muted = true;
        video.load();
        video.play().catch(() => {});
      }
    }

    playSound() {
      if (!this.config.alertSound) return;
      
      if (!this.audio) {
        this.audio = new Audio(this.config.alertSound);
        this.audio.volume = Math.min(1, this.config.alertVolume / 100);
      }
      
      this.audio.currentTime = 0;
      this.audio.play().catch(() => {});
    }

    applyResponsiveFont() {
      const username = document.querySelector('#username');
      const container = document.querySelector('#usernameContainer');
      if (!username || !container) return;
      
      const length = (username.textContent?.trim() || '').length;
      let sizeClass = 'username-size-3';
      
      if (length <= 4) sizeClass = 'username-size-1';
      else if (length <= 6) sizeClass = 'username-size-2';
      else if (length <= 8) sizeClass = 'username-size-3';
      else if (length <= 10) sizeClass = 'username-size-4';
      else if (length <= 12) sizeClass = 'username-size-5';
      else if (length <= 14) sizeClass = 'username-size-6';
      else if (length <= 16) sizeClass = 'username-size-7';
      else sizeClass = 'username-size-8';

      container.className = container.className.replace(/username-size-\d+/g, '');
      container.classList.add(sizeClass);
    }

    highlightMonetary() {
      const eventEl = document.querySelector('#event');
      if (!eventEl) return;
      
      const text = eventEl.textContent || '';
      const highlighted = text.replace(
        /(\$\d+\.?\d*|\d+\.?\d*\s*(?:USD|EUR|GBP|CAD|AUD|JPY|CNY|€|£|¥)|\d+\.?\d*)/g, 
        '<span class="monetary">$1</span>'
      );
      
      if (highlighted !== text) {
        eventEl.innerHTML = highlighted;
      }
    }

    triggerStarAnimation() {
      const stars = document.querySelectorAll('.floating-star');
      stars.forEach((star, index) => {
        setTimeout(() => {
          star.classList.add('star-shooting');
          setTimeout(() => {
            star.classList.remove('star-shooting');
            star.classList.add('star-twinkle');
          }, 2000);
        }, index * 100);
      });
    }

    setupColors() {
      // Set monetary color
      document.documentElement.style.setProperty('--monetary-color', this.config.monetaryColor);
      
      // Setup gradient
      const hex = this.config.infoBoxBaseColor.replace('#', '');
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const [r6, g6, b6] = [r, g, b].map(v => Math.floor(v * 0.5));
      
      const gradient = `linear-gradient(to bottom,rgba(${r},${g},${b},0.01) 0%,rgba(${r},${g},${b},1) 56%,rgba(${r6},${g6},${b6},1) 100%)`;
      
      let style = document.getElementById('mobile-alert-styles');
      if (!style) {
        style = document.createElement('style');
        style.id = 'mobile-alert-styles';
        document.head.appendChild(style);
      }
      style.textContent = `.info-section{background:${gradient}!important}`;
    }

    runAlert() {
      this.clearTimers();
      this.setupVideo();
      this.applyResponsiveFont();
      this.highlightMonetary();

      const frame = document.querySelector('.mobile-phone-frame');
      if (!frame) return;

      // Reset classes
      frame.classList.remove('slide-in', 'slide-out');

      // Phase 1: Slide in
      this.timers.in = setTimeout(() => {
        frame.classList.add('slide-in');
        this.playSound();
        this.triggerStarAnimation();
      }, 200);

      // Phase 2: Text reveal
      this.timers.reveal = setTimeout(() => {
        const selectors = ['#username', '#usernameDivider', '#event', '#alert-user-message'];
        selectors.forEach(selector => {
          const el = document.querySelector(selector);
          if (el) el.classList.add('text-reveal');
        });
      }, this.config.textAppearanceDelay * 1000);

      // Phase 3: Slide out
      this.timers.out = setTimeout(() => {
        frame.classList.remove('slide-in');
        frame.classList.add('slide-out');
      }, (this.config.alertDuration + 4) * 1000);
    }

    updateConfig(newConfig) {
      this.config = { ...this.config, ...newConfig };
      this.setupColors();
      
      if (this.audio && newConfig.alertVolume !== undefined) {
        this.audio.volume = Math.min(1, this.config.alertVolume / 100);
      }
    }

    bindEvents() {
      // For standalone usage
      if (typeof window.addEventListener === 'function') {
        // StreamElements events
        window.addEventListener('onWidgetLoad', () => {
          this.runAlert();
        });

        window.addEventListener('onEventReceived', (event) => {
          const listener = event.detail?.listener;
          const alertEvents = [
            'follower-latest', 'subscriber-latest', 'tip-latest', 
            'cheer-latest', 'raid-latest', 'host-latest', 
            'sponsor-latest', 'superchat-latest', 'streamlabs-donation-latest', 
            'gift-latest'
          ];
          
          if (alertEvents.includes(listener)) {
            this.runAlert();
          }
        });

        window.addEventListener('onWidgetUpdate', (event) => {
          const fieldData = event.detail?.fieldData || {};
          this.updateConfig(fieldData);
        });
      }
    }

    // Public API
    trigger() {
      this.runAlert();
    }

    destroy() {
      this.clearTimers();
      if (this.audio) {
        this.audio.pause();
        this.audio = null;
      }
    }
  }

  // Export for different environments
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileAlertWidget;
  } else if (typeof define === 'function' && define.amd) {
    define(function() { return MobileAlertWidget; });
  } else {
    window.MobileAlertWidget = MobileAlertWidget;
  }

  // Auto-initialize for StreamElements
  if (typeof window !== 'undefined' && !window.mobileAlertInstance) {
    document.addEventListener('DOMContentLoaded', function() {
      window.mobileAlertInstance = MobileAlertWidget.createFromSE();
    });
  }

})(typeof window !== 'undefined' ? window : this, typeof document !== 'undefined' ? document : {});
