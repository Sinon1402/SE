/*!
 * Mobile Alert Widget for StreamElements - All-in-One
 * Version 1.0.0
 * Includes: Widget logic, StreamElements integration, CDN fallback
 */

(function(window, document) {
  'use strict';

  // Configuration helper for StreamElements
  const readSE = (raw, fallback) => {
    if (typeof raw === 'string' && raw.startsWith('{') && raw.endsWith('}')) return fallback;
    return raw || fallback;
  };

  // Widget settings - will be updated by StreamElements
  let settings = {
    backgroundVideo: '',
    textAppearanceDelay: 7,
    alertDuration: 13,
    alertText: 'New Subscriber',
    monetaryColor: '#34D399',
    infoBoxBaseColor: '#FF6B6B'
  };

  // Update settings from StreamElements fields or external config
  function updateSettingsFromSE() {
    if (typeof window.fieldData !== 'undefined') {
      // External configuration provided - process the actual field values
      console.log('Raw fieldData received:', window.fieldData);
      
      const cleanFieldData = {};
      Object.keys(window.fieldData).forEach(key => {
        let value = window.fieldData[key];
        
        // Convert string numbers to actual numbers for certain fields
        if (key === 'textAppearanceDelay' || key === 'alertDuration') {
          value = parseInt(value) || settings[key];
        }
        
        // Use the value as-is since it's already processed by StreamElements
        cleanFieldData[key] = value;
      });
      
      Object.assign(settings, cleanFieldData);
      console.log('FINAL settings after update:', settings);
      
      // Apply colors immediately after updating settings
      setupColors();
    } else {
      console.log('No fieldData found, using defaults');
    }
  }

  // Widget state
  let timers = { in: null, reveal: null, out: null };

  // Timer management
  function clearTimers() {
    Object.values(timers).forEach(timer => {
      if (timer) clearTimeout(timer);
    });
    timers = { in: null, reveal: null, out: null };
  }

  // Audio setup and playback
  function playSound() {
    // StreamElements handles audio automatically, no custom audio needed
    return;
  }

  // Video setup
  function setupVideo() {
    const video = document.querySelector('#backgroundVideo');
    if (!video || !settings.backgroundVideo) return;
    
    if (video.src !== settings.backgroundVideo) {
      video.pause();
      video.src = settings.backgroundVideo;
      video.muted = true;
      video.load();
      video.play().catch(() => {});
    }
  }

  // Responsive font sizing
  function applyResponsiveFont() {
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

  // Monetary text highlighting
  function highlightMonetary() {
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

  // Star animation trigger
  function triggerStarAnimation() {
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

  // Color and gradient setup
  function setupColors() {
    console.log('Setting up colors with:', {
      monetaryColor: settings.monetaryColor,
      infoBoxBaseColor: settings.infoBoxBaseColor
    });
    
    // Set monetary color
    document.documentElement.style.setProperty('--monetary-color', settings.monetaryColor);
    
    // Setup gradient
    const hex = settings.infoBoxBaseColor.replace('#', '');
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
    
    console.log('Applied gradient:', gradient);
  }

  // Main alert animation
  function runAlert() {
    console.log('Running alert with settings:', {
      textAppearanceDelay: settings.textAppearanceDelay,
      alertDuration: settings.alertDuration
    });
    
    clearTimers();
    setupVideo();
    applyResponsiveFont();
    highlightMonetary();

    const frame = document.querySelector('.mobile-phone-frame');
    if (!frame) return;

    // Reset classes for repeat animations
    frame.classList.remove('slide-in', 'slide-out');

    // Phase 1: Slide in animation
    timers.in = setTimeout(() => {
      frame.classList.add('slide-in');
      playSound();
      triggerStarAnimation();
    }, 200);

    // Phase 2: Text reveal
    timers.reveal = setTimeout(() => {
      const selectors = ['#username', '#usernameDivider', '#event', '#alert-user-message'];
      selectors.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) el.classList.add('text-reveal');
      });
    }, settings.textAppearanceDelay * 1000);

    // Phase 3: Slide out
    timers.out = setTimeout(() => {
      frame.classList.remove('slide-in');
      frame.classList.add('slide-out');
    }, (settings.alertDuration + 4) * 1000);
  }

  // Configuration update handler
  function updateConfig(newConfig) {
    Object.assign(settings, newConfig);
    setupColors();
  }

  // StreamElements event handlers
  function handleWidgetLoad(event) {
    updateSettingsFromSE();
    setupColors();
    setupVideo();
    runAlert();
  }

  function handleWidgetUpdate(event) {
    const fieldData = event.detail?.fieldData || {};
    updateConfig(fieldData);
  }

  function handleEventReceived(event) {
    const listener = event.detail?.listener;
    const alertEvents = [
      'follower-latest', 'subscriber-latest', 'tip-latest', 
      'cheer-latest', 'raid-latest', 'host-latest', 
      'sponsor-latest', 'superchat-latest', 'streamlabs-donation-latest', 
      'gift-latest'
    ];
    
    if (alertEvents.includes(listener)) {
      runAlert();
    }
  }

  // Cleanup function
  function cleanup() {
    clearTimers();
  }

  // Initialize widget
  function init() {
    // Prevent multiple initialization
    if (window.mobileAlertWidgetInit) return;
    window.mobileAlertWidgetInit = true;

    // Update settings first
    updateSettingsFromSE();
    setupColors();

    // Bind StreamElements events
    window.addEventListener('onWidgetLoad', handleWidgetLoad);
    window.addEventListener('onWidgetUpdate', handleWidgetUpdate);
    window.addEventListener('onEventReceived', handleEventReceived);

    // Cleanup on page unload
    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('pagehide', cleanup);

    // Expose public API
    window.mobileAlertWidget = {
      trigger: runAlert,
      updateConfig: updateConfig,
      destroy: cleanup,
      setFieldData: function(fieldData) {
        window.fieldData = fieldData;
        updateSettingsFromSE();
        setupColors();
      }
    };
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(typeof window !== 'undefined' ? window : this, typeof document !== 'undefined' ? document : {});
