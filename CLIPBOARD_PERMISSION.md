# Clipboard Write Permission Classification

## Permission: `clipboardWrite`

### Classification
**User Data Access - Write**

### Justification

The `clipboardWrite` permission is required to enable users to copy screenshots of the inspiration quote page to their clipboard.

**Specific Use Case:**
- When users click the screenshot button in the extension, the extension captures the current new tab page (including the quote, author, time, and background image)
- The captured screenshot is then written to the user's clipboard as a PNG image
- This allows users to easily share or save the inspirational quote by pasting it into other applications (messaging apps, note-taking apps, social media, etc.)

**User Benefit:**
- Provides a convenient way for users to share inspirational quotes with others
- Enables users to save quotes as images without requiring additional screenshot tools
- The clipboard write operation is only performed when the user explicitly clicks the screenshot button - it is not automatic or hidden

**Data Handling:**
- The extension only writes image data to the clipboard
- No text or personal data is written to the clipboard
- The clipboard write operation is user-initiated and transparent
- No clipboard data is read, stored, or transmitted anywhere

### Implementation Details
The clipboard write functionality is implemented in `src/App.js` using the `navigator.clipboard.write()` API with `ClipboardItem` to write PNG image data. This requires the `clipboardWrite` permission in Manifest V3.

