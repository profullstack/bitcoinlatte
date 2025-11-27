/**
 * Datafast Analytics Utility
 * 
 * This module provides helper functions for tracking user interactions
 * with Datafast analytics goals.
 */

// Extend the Window interface to include datafast
declare global {
  interface Window {
    datafast?: (event: string, data?: DatafastEventData) => void;
  }
}

/**
 * Event data structure for Datafast tracking
 */
export interface DatafastEventData {
  name?: string;
  email?: string;
  product_id?: string;
  shop_id?: string;
  shop_name?: string;
  action?: string;
  category?: string;
  value?: number;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Track a custom event with Datafast
 * @param event - The event name (e.g., 'initiate_checkout', 'view_shop', 'submit_shop')
 * @param data - Optional event data
 */
export const trackEvent = (event: string, data?: DatafastEventData): void => {
  if (typeof window !== 'undefined' && window.datafast) {
    window.datafast(event, data);
  }
};

/**
 * Track when a user views a shop
 */
export const trackShopView = (shopId: string, shopName: string): void => {
  trackEvent('view_shop', {
    shop_id: shopId,
    shop_name: shopName,
  });
};

/**
 * Track when a user submits a new shop
 */
export const trackShopSubmission = (shopName: string): void => {
  trackEvent('submit_shop', {
    shop_name: shopName,
    action: 'submit',
  });
};

/**
 * Track when a user votes on a shop
 */
export const trackVote = (shopId: string, voteType: 'up' | 'down'): void => {
  trackEvent('vote', {
    shop_id: shopId,
    action: voteType,
  });
};

/**
 * Track when a user adds a comment
 */
export const trackComment = (shopId: string): void => {
  trackEvent('add_comment', {
    shop_id: shopId,
    action: 'comment',
  });
};

/**
 * Track when a user searches for shops
 */
export const trackSearch = (query: string): void => {
  trackEvent('search', {
    action: 'search',
    category: query,
  });
};

/**
 * Track when a user uses the map
 */
export const trackMapInteraction = (action: 'zoom' | 'pan' | 'marker_click'): void => {
  trackEvent('map_interaction', {
    action,
  });
};

/**
 * Track user login
 */
export const trackLogin = (email?: string): void => {
  trackEvent('login', {
    email,
  });
};

/**
 * Track user signup
 */
export const trackSignup = (email?: string): void => {
  trackEvent('signup', {
    email,
  });
};

/**
 * Track admin actions
 */
export const trackAdminAction = (action: 'approve' | 'reject' | 'edit', shopId?: string): void => {
  trackEvent('admin_action', {
    action,
    shop_id: shopId,
  });
};

/**
 * Track page views (for SPA navigation)
 */
export const trackPageView = (pageName: string): void => {
  trackEvent('page_view', {
    action: 'view',
    category: pageName,
  });
};
