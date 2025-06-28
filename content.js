// Content script for E-Transfer Blocker
class ETransferDetector {
  constructor() {
    this.eTransferPatterns = [
      // Common e-transfer form patterns
      'e-transfer', 'etransfer', 'send money', 'interac',
      'transfer funds', 'send payment', 'email transfer'
    ];
    
    this.eTransferSelectors = [
      // Common selectors for e-transfer forms
      '[data-testid*="transfer"]',
      '[data-testid*="etransfer"]',
      '[id*="transfer"]',
      '[class*="transfer"]',
      'input[name*="amount"]',
      'input[name*="recipient"]',
      'input[name*="email"]',
      'form[action*="transfer"]',
      'button[type="submit"]'
    ];

    this.init();
  }

  init() {
    // Only run if not already initialized
    if (window.eTransferBlockerInitialized) return;
    window.eTransferBlockerInitialized = true;

    console.log('E-Transfer Blocker: Content script loaded');
    
    // Start monitoring immediately
    this.startMonitoring();
    
    // Monitor for dynamic content
    this.observePageChanges();
  }

  startMonitoring() {
    // Monitor form submissions
    document.addEventListener('submit', (e) => this.handleFormSubmit(e), true);
    
    // Monitor button clicks
    document.addEventListener('click', (e) => this.handleClick(e), true);
    
    // Monitor input changes for amount fields
    document.addEventListener('input', (e) => this.handleInput(e), true);
    
    // Monitor page navigation
    window.addEventListener('beforeunload', (e) => this.handlePageUnload(e));
  }

  observePageChanges() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          this.scanForETransferElements();
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  async handleFormSubmit(event) {
    const form = event.target;
    
    if (this.isETransferForm(form)) {
      event.preventDefault();
      event.stopPropagation();
      
      const transferData = this.extractTransferData(form);
      await this.blockETransfer(transferData);
      
      return false;
    }
  }

  async handleClick(event) {
    const element = event.target;
    
    // Check if clicking on e-transfer related buttons
    if (this.isETransferButton(element)) {
      const transferData = this.extractTransferDataFromContext(element);
      
      // Check if this is whitelisted
      const response = await chrome.runtime.sendMessage({
        action: 'checkWhitelist',
        data: transferData
      });
      
      if (!response.whitelisted) {
        event.preventDefault();
        event.stopPropagation();
        await this.blockETransfer(transferData);
        return false;
      }
    }
  }

  handleInput(event) {
    const input = event.target;
    
    // Monitor amount inputs
    if (this.isAmountInput(input)) {
      const value = parseFloat(input.value);
      if (value > 0) {
        this.highlightPotentialTransfer(input);
      }
    }
  }

  isETransferForm(form) {
    const formHTML = form.innerHTML.toLowerCase();
    const formAction = form.action ? form.action.toLowerCase() : '';
    
    return this.eTransferPatterns.some(pattern => 
      formHTML.includes(pattern) || formAction.includes(pattern)
    );
  }

  isETransferButton(element) {
    const text = element.textContent.toLowerCase();
    const classes = element.className.toLowerCase();
    const id = element.id.toLowerCase();
    
    return this.eTransferPatterns.some(pattern => 
      text.includes(pattern) || classes.includes(pattern) || id.includes(pattern)
    ) || 
    (text.includes('send') && text.includes('money')) ||
    (text.includes('transfer') && text.includes('funds'));
  }

  isAmountInput(input) {
    const name = input.name ? input.name.toLowerCase() : '';
    const id = input.id ? input.id.toLowerCase() : '';
    const placeholder = input.placeholder ? input.placeholder.toLowerCase() : '';
    
    return name.includes('amount') || 
           id.includes('amount') || 
           placeholder.includes('amount') ||
           input.type === 'number';
  }

  extractTransferData(form) {
    const formData = new FormData(form);
    const data = {};
    
    // Extract common fields
    for (let [key, value] of formData.entries()) {
      const keyLower = key.toLowerCase();
      if (keyLower.includes('amount')) data.amount = value;
      if (keyLower.includes('recipient') || keyLower.includes('email')) data.recipient = value;
    }
    
    // Try to extract from input fields
    const amountInputs = form.querySelectorAll('input[type="number"], input[name*="amount"]');
    const emailInputs = form.querySelectorAll('input[type="email"], input[name*="email"]');
    
    if (amountInputs.length > 0) data.amount = amountInputs[0].value;
    if (emailInputs.length > 0) data.recipient = emailInputs[0].value;
    
    data.domain = window.location.hostname;
    data.url = window.location.href;
    
    return data;
  }

  extractTransferDataFromContext(element) {
    const data = { domain: window.location.hostname, url: window.location.href };
    
    // Look for amount in nearby elements
    const container = element.closest('form') || element.closest('.transfer-container') || element.parentElement;
    if (container) {
      const amountElements = container.querySelectorAll('input[type="number"], [class*="amount"], [id*="amount"]');
      if (amountElements.length > 0) {
        data.amount = amountElements[0].value || amountElements[0].textContent;
      }
      
      const emailElements = container.querySelectorAll('input[type="email"], [class*="email"], [id*="email"]');
      if (emailElements.length > 0) {
        data.recipient = emailElements[0].value;
      }
    }
    
    return data;
  }

  async blockETransfer(transferData) {
    // Send block notification to background script
    await chrome.runtime.sendMessage({
      action: 'blockETransfer',
      data: transferData
    });
    
    // Show immediate user feedback
    this.showBlockedNotification(transferData);
    
    // Replace the page content with block message
    this.showBlockedPage(transferData);
  }

  showBlockedNotification(transferData) {
    // Create a prominent notification overlay
    const overlay = document.createElement('div');
    overlay.id = 'etransfer-blocked-overlay';
    overlay.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 0, 0, 0.9);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: Arial, sans-serif;
        color: white;
      ">
        <div style="
          background: white;
          color: #d32f2f;
          padding: 40px;
          border-radius: 10px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          max-width: 500px;
        ">
          <h2 style="margin: 0 0 20px 0; font-size: 24px;">⚠️ E-Transfer Blocked!</h2>
          <p style="margin: 0 0 15px 0; font-size: 16px;">
            An attempt to send an e-transfer has been blocked for your protection.
          </p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>Amount:</strong> $${transferData.amount || 'Unknown'}<br>
            <strong>Site:</strong> ${transferData.domain}
          </div>
          <button onclick="this.parentElement.parentElement.remove()" style="
            background: #d32f2f;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
          ">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.remove();
      }
    }, 5000);
  }

  showBlockedPage(transferData) {
    // Replace page content with blocked message
    document.body.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        font-family: Arial, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        margin: 0;
        padding: 20px;
      ">
        <div style="
          background: white;
          padding: 40px;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          text-align: center;
          max-width: 600px;
        ">
          <div style="font-size: 48px; margin-bottom: 20px;">🛡️</div>
          <h1 style="color: #d32f2f; margin: 0 0 20px 0;">E-Transfer Blocked</h1>
          <p style="color: #666; font-size: 18px; margin-bottom: 30px;">
            Your e-transfer attempt has been blocked for security reasons.
          </p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #333;">Transaction Details:</h3>
            <p><strong>Amount:</strong> $${transferData.amount || 'Not specified'}</p>
            <p><strong>Website:</strong> ${transferData.domain}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <div style="margin-top: 30px;">
            <button onclick="window.history.back()" style="
              background: #007bff;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 16px;
              margin-right: 10px;
            ">Go Back</button>
            <button onclick="window.location.reload()" style="
              background: #28a745;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 16px;
            ">Refresh Page</button>
          </div>
        </div>
      </div>
    `;
  }

  scanForETransferElements() {
    // Scan for e-transfer elements and add warnings
    this.eTransferSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (!element.dataset.etransferWarning) {
          this.addWarningToElement(element);
          element.dataset.etransferWarning = 'true';
        }
      });
    });
  }

  addWarningToElement(element) {
    // Add a subtle warning indicator
    const warning = document.createElement('div');
    warning.innerHTML = '⚠️ Monitored by E-Transfer Blocker';
    warning.style.cssText = `
      position: absolute;
      background: #ff9800;
      color: white;
      padding: 2px 8px;
      font-size: 12px;
      border-radius: 3px;
      z-index: 1000;
      pointer-events: none;
      font-family: Arial, sans-serif;
    `;
    
    element.style.position = 'relative';
    element.appendChild(warning);
  }

  highlightPotentialTransfer(input) {
    input.style.border = '2px solid #ff9800';
    input.style.boxShadow = '0 0 5px rgba(255, 152, 0, 0.5)';
  }
}

// Initialize the detector
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ETransferDetector());
} else {
  new ETransferDetector();
}