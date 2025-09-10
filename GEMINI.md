# CSES Chrome Extension Development Plan

## Current Status
**Phase 5: Polish & Testing** is currently in progress. The core features of the extension have been implemented. The focus is now on improving the user experience and ensuring stability.

- **Completed in this phase:**
  - Remembering user's preferred language and font size.
  - Auto-saving code for each problem.

**Next Steps:**
- Continue with polishing and bug fixing.
- Consider implementing features from the "Future Enhancements" list.

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
- **Challenge**: CSES only accepts file uploads, not direct text submission
- **Solution Approach**:
  1. Convert code editor content to Blob
  2. Create File object from Blob with appropriate extension (.cpp, .java, .py)
  3. Programmatically populate the file input field
  4. Trigger the submission form
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
  - Lightweight alternative: CodeMirror 6
- **Storage**: Chrome Storage API
- **DOM Manipulation**: Vanilla JavaScript or lightweight library
- **File Handling**: File API and Blob API

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

### 3. Submission Process
```javascript
// Step 1: Get code from editor
// Step 2: Detect selected language
// Step 3: Create file with appropriate extension
// Step 4: Find CSES file input element
// Step 5: Create DataTransfer object
// Step 6: Set files property of input element
// Step 7: Trigger change event
// Step 8: Find and click submit button
// Step 9: Show submission status to user
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

## User Interface Design

### 1. Editor Container
- **Position**: Below problem statement, above submission area
- **Layout**: 
  - Top bar: Language selector, Template dropdown, Settings icon
  - Main area: Code editor (height: 400-600px, resizable)
  - Bottom bar: Submit button, Save button, Status indicator

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

## Security Considerations
- **Content Security Policy**: Ensure compatibility with CSES CSP
- **Input Sanitization**: Sanitize template names and code
- **Permissions**: Request minimal required permissions
- **Code Execution**: Never execute user code in extension context

## Development Phases

### Phase 1: Basic Setup (Day 1-2)
- Create extension structure
- Implement content script injection
- Basic DOM manipulation to add editor container

### Phase 2: Editor Integration (Day 3-4)
- Integrate Monaco/CodeMirror editor
- Implement language switching
- Add syntax highlighting

### Phase 3: Submission System (Day 5-6)
- Implement file creation from code
- Develop automatic submission logic
- Test with all three languages

### Phase 4: Template System (Day 7-8)
- Create template storage structure
- Implement CRUD operations for templates
- Build template UI in options page

### Phase 5: Polish & Testing (Day 9-10)
- Add error handling
- Implement auto-save
- Create user-friendly UI
- Comprehensive testing on different problems

## Testing Strategy

### Unit Tests
- File creation logic
- Template CRUD operations
- Storage operations

### Integration Tests
- Editor initialization on CSES pages
- Submission flow for each language
- Template insertion

### Manual Testing Checklist
- [ ] Extension installs correctly
- [x] Editor appears on problem pages
- [x] Code highlighting works for all languages
- [x] Templates can be saved and loaded
- [x] Auto-submission works consistently
- [ ] Error messages are clear
- [x] Settings persist across sessions

## Future Enhancements
1. **Problem Statistics**: Track success rate per problem
2. **Code Sharing**: Export/Import solutions
3. **Diff Checker**: Compare solutions
4. **Test Case Runner**: Local test case execution
5. **Multi-tab Support**: Sync code across tabs
6. **Backup System**: Cloud backup of solutions
7. **Contest Mode**: Special features for contests
8. **AI Hints**: Integration with AI for hints (optional)

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
- [ ] Extension works reliably across all CSES problems
- [ ] Performance impact is minimal (< 100ms load time)
- ✅ User data is preserved across sessions
- ✅ Auto-save functionality is implemented.