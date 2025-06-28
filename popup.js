// Popup script for E-Transfer Blocker
class PopupController {
  constructor() {
    this.init();
  }

  async init() {
    await this.loadStatus();
    this.setupEventListeners();
    this.startStatusUpdates();
  }

  async loadStatus() {
    try {
      // Get status from background script
      const response = await chrome.runtime.sendMessage({ action: 'getStatus' });
      
      if (response) {
        this.updateUI(response);
      }

      // Load additional data from storage
      const result = await chrome.storage.sync.get([
        'blockedAttempts', 
        'isEnabled', 
        'lastActivity',
        'sessionsCount'
      ]);

      this.updateStats(result);
    } catch (error) {
      console.error('Failed to load status:', error);
      this.showError('Failed to load extension status');
    }
  }

  updateUI(status) {
    const statusIndicator = document.getElementById('statusIndicator');
    const enableToggle = document.getElementById('enableToggle');
    const protectionStatus = document.getElementById('protectionStatus');

    if (status.enabled) {
      statusIndicator.className = 'status-indicator status-active';
      enableToggle.checked = true;
      protectionStatus.textContent = 'Protection active';
    } else {
      statusIndicator.className = 'status-indicator status-inactive';
      enableToggle.checked = false;
      protectionStatus.textContent = 'Protection disabled';
    }
  }

  updateStats(data) {
    const blockedCount = document.getElementById('blockedCount');
    const sessionsCount = document.getElementById('sessionsCount');
    const lastActivity = document.getElementById('lastActivity');

    // Update blocked attempts count
    const attempts = data.blockedAttempts || [];
    blockedCount.textContent = attempts.length;

    // Update sessions count (simple implementation)
    sessionsCount.textContent = data.sessionsCount || 1;

    // Update last activity
    if (attempts.length > 0) {
      const lastAttempt = attempts[attempts.length - 1];
      const date = new Date(lastAttempt.timestamp);
      lastActivity.textContent = `Last activity: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    } else {
      lastActivity.textContent = 'Last activity: No blocked attempts';
    }
  }

  setupEventListeners() {
    // Enable/disable toggle
    document.getElementById('enableToggle').addEventListener('change', (e) => {
      this.toggleProtection(e.target.checked);
    });

    // View logs button
    document.getElementById('viewLogsBtn').addEventListener('click', () => {
      this.openLogsPage();
    });

    // Settings button
    document.getElementById('settingsBtn').addEventListener('click', () => {
      this.openSettingsPage();
    });

    // Emergency override button
    document.getElementById('emergencyOverride').addEventListener('click', () => {
      this.handleEmergencyOverride();
    });
  }

  async toggleProtection(enabled) {
    try {
      await chrome.storage.sync.set({ isEnabled: enabled });
      
      // Update UI immediately
      const statusIndicator = document.getElementById('statusIndicator');
      const protectionStatus = document.getElementById('protectionStatus');
      
      if (enabled) {
        statusIndicator.className = 'status-indicator status-active';
        protectionStatus.textContent = 'Protection active';
      } else {
        statusIndicator.className = 'status-indicator status-inactive';
        protectionStatus.textContent = 'Protection disabled';
      }

      // Show feedback
      this.showNotification(enabled ? 'Protection enabled' : 'Protection disabled');
    } catch (error) {
      console.error('Failed to toggle protection:', error);
      this.showError('Failed to update protection status');
    }
  }

  openLogsPage() {
    chrome.tabs.create({ url: chrome.runtime.getURL('logs.html') });
    window.close();
  }

  openSettingsPage() {
    chrome.runtime.openOptionsPage();
    window.close();
  }

  async handleEmergencyOverride() {
    const password = prompt('Enter admin password for emergency override:');
    
    if (!password) return;

    try {
      // Get stored password hash
      const result = await chrome.storage.sync.get(['adminPassword']);
      const storedHash = result.adminPassword;
      
      // Hash the entered password
      const enteredHash = await this.hashPassword(password);
      
      if (enteredHash === storedHash) {
        // Temporarily disable protection
        await chrome.storage.sync.set({ isEnabled: false });
        
        // Set a timer to re-enable (5 minutes)
        setTimeout(async () => {
          await chrome.storage.sync.set({ isEnabled: true });
        }, 5 * 60 * 1000);
        
        this.showNotification('Emergency override activated for 5 minutes');
        this.loadStatus(); // Refresh UI
      } else {
        this.showError('Invalid password');
      }
    } catch (error) {
      console.error('Override failed:', error);
      this.showError('Override failed');
    }
  }

  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  startStatusUpdates() {
    // Update status every 5 seconds
    setInterval(() => {
      this.loadStatus();
    }, 5000);
  }

  showNotification(message) {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #4caf50;
      color: white;
      padding: 10px 15px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  showError(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #f44336;
      color: white;
      padding: 10px 15px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});