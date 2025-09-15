# CSES Chrome Extension Development Plan

## Current Status
**Project Completed**



## Project Overview
Build a Chrome extension for the CSES (Code Submission Evaluation System) website that enhances the coding experience with an integrated code editor and automated submission capabilities.

## Target Website
- **URL**: https://cses.fi/
- **Purpose**: Competitive programming practice platform with algorithmic problems

## Core Features

### 1. In-Website Code Editor
- **Integration Point**: Inject custom code editor into CSES problem pages
- **Supported Languages**: 
  - C++ (with standard competitive programming libraries)
  - Java
  - Python (Python 3)
- **Editor Requirements**:
  - Syntax highlighting for all three languages
  - Auto-indentation
  - Line numbers
  - Theme support (light/dark mode)
  - Code folding capabilities
  - Auto-completion for common keywords
  - Bracket matching
  - Find and replace functionality (Ctrl+F)

### 2. Automatic Code Submission
- **Challenge**: The submission form is on a separate page (`/submit/...`) from the problem description (`/task/...`).
- **Solution Approach (Revised)**:
  1. On the `/task` page, clicking "Submit" saves the code to `chrome.storage.local`.
  2. The user is then automatically navigated to the `/submit` page.
  3. On the `/submit` page, a script retrieves the code from storage.
  4. The script then creates a `File` object, populates the form, and triggers the submission.
  5. The stored code is cleared to prevent re-submission.
- **File Naming Convention**: 
  - `solution.cpp` for C++
  - `Solution.java` for Java
  - `solution.py` for Python

### 3. Code Template Management
- **Template Storage**: Use Chrome's storage API (chrome.storage.local)
- **Features**:
  - Save multiple templates per language
  - Name templates for easy identification
  - Quick template insertion via dropdown or keyboard shortcut
  - Edit existing templates
  - Delete templates
  - Import/Export templates as JSON

### 4. Local Test Case Runner
- **Functionality**: Allows users to run their code against sample test cases directly in the browser.
- **Process**:
  1. Scrape sample input and output from the problem page.
  2. Send the code and sample input to a third-party execution API (Judge0).
  3. Receive the output and compare it with the sample output.
  4. Display the results (pass/fail) to the user in the editor interface.

## Technical Architecture

### Extension Structure
```
cses-extension/
├── manifest.json          # Chrome extension manifest
├── background.js          # Background service worker
├── content/
│   ├── content.js        # Main content script
│   ├── editor.js         # Code editor initialization
│   ├── submission.js     # Submission handling logic
│   └── templates.js      # Template management
├── popup/
│   ├── popup.html        # Extension popup UI
│   ├── popup.js          # Popup logic
│   └── popup.css         # Popup styles
├── options/
│   ├── options.html      # Settings page
│   ├── options.js        # Settings logic
│   └── options.css       # Settings styles
├── lib/
│   └── monaco/           # Monaco editor files
└── styles/
    └── editor.css        # Injected editor styles
```

### Key Technologies
- **Code Editor**: Monaco Editor (same as VS Code)
- **Storage**: Chrome Storage API
- **DOM Manipulation**: Vanilla JavaScript
- **File Handling**: File API and Blob API
- **Code Execution**: Judge0 API (for C++, Java, Python)

## Implementation Details

### 1. Content Script Injection
```javascript
// Detect CSES problem page
// URL pattern: https://cses.fi/problemset/task/*
// Inject editor below problem statement
// Hide original file upload interface (optional toggle)
```

### 2. Editor Integration
```javascript
// Initialize Monaco/CodeMirror
// Set default language based on user preference
// Load saved code if returning to problem
// Auto-save code to local storage every 30 seconds
// Keyboard shortcuts:
//   - Ctrl+Enter: Submit code
//   - Ctrl+S: Save code locally
//   - Ctrl+Shift+T: Insert template
```

### 3. Submission Process (Revised)
```javascript
// On /task page:
// 1. User clicks "Submit".
// 2. Get code from editor.
// 3. Save code to chrome.storage.local with a specific key (e.g., 'codeToSubmit').
// 4. Navigate to the /submit page (e.g., window.location.href = new_url).

// On /submit page:
// 1. Content script runs on page load.
// 2. Check chrome.storage.local for 'codeToSubmit'.
// 3. If found, retrieve the code.
// 4. Find the submission form.
// 5. Create File object, populate the form's file input.
// 6. Submit the form.
// 7. Clear the 'codeToSubmit' key from storage.
```

### 4. Template System
```javascript
// Template structure:
{
  "cpp": [
    {
      "name": "Competitive Programming Template",
      "code": "#include<bits/stdc++.h>...",
      "id": "unique-id",
      "created": "timestamp"
    }
  ],
  "java": [...],
  "python": [...]
}
```

### 5. Local Test Case Runner
- **Scraping**: Identify and parse `<code>` blocks within the problem statement for sample inputs and outputs.
- **UI**: Add a dedicated section below the editor to display sample cases and the results of the test run.
- **API Integration**:
  - On "Run" button click, send a request to the Judge0 API.
  - The request will contain the source code, language ID, and standard input.
  - Handle the API response, which includes stdout, stderr, and execution status.
- **Evaluation**: Compare the `stdout` from the API with the scraped sample output. Handle differences in whitespace and newlines.

## User Interface Design

### 1. Editor Container
- **Position**: Below problem statement, above submission area
- **Layout**: 
  - Top bar: Language selector, Template dropdown, Settings icon
  - Main area: Code editor (height: 400-600px, resizable)
  - Bottom bar: Run button, Submit button, Save button, Status indicator
  - **New**: Sample I/O and Results panel below the editor.

