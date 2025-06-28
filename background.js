// Background service worker for E-Transfer Blocker
class ETransferBlocker {
  constructor() {
    this.isEnabled = true;
    this.blockedAttempts = [];
    this.whitelist = [];
    this.init();
  }

  async init() {
    // Load settings from storage
    const result = await chrome.storage.sync.get(['isEnabled', 'blockedAttempts', 'whitelist', 'adminPassword']);
    this.isEnabled = result.isEnabled !== undefined ? result.isEnabled : true;
    this.blockedAttempts = result.blockedAttempts || [];
    this.whitelist = result.whitelist || [];
    
    // Set up listeners
    this.setupListeners();
    
    // Set default password if none exists
    if (!result.adminPassword) {
      await this.setDefaultPassword();
    }
  }

  async setDefaultPassword() {
    const defaultPassword = await this.hashPassword('admin123');
    await chrome.storage.sync.set({ adminPassword: defaultPassword });
  }

  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  setupListeners() {
    // Listen for messages from content scripts
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async response
    });

    // Listen for tab updates to inject content script
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && this.isBankingDomain(tab.url)) {
        this.injectContentScript(tabId);
      }
    });
  }

  async handleMessage(request, sender, sendResponse) {
    switch (request.action) {
      case 'blockETransfer':
        await this.blockETransfer(request.data, sender.tab);
        sendResponse({ success: true });
        break;
      
      case 'checkWhitelist':
        const isWhitelisted = this.checkWhitelist(request.data);
        sendResponse({ whitelisted: isWhitelisted });
        break;
      
      case 'requestOverride':
        this.handleOverrideRequest(request.data, sender.tab, sendResponse);
        break;
      
      case 'getStatus':
        sendResponse({ 
          enabled: this.isEnabled,
          blockedCount: this.blockedAttempts.length
        });
        break;
    }
  }

  async blockETransfer(data, tab) {
    const blockEvent = {
      timestamp: new Date().toISOString(),
      url: tab.url,
      domain: new URL(tab.url).hostname,
      amount: data.amount || 'Unknown',
      recipient: data.recipient || 'Unknown',
      blocked: true
    };

    this.blockedAttempts.push(blockEvent);
    await chrome.storage.sync.set({ blockedAttempts: this.blockedAttempts });

    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'E-Transfer Blocked!',
      message: `Blocked e-transfer attempt of $${data.amount || '?'} on ${blockEvent.domain}`
    });

    // Log the event
    console.log('E-Transfer blocked:', blockEvent);
  }

  checkWhitelist(data) {
    return this.whitelist.some(entry => 
      entry.recipient === data.recipient || 
      entry.domain === data.domain
    );
  }

  async handleOverrideRequest(data, tab, sendResponse) {
    // For now, always require password verification
    // In a real implementation, this would show an override dialog
    sendResponse({ overrideAllowed: false, requiresAuth: true });
  }

  isBankingDomain(url) {
    if (!url) return false;
    const bankingDomains = [
      'td.com', 'rbc.com', 'scotiabank.com', 'bmo.com', 
      'cibc.com', 'tangerine.ca', 'pcfinancial.ca', 'desjardins.com'
    ];
    return bankingDomains.some(domain => url.includes(domain));
  }

  async injectContentScript(tabId) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js']
      });
    } catch (error) {
      console.error('Failed to inject content script:', error);
    }
  }
}

// Initialize the blocker
const blocker = new ETransferBlocker();