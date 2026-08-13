(function () {
  if (typeof window === 'undefined') return;

  // Read API key from script tag data-key attribute
  var currentScript = document.currentScript || document.querySelector('script[data-key]');
  var apiKey = currentScript ? currentScript.getAttribute('data-key') : null;

  // Capture UTM parameters and Referrer
  function getParams() {
    var urlParams = new URLSearchParams(window.location.search);
    var ref = document.referrer;
    try {
      if (ref && new URL(ref).origin === window.location.origin) {
        ref = '';
      }
    } catch (e) {
      ref = '';
    }

    return {
      utm_source: urlParams.get('utm_source') || undefined,
      utm_medium: urlParams.get('utm_medium') || undefined,
      utm_campaign: urlParams.get('utm_campaign') || undefined,
      utm_term: urlParams.get('utm_term') || undefined,
      utm_content: urlParams.get('utm_content') || undefined,
      referrer: ref || undefined,
    };
  }

  // Store UTM data in sessionStorage if present
  var captured = getParams();
  if (captured.utm_source || captured.referrer) {
    try {
      sessionStorage.setItem('kev_attr', JSON.stringify(captured));
    } catch (e) {}
  }

  function getStoredAttr() {
    try {
      var data = sessionStorage.getItem('kev_attr');
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  // Track function exposed on window.kevosh.track('user@example.com')
  function track(email, customParams) {
    if (!apiKey) {
      console.warn('[Kevosh] Warning: No data-key found on script tag.');
      return Promise.reject('No API key');
    }

    var stored = getStoredAttr();
    var payload = Object.assign({
      api_key: apiKey,
      email: email,
    }, stored, customParams || {});

    // Endpoint can be overriden or relative to host
    var endpoint = (currentScript && currentScript.getAttribute('data-host')) || '';
    endpoint += '/api/track/signup';

    return fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(function (res) {
      return res.json();
    }).catch(function (err) {
      console.error('[Kevosh] Tracking error:', err);
    });
  }

  window.kevosh = {
    track: track,
    apiKey: apiKey
  };
})();