### 2. Popup Interface
- **Quick Actions**:
  - Enable/Disable extension
  - Open template manager
  - View submission history
  - Quick settings

### 3. Options Page
- **Settings**:
  - Default language
  - Editor theme
  - Font size
  - Auto-save interval
  - Keyboard shortcuts customization
  - Template management (full interface)

## Data Storage Schema

### Local Storage Structure
```javascript
{
  "settings": {
    "defaultLanguage": "cpp",
    "theme": "dark",
    "fontSize": 14,
    "autoSaveInterval": 30
  },
  "templates": {
    "cpp": [...],
    "java": [...],
    "python": [...]
  },
  "savedCode": {
    "problem-id-1": {
      "cpp": "code...",
      "lastModified": "timestamp"
    }
  },
  "submissionHistory": [
    {
      "problemId": "...",
      "language": "cpp",
      "timestamp": "...",
      "status": "success/failed"
    }
  ]
}
```

## Error Handling

### Potential Issues & Solutions
1. **CSES website structure changes**
   - Use flexible selectors
   - Implement fallback methods
   - Add manual submission button if auto-submit fails

2. **File upload restrictions**
   - Validate file size limits
   - Check supported file extensions
   - Handle submission errors gracefully

3. **Editor loading failures**
   - Provide fallback to simple textarea
   - Cache editor resources locally

4. **Code Execution API Issues**
   - Handle API rate limits and errors.
   - Provide clear feedback to the user if the API is unavailable.
   - Securely handle API keys.

## Security Considerations
- **Content Security Policy**: Ensure compatibility with CSES CSP. The extension will need permission to connect to the Judge0 API endpoint.
- **Input Sanitization**: Sanitize template names and code.
- **Permissions**: Request minimal required permissions.
- **Code Execution**: User code is executed on a remote, sandboxed server (Judge0), not in the extension context.

## Development Phases

### Phase 1: Basic Setup (Day 1-2)
- Create extension structure
- Implement content script injection
- Basic DOM manipulation to add editor container

### Phase 2: Editor Integration (Day 3-4)
- Integrate Monaco/CodeMirror editor
- Implement language switching
- Add syntax highlighting

### Phase 3: Submission System (Initial)
- Implemented a single-page submission flow.
- Discovered this was incorrect as the form is on a separate page.

### Phase 4: Template System (Day 7-8)
- Create template storage structure
- Implement CRUD operations for templates
- Build template UI in options page

### Phase 5: Polish & Testing (Day 9-10)
- Add error handling
- Implement auto-save
- Create user-friendly UI
- Comprehensive testing on different problems

### Phase 6: Local Test Runner (Completed)
- **Step 1: Scrape Sample I/O:** Implemented logic to extract sample cases from the problem page.
- **Step 2: UI Integration:** Created UI elements to display sample cases and execution results.
- **Step 3: API Integration:** Integrated the Judge0 API to handle code execution.
- **Step 4: Evaluation:** Compared the code's output with the sample output and displayed the result.

### Phase 7: Submission Flow Rework (Completed)
- Re-architecting the submission process to use a two-page flow, passing data via `chrome.storage`.

## Testing Strategy

### Unit Tests
- File creation logic
- Template CRUD operations
- Storage operations
- Sample I/O scraping logic
- Output evaluation logic

### Integration Tests
- Editor initialization on CSES pages
- Submission flow for each language
- Template insertion
- Test runner flow with Judge0 API

### Manual Testing Checklist
- [x] Extension installs correctly
- [x] Editor appears on problem pages
- [x] Code highlighting works for all languages
- [x] Templates can be saved and loaded
- [x] Auto-submission works consistently
- [x] Error messages are clear
- [x] Settings persist across sessions
- [x] Sample I/O is scraped correctly
- [x] Code runs against sample cases via "Run" button
- [x] Pass/fail results are displayed correctly

## Completion Summary

This project is now complete. The CSES Companion extension has been developed with all the core features implemented as per the plan. The extension is now ready for packaging and distribution.

**Final Features:**
- In-Website Code Editor
- Automatic Code Submission
- Local Test Case Runner
- Template Management
- Language and Font Size Preferences
- Auto-saving Code

**Next Steps:**
- Package the extension for the Chrome Web Store.
- Write a comprehensive user guide.
- Promote the extension to the competitive programming community.

## Resources & References
- Chrome Extension Documentation: https://developer.chrome.com/docs/extensions/
- Monaco Editor: https://microsoft.github.io/monaco-editor/
- CodeMirror: https://codemirror.net/
- File API: https://developer.mozilla.org/en-US/docs/Web/API/File_API
- CSES Problem Structure Analysis needed

## Notes for Implementation
- Start with a single language (C++) and expand
- Keep the UI minimal and non-intrusive
- Ensure the extension doesn't break existing CSES functionality
- Add keyboard shortcuts for power users
- Consider adding a "vanilla mode" that disables the extension temporarily
- Implement analytics to track most-used features (with user consent)

## Success Criteria
- ✅ Users can write code directly on CSES problem pages
- ✅ One-click submission without manual file creation
- ✅ Templates reduce repetitive code writing
- ✅ Extension works reliably across all CSES problems
- ✅ Performance impact is minimal (< 100ms load time)
- ✅ User data is preserved across sessions
- ✅ Auto-save functionality is implemented.