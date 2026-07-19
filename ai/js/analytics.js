/**
 * UpneX Tracking — /ai/js/analytics.js
 *
 * Single source of truth for all analytics on every /ai/* page.
 * Load this file in <head>; then call initAnalytics({page_name, page_type})
 * in a small inline script at the bottom of each page.
 *
 * GA4 property  : G-FLTEBMR6Z7
 * Google Ads    : AW-18312920511
 * Conversion    : AW-18312920511/qO1DCNjCydAcEL_7o5xE  ← booking_completed ONLY
 *
 * Events tracked (10):
 *  1. page_view             – auto via gtag('config', GA4_ID) in initAnalytics
 *  2. scroll_depth          – 50 % and 90 % milestones, once per milestone/page/session
 *  3. cta_click             – any Book/Demo/Audit/Trial/Schedule button, every click
 *  4. calendly_opened       – Calendly widget loaded/viewed, once per session
 *  5. calendly_link_click   – external Calendly link click (new-tab), GA4 only
 *  6. lead_form_submitted   – audit/qualification form EmailJS success, GA4 only
 *  7. trial_form_submitted  – trial signup form success, GA4 only
 *  8. booking_completed     – Calendly event_scheduled OR ?booked=1 redirect → ALSO fires Google Ads conversion
 *  9. contact_form_submitted– contact form success (call UpneX.track() from page), GA4 only
 * 10. email_sent_successfully – outbound email confirmation (call UpneX.track()), GA4 only
 *
 * DO NOT add send_to: 'AW-...' anywhere except inside trackBookingCompleted().
 */
(function (w, d) {
  'use strict';

  var GA4_ID = 'G-FLTEBMR6Z7';
  var BOOKING_CONVERSION = 'AW-18312920511/qO1DCNjCydAcEL_7o5xE';

  var _pageConfig = { page_name: 'Unknown', page_type: 'unknown' };
  var _scrollFired = {};
  var _initialized = false;

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function getDevice() {
    var ua = navigator.userAgent;
    if (/Mobi|Android|iPhone/i.test(ua)) return 'mobile';
    if (/iPad|Tablet/i.test(ua)) return 'tablet';
    return 'desktop';
  }

  function getTrafficParams() {
    try {
      var p = new URLSearchParams(w.location.search);
      var src = p.get('utm_source');
      if (!src && d.referrer) {
        try { src = new URL(d.referrer).hostname; } catch (e) { src = d.referrer; }
      }
      return {
        traffic_source: src || 'direct',
        campaign: p.get('utm_campaign') || '',
      };
    } catch (e) {
      return { traffic_source: 'unknown', campaign: '' };
    }
  }

  function sessionGet(key) {
    try { return w.sessionStorage.getItem('upnex_' + key); } catch (e) { return null; }
  }

  function sessionSet(key) {
    try { w.sessionStorage.setItem('upnex_' + key, '1'); } catch (e) {}
  }

  // ── Core event sender ────────────────────────────────────────────────────────

  function track(eventName, extra) {
    try {
      var params = Object.assign(
        {},
        { page_name: _pageConfig.page_name, page_type: _pageConfig.page_type },
        getTrafficParams(),
        { device: getDevice(), timestamp: new Date().toISOString() },
        extra || {}
      );
      if (typeof w.gtag === 'function') {
        w.gtag('event', eventName, params);
      } else {
        w.dataLayer = w.dataLayer || [];
        w.dataLayer.push({ event: eventName, eventParams: params });
      }
      console.log('[UpneX]', eventName, params);
    } catch (e) {
      console.error('[UpneX] track() error:', e);
    }
  }

  // ── Booking completed — ONLY path that fires Google Ads conversion ───────────

  function trackBookingCompleted(source) {
    if (sessionGet('booking_completed')) {
      console.log('[UpneX] booking_completed already fired this session — dedup skip');
      return;
    }
    sessionSet('booking_completed');

    track('booking_completed', { source: source });

    // Google Ads conversion — THE ONLY ONE in this codebase
    try {
      var payload = {
        send_to: BOOKING_CONVERSION,
        value: 1.0,
        currency: 'USD',
        transaction_id: 'booking_' + Date.now(),
      };
      if (typeof w.gtag === 'function') {
        w.gtag('event', 'conversion', payload);
        console.log('[UpneX] ✅ Google Ads conversion fired:', source);
      } else {
        w.dataLayer = w.dataLayer || [];
        w.dataLayer.push(Object.assign({ event: 'conversion' }, payload));
      }
    } catch (e) {
      console.error('[UpneX] Ads conversion error:', e);
    }

    if (typeof w.fbq === 'function') w.fbq('track', 'Schedule');
  }

  // ── Scroll depth tracking ────────────────────────────────────────────────────

  function setupScrollDepth() {
    var milestones = [50, 90];
    var path = w.location.pathname;
    function onScroll() {
      var pct = Math.round(
        (w.scrollY + w.innerHeight) / d.documentElement.scrollHeight * 100
      );
      for (var i = 0; i < milestones.length; i++) {
        var m = milestones[i];
        var key = 'scroll_' + m + path;
        if (pct >= m && !_scrollFired[key]) {
          _scrollFired[key] = true;
          if (!sessionGet(key)) {
            sessionSet(key);
            track('scroll_depth', { percent: m });
          }
        }
      }
    }
    w.addEventListener('scroll', onScroll, { passive: true });
  }

  // ── CTA click delegation ─────────────────────────────────────────────────────

  function setupCTAClicks() {
    d.addEventListener('click', function (e) {
      var el = e.target.closest('a, button');
      if (!el) return;
      var text = (el.textContent || el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 100);
      var href = el.href || el.getAttribute('href') || '';

      // cta_click: any element with a booking/demo/audit/trial intent label
      if (/book|demo|audit|trial|schedule/i.test(text) || el.dataset.cta) {
        track('cta_click', { button_name: text, href: href.slice(0, 200) });
      }

      // calendly_link_click: external Calendly links only (new-tab) — GA4 only, NOT a conversion
      if (
        href && href.indexOf('calendly.com') !== -1 &&
        el.tagName === 'A' &&
        (el.target === '_blank' || el.getAttribute('target') === '_blank')
      ) {
        track('calendly_link_click', { button_name: text });
      }
    });
  }

  // ── Calendly listeners ───────────────────────────────────────────────────────

  function setupCalendly() {
    w.addEventListener('message', function (e) {
      if (String(e.origin || '').indexOf('calendly.com') === -1) return;
      if (!e.data || typeof e.data !== 'object') return;

      var ev = e.data.event;

      // Widget opened / viewed
      if (
        ev === 'calendly.profile_page_viewed' ||
        ev === 'calendly.event_type_viewed'
      ) {
        if (!sessionGet('calendly_opened')) {
          sessionSet('calendly_opened');
          track('calendly_opened', { source: 'inline_widget' });
        }
      }

      // Booking completed inside widget
      if (ev === 'calendly.event_scheduled') {
        console.log('[UpneX] Calendly booking scheduled:', e.data.payload);
        trackBookingCompleted('inline_widget');
      }
    });

    // Redirect path: ?booked=1
    try {
      if (new URLSearchParams(w.location.search).get('booked') === '1') {
        trackBookingCompleted('redirect');
      }
    } catch (e) {}
  }

  // ── initAnalytics — called once per page ─────────────────────────────────────

  function initAnalytics(pageConfig) {
    if (_initialized) { console.warn('[UpneX] initAnalytics() called twice — ignoring'); return; }
    _initialized = true;

    _pageConfig = pageConfig || _pageConfig;

    // GA4 config — fires page_view with custom params
    if (typeof w.gtag === 'function') {
      w.gtag('config', GA4_ID, {
        page_title: d.title,
        page_location: w.location.href,
        page_name: _pageConfig.page_name,
        page_type: _pageConfig.page_type,
      });
    } else {
      // Fallback: queue via dataLayer (gtag.js will process on load)
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push(['config', GA4_ID, {
        page_title: d.title,
        page_location: w.location.href,
        page_name: _pageConfig.page_name,
        page_type: _pageConfig.page_type,
      }]);
    }

    setupScrollDepth();
    setupCTAClicks();
    setupCalendly();
  }

  // ── Public API ───────────────────────────────────────────────────────────────

  w.UpneX = w.UpneX || {};
  w.UpneX.track = track;
  w.UpneX.trackBookingCompleted = trackBookingCompleted;
  w.UpneX.initAnalytics = initAnalytics;

  // Convenience alias used by page inline scripts
  w.initAnalytics = initAnalytics;

}(window, document));
