( () => {
  // 1. Prevent multiple injections
  if (document.getElementById('cses-editor-container')) {
    return;
  }

  // 2. Create and inject CSS styles
  const styles = `
    #cf-lite-toolbar {
      background-color: #252526;
      padding: 8px;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      display: flex;
      align-items: center;
      gap: 15px;
    }
    #cf-lite-toolbar select, #cf-lite-toolbar button {
      border: 1px solid #444;
      background-color: #3c3c3c;
      color: #CCC;
      padding: 5px 10px;
      border-radius: 3px;
      font-family: inherit;
    }
    #cf-lite-toolbar button:hover:not(:disabled) {
      background-color: #555;
    }
    #cf-lite-submit-btn {
      background-color: #4CAF50;
      color: white;
      border: none;
      margin-left: auto; /* Pushes it to the right */
    }
    #cf-lite-run-btn {
      background-color: #2196F3;
      color: white;
      border: none;
    }
    #cf-lite-run-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    #cses-editor-container {
      height: 500px;
      width: 100%;
      border: 1px solid #333;
      border-top: none; /* Toolbar acts as top border */
    }
  `;
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);

  // 3. Create UI elements
  const mainContainer = document.createElement('div');
  mainContainer.style.marginTop = '20px';

  const toolbar = document.createElement('div');
  toolbar.id = 'cf-lite-toolbar';

  const languageSelector = document.createElement('select');
  const languages = {
    'cpp': { name: 'C++', monacoLang: 'cpp', filename: 'solution.cpp' },
    'java': { name: 'Java', monacoLang: 'java', filename: 'Solution.java' },
    'python': { name: 'Python', monacoLang: 'python', filename: 'solution.py' }
  };
  for (const [value, { name }] of Object.entries(languages)) {
    languageSelector.options.add(new Option(name, value));
  }

  chrome.storage.local.get(['language', 'fontSize'], (result) => {
    if (result.language) {
        languageSelector.value = result.language;
    }
    if (result.fontSize) {
        fontSizeSelector.value = result.fontSize;
    }
    // After setting the initial values, get the templates
    getTemplatesForCurrentLanguage();
    // Set initial editor settings
    window.postMessage({ type: 'cses-companion-set-lang', language: languages[languageSelector.value].monacoLang }, '*');
    window.postMessage({ type: 'cses-companion-set-font', fontSize: parseInt(fontSizeSelector.value) }, '*');
  });

  const fontSizeSelector = document.createElement('select');
  const fontSizes = ['12px', '14px', '16px', '18px', '20px'];
  fontSizes.forEach(size => fontSizeSelector.options.add(new Option(size, size)));
  fontSizeSelector.value = '16px';

  const templateSelector = document.createElement('select');
  templateSelector.id = 'cf-lite-template-selector';
  templateSelector.options.add(new Option('Select a template', ''));

  const runButton = document.createElement('button');
  runButton.id = 'cf-lite-run-btn';
  runButton.textContent = 'Run';
  runButton.disabled = true;

  const submitButton = document.createElement('button');
  submitButton.id = 'cf-lite-submit-btn';
  submitButton.textContent = 'Submit';

  toolbar.append(languageSelector, fontSizeSelector, templateSelector, runButton, submitButton);

  const editorContainer = document.createElement('div');
  editorContainer.id = 'cses-editor-container';

  mainContainer.append(toolbar, editorContainer);

  // 4. Inject UI into the page
  const contentArea = document.querySelector('.content') || document.body;
  contentArea.prepend(mainContainer);

  const originalForm = document.querySelector('form[action^="/problemset/"]');
  if (originalForm) {
      originalForm.style.display = 'none';
  }

  const problemId = window.location.href.match(/task\/(\d+)/)[1];
  const savedCodeKey = `savedCode-${problemId}`;

  // Load saved code
  chrome.storage.local.get(savedCodeKey, (result) => {
    if (result[savedCodeKey]) {
        window.postMessage({ type: 'cses-companion-insert-code', code: result[savedCodeKey] }, '*');
    }
  });

  // Auto-save code
  setInterval(() => {
    window.postMessage({ type: 'cses-companion-get-code-for-save' }, '*');
  }, 5000);

  function updateTemplateSelector(templates) {
    templateSelector.innerHTML = '<option value="">Select a template</option>';
    templates.forEach(template => {
        const option = new Option(template.name, template.code);
        templateSelector.options.add(option);
    });
  }

  function getTemplatesForCurrentLanguage() {
    const currentLanguage = languageSelector.value;
    chrome.runtime.sendMessage({ type: 'get-templates', language: currentLanguage }, (response) => {
        if (response && response.templates) {
            updateTemplateSelector(response.templates);
        }
    });
  }

  // 5. Set up listeners to post messages to the page
  languageSelector.addEventListener('change', (e) => {
    const newLanguage = e.target.value;
    window.postMessage({ type: 'cses-companion-set-lang', language: languages[newLanguage].monacoLang }, '*');
    getTemplatesForCurrentLanguage();
    chrome.storage.local.set({ language: newLanguage });
  });

  fontSizeSelector.addEventListener('change', (e) => {
    const newFontSize = e.target.value;
    window.postMessage({ type: 'cses-companion-set-font', fontSize: parseInt(newFontSize) }, '*');
    chrome.storage.local.set({ fontSize: newFontSize });
  });

  templateSelector.addEventListener('change', (e) => {
    if (e.target.value) {
        window.postMessage({ type: 'cses-companion-insert-code', code: e.target.value }, '*');
    }
  });

  submitButton.addEventListener('click', () => {
    window.postMessage({ type: 'cses-companion-get-code' }, '*');
  });

  // 6. Listen for messages from the injected script
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;

    const { type, code } = event.data;

    if (type === 'cses-companion-response-code') {
        if (!originalForm) return;

        const selectedLanguage = languageSelector.value;
        const filename = languages[selectedLanguage].filename;

        const file = new File([code], filename, { type: 'text/plain' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        const fileInput = originalForm.querySelector('input[type="file"]');
        if(fileInput) fileInput.files = dataTransfer.files;
        originalForm.submit();
    } else if (type === 'cses-companion-response-code-for-save') {
        chrome.storage.local.set({ [savedCodeKey]: code });
    }
  });

  // 7. Inject scripts in the correct order
  const envScript = document.createElement('script');
  envScript.src = chrome.runtime.getURL('content/monaco-environment.js');
  envScript.dataset.baseUrl = chrome.runtime.getURL('lib/monaco/');
  envScript.dataset.workerMainUrl = chrome.runtime.getURL('lib/monaco/vs/base/worker/workerMain.js');
  envScript.onload = () => {
    // After the environment is set up, load the Monaco loader
    const loaderScript = document.createElement('script');
    loaderScript.src = chrome.runtime.getURL('lib/monaco/loader.js');
    loaderScript.onload = () => {
      // After the loader is ready, load the initializer
      const vsUrl = chrome.runtime.getURL('lib/monaco/vs');
      const initializerScript = document.createElement('script');
      initializerScript.src = chrome.runtime.getURL('content/initializer.js');
      initializerScript.dataset.vsUrl = vsUrl;
      document.head.appendChild(initializerScript);
    };
    document.head.appendChild(loaderScript);
  };
  document.head.appendChild(envScript);
})();