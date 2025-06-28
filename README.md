<<<<<<< HEAD
PRD: E-Transfer Blocker App (Desktop)
1. Purpose
To protect users from making unauthorized or impulsive e-transfers on their personal computer by actively blocking, monitoring, and restricting any attempt to initiate an e-transfer transaction through banking websites, banking apps, or other online financial platforms.

2. Problem Statement
Users may accidentally or impulsively send e-transfers on their PC, which can result in fraud, financial mistakes, or unapproved spending. There is currently no dedicated app to restrict or control e-transfer operations on a personal computer.

3. Goals
✅ Block any attempt to initiate an e-transfer on a PC
✅ Allow customizable settings to whitelist specific, approved transfers if needed
✅ Provide a secure admin override option
✅ Maintain a log of blocked attempts for transparency
✅ Operate with minimal system resource usage
✅ Ensure tamper-resistance so the user cannot easily disable it

4. Features
4.1 Blocking Capabilities
Intercepts network traffic or browser requests to known banking portals

Detects patterns consistent with e-transfer initiation (e.g., known URL patterns, form field submissions)

Terminates or blocks the page/process if an e-transfer is detected

4.2 Notifications
Instant pop-up to inform the user that an e-transfer attempt has been blocked

Optional email notification to the user or a trusted contact

4.3 Whitelisting
Admin can whitelist specific recipient accounts or banking sites under strict conditions

All whitelisting is password-protected with optional multi-factor authentication

4.4 Logs
Keeps a secure, encrypted log of:

Date/time of attempted e-transfer

Site/application involved

Amount attempted (if detected)

Log is only viewable with admin rights

4.5 Override Controls
Override feature requiring a secure PIN, password, or biometric

Can optionally enforce a cooldown period before allowing overrides

Alerts trusted contacts if an override is used

4.6 Security
Application hard to uninstall without master password

Encrypted settings

Obfuscation to prevent tampering

5. Non-Functional Requirements
Compatible with Windows (initially)

Low CPU and RAM footprint

Uses secure and up-to-date cryptography

Easy to install, but hard to remove without the proper credentials

Compliant with privacy regulations (no personal banking data stored beyond logs of blocked attempts)

6. User Stories
✅ As a user, I want to prevent myself from sending e-transfers on my PC so I can protect my finances.
✅ As an admin, I want to whitelist specific e-transfer transactions if needed so I don’t block legitimate use.
✅ As a security-conscious user, I want to be alerted when an override occurs so I can spot fraud.

7. Success Metrics
95% of attempted e-transfers successfully blocked

Zero unauthorized overrides

Minimal false positives (not blocking non-financial traffic)

User satisfaction above 4/5 in post-launch survey

8. Constraints
Must support major Canadian banking portals (TD, RBC, Scotiabank, etc.)

Should not conflict with other antivirus or endpoint security

Should follow strict software security best practices

9. Roadmap
✅ Phase 1 – MVP

Basic blocking of e-transfer forms and known URLs

Basic override with password

✅ Phase 2 – Advanced security

Biometric support

Trusted contact notifications

✅ Phase 3 – Enterprise / Family mode

Centralized management of multiple PCs

Advanced reporting

=======
# E-Transfer Blocker Chrome Extension

## 🛡️ Overview

The E-Transfer Blocker is a Chrome extension designed to protect users from unauthorized or impulsive e-transfer transactions on Canadian banking websites. It actively monitors and blocks e-transfer attempts while providing secure override capabilities for legitimate transactions.

## 🚀 Features

- **Real-time Protection**: Blocks e-transfer attempts on major Canadian banking sites
- **Smart Detection**: Identifies e-transfer forms and buttons using multiple detection methods
- **Secure Override**: Password-protected emergency override system
- **Whitelist Management**: Allow specific recipients or domains
- **Activity Logging**: Track all blocked attempts with detailed logs
- **User-Friendly Interface**: Clean, modern popup and settings interface
- **Tamper Resistance**: Secure settings storage and password protection

## 📦 Installation

### Method 1: Developer Mode (Recommended for testing)

1. **Download the Extension Files**
   - Save all the provided files in a single folder
   - Ensure the folder structure is correct:
     ```
     etransfer-blocker/
     ├── manifest.json
     ├── background.js
     ├── content.js
     ├── popup.html
     ├── popup.js
     ├── options.html
     ├── options.js
     ├── rules.json
     └── icons/
         ├── icon16.png
         ├── icon32.png
         ├── icon48.png
         └── icon128.png
     ```

2. **Create Icon Files**
   - Create a folder named `icons` in your extension directory
   - Add icon files (16x16, 32x32, 48x48, 128x128 pixels) or use placeholder images
   - You can create simple colored squares as placeholders

3. **Load the Extension**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in the top-right corner)
   - Click "Load unpacked"
   - Select the folder containing your extension files
   - The extension should now appear in your extensions list

4. **Verify Installation**
   - Look for the E-Transfer Blocker icon in your Chrome toolbar
   - Click the icon to open the popup interface
   - Navigate to a banking website to test the blocking functionality

### Method 2: Chrome Web Store (Future)

This extension is designed for potential publication on the Chrome Web Store after proper testing and validation.

## ⚙️ Initial Setup

### 1. Change Default Password

**⚠️ IMPORTANT**: The extension comes with a default admin password: `admin123`

1. Click the extension icon in your toolbar
2. Click "Advanced Settings"
3. In the Security Settings section, change the default password:
   - Current Password: `admin123`
   - Enter your new secure password
   - Confirm the new password
   - Click "Update Password"

### 2. Configure Protection Settings

1. **General Settings**:
   - Enable/disable protection
   - Toggle notifications
   - Enable strict mode for maximum security

2. **Whitelist Management**:
   - Add trusted email addresses
   - Whitelist specific banking domains if needed
   - Remove entries as needed

### 3. Test the Protection

1. Visit a supported banking website:
   - TD Canada Trust (td.com)
   - RBC Royal Bank (rbc.com)
   - Scotiabank (scotiabank.com)
   - BMO Bank of Montreal (bmo.com)
   - CIBC (cibc.com)
   - Tangerine (tangerine.ca)

2. Try to access e-transfer or money transfer pages
3. Verify that the extension blocks the attempts
4. Check the activity logs in the settings

## 🔧 Configuration Options

### Protection Levels

- **Standard Mode**: Blocks e-transfer forms and buttons
- **Strict Mode**: Blocks entire transfer-related pages
- **Whitelist Mode**: Allows pre-approved recipients only

### Security Features

- **Password Protection**: Secure admin access
- **Override System**: Emergency access with logging
- **Tamper Resistance**: Encrypted settings storage
- **Activity Monitoring**: Comprehensive logging

### Notification Settings

- **Browser Notifications**: System-level alerts
- **Visual Warnings**: On-page indicators
- **Block Messages**: Full-page block notifications

## 🛠️ Troubleshooting

### Extension Not Working

1. **Check Extension Status**:
   - Ensure the extension is enabled in `chrome://extensions/`
   - Verify all required permissions are granted

2. **Reload the Extension**:
   - Go to `chrome://extensions/`
   - Click the refresh icon on the E-Transfer Blocker extension
   - Restart Chrome

3. **Clear Storage**:
   - Right-click the extension icon
   - Select "Options"
   - Use "Reset to Defaults" (will lose all settings)

### Banking Website Issues

1. **Site Not Detected**:
   - Ensure the website is in the supported list
   - Check if the site has changed its URL structure
   - Report new banking sites for future support

2. **False Positives**:
   - Add the specific page to the whitelist
   - Adjust protection settings
   - Use the emergency override if needed

### Performance Issues

1. **Slow Loading**:
   - The extension runs efficiently but may add slight delays
   - Disable other extensions to test for conflicts
   - Check Chrome's Task Manager for resource usage

## 🔒 Security Considerations

### Data Privacy

- **No Personal Data Storage**: The extension only stores configuration settings and activity logs
- **Local Storage Only**: All data remains on your device
- **No External Communication**: The extension doesn't send data to external servers

### Password Security

- **Strong Passwords**: Use complex admin passwords
- **Regular Updates**: Change passwords periodically
- **Secure Storage**: Passwords are hashed using SHA-256

### Banking Safety

- **Legitimate Transactions**: Use the override system for genuine transfers
- **Multiple Verification**: Consider additional verification steps
- **Regular Monitoring**: Check activity logs regularly

## 📋 Supported Banking Sites

The extension currently monitors these Canadian banking domains:

- TD Canada Trust (`*.td.com`)
- RBC Royal Bank (`*.rbc.com`)
- Scotiabank (`*.scotiabank.com`)
- BMO Bank of Montreal (`*.bmo.com`)
- CIBC (`*.cibc.com`)
- Tangerine (`*.tangerine.ca`)
- PC Financial (`*.pcfinancial.ca`)
- Desjardins (`*.desjardins.com`)

## 🆘 Emergency Override

If you need to make a legitimate e-transfer:

1. Click the extension icon
2. Click "Emergency Override"
3. Enter your admin password
4. The protection will be disabled for 5 minutes
5. Complete your transfer quickly
6. Protection will automatically re-enable

## 📊 Activity Monitoring

The extension logs all blocked attempts with:

- Date and time
- Banking website
- Attempted amount (if detected)
- Success/failure status

Access logs through:
- Extension popup (summary)
- Settings page (detailed view)
- Export function (backup)

## 🔄 Updates and Maintenance

### Regular Maintenance

- Review activity logs weekly
- Update whitelist as needed
- Check for extension updates
- Backup settings periodically

### Version Updates

- The extension will notify of updates
- Review changelog before updating
- Export settings before major updates
- Test functionality after updates

## ⚠️ Limitations

- **Browser-Only Protection**: Only works within Chrome browser
- **Requires Active Browser**: Protection only active when Chrome is running
- **Site-Specific**: Limited to known banking domains
- **Client-Side Only**: Cannot block mobile apps or other browsers

## 🆘 Support and Issues

### Common Issues

1. **Extension Icon Missing**: Check if Chrome is hiding the icon
2. **Permissions Denied**: Manually grant required permissions
3. **Settings Not Saving**: Check available storage space
4. **Banking Site Changes**: Report new URLs for updates

### Getting Help

For technical issues or feature requests:

1. Check the troubleshooting section
2. Review the activity logs for error patterns
3. Try resetting to default settings
4. Document the issue with screenshots if possible

## 📄 Legal and Compliance

### Disclaimer

This extension is provided for security purposes. Users are responsible for:

- Ensuring compliance with banking terms of service
- Managing legitimate financial transactions appropriately
- Understanding the security implications of browser extensions
- Regular monitoring and maintenance of the extension

### Privacy Policy

The E-Transfer Blocker extension:

- Does not collect personal information
- Stores settings locally only
- Does not transmit data externally
- Operates entirely within your browser

---

**Version**: 1.0.0  
**Last Updated**: June 2025  
**Compatibility**: Chrome Browser (Manifest V3)
>>>>>>> add readme.md
