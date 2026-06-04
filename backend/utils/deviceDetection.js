/**
 * Extract device information from User-Agent header
 */
const getDeviceInfo = (userAgent = '', appVersion = '') => {
  const ua = userAgent.toLowerCase();
  
  // Detect device type
  let type = 'unknown';
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    type = 'mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    type = 'tablet';
  } else if (ua.includes('mozilla') || ua.includes('chrome') || ua.includes('safari')) {
    type = 'desktop';
  }
  
  // Detect OS
  let os = 'unknown';
  if (ua.includes('android')) {
    os = 'Android';
  } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ios')) {
    os = 'iOS';
  } else if (ua.includes('windows')) {
    os = 'Windows';
  } else if (ua.includes('mac')) {
    os = 'macOS';
  } else if (ua.includes('linux')) {
    os = 'Linux';
  }
  
  // Detect browser
  let browser = 'unknown';
  if (ua.includes('expo')) {
    browser = 'Expo Go';
  } else if (ua.includes('chrome')) {
    browser = 'Chrome';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
  } else if (ua.includes('firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('edge')) {
    browser = 'Edge';
  }
  
  return {
    type,
    os,
    browser,
    appVersion: appVersion || 'unknown'
  };
};

/**
 * Extract location information from IP address
 * Note: This is a basic implementation. For production, use a service like ipapi.co or ip-api.com
 */
const getLocationInfo = (ip = '') => {
  // Remove IPv6 prefix if present
  const cleanIp = ip.replace('::ffff:', '');
  
  // For localhost/private IPs
  if (cleanIp === '127.0.0.1' || cleanIp.startsWith('192.168.') || cleanIp.startsWith('10.')) {
    return {
      ip: cleanIp,
      country: 'Local',
      city: 'Local Network'
    };
  }
  
  // For production, integrate with IP geolocation service
  // Example: https://ipapi.co/${ip}/json/
  return {
    ip: cleanIp,
    country: 'Unknown',
    city: 'Unknown'
  };
};

/**
 * Get client IP address from request
 */
const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         'unknown';
};

module.exports = {
  getDeviceInfo,
  getLocationInfo,
  getClientIp
};
