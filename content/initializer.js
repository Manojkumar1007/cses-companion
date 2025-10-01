( () => {
  try {
    const vsUrl = document.currentScript.dataset.vsUrl;

    if (!vsUrl) {
      throw new Error('CSES Companion: vsUrl not found');
    }

    require.config({ paths: { 'vs': vsUrl } });

    require(['vs/editor/editor.main'], () => {
      // Initialize editor after monaco is loaded
      setTimeout(() => {
        const editorContainer = document.getElementById('cses-editor-container');
        if (!editorContainer) { return; }

        // Detect website theme and set editor theme accordingly
        function getWebsiteTheme() {
          // Check for dark theme indicators on the website
          const bodyStyle = window.getComputedStyle(document.body);
          const bgColor = bodyStyle.backgroundColor;
          const isDarkTheme = bgColor && 
            (bgColor.includes('255, 255, 255') || bgColor.includes('255, 255, 255') ? false : true);
          
          // Alternative method: Check for CSS variables or classes that indicate theme
          const hasDarkClass = document.body.classList.contains('dark-theme') || 
                              document.body.classList.contains('dark');
          
          // Additional check: if background color is dark
          const bgColorMatch = bgColor.match(/\d+,\s*\d+,\s*\d+/);
          if (bgColorMatch) {
            const [r, g, b] = bgColorMatch[0].split(',').map(n => parseInt(n.trim()));
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            return brightness < 128 || hasDarkClass; // Brightness value < 128 is considered dark
          }
          
          // Default to dark if no specific theme detected
          return true;
        }

        // Set initial theme based on website
        const initialTheme = getWebsiteTheme() ? 'vs-dark' : 'vs';

        const editor = monaco.editor.create(editorContainer, {
          value: '// Write your code here',
          theme: initialTheme,
          language: 'cpp',
          fontSize: 16,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly: false
        });

        window.addEventListener('message', (event) => {
          if (event.source !== window || !event.data.type?.startsWith('cses-companion-')) return;

          const { type, language, fontSize, code } = event.data;
          if (type === 'cses-companion-set-lang') {
            monaco.editor.setModelLanguage(editor.getModel(), language);
          } else if (type === 'cses-companion-set-font') {
            editor.updateOptions({ fontSize: fontSize });
          } else if (type === 'cses-companion-get-code') {
            console.log('Getting code for submission...');
            const value = editor.getValue();
            window.postMessage({ type: 'cses-companion-response-code', code: value }, '*');
          } else if (type === 'cses-companion-insert-code') {
            editor.setValue(code);
          } else if (type === 'cses-companion-get-code-for-save') {
            const value = editor.getValue();
            window.postMessage({ type: 'cses-companion-response-code-for-save', code: value }, '*');
          } else if (type === 'cses-companion-get-code-for-run') {
            const value = editor.getValue();
            window.postMessage({ type: 'cses-companion-response-code-for-run', code: value }, '*');
          } else if (type === 'cses-companion-get-code-for-submit') {
            const value = editor.getValue();
            window.postMessage({ type: 'cses-companion-response-code-for-submit', code: value }, '*');
          } else if (type === 'cses-companion-update-theme') {
            const isDarkTheme = event.data.isDarkTheme;
            const newTheme = isDarkTheme ? 'vs-dark' : 'vs';
            monaco.editor.setTheme(newTheme);
          }
        });

      }, 0);

      // Detect website theme and set editor theme accordingly
      function getWebsiteTheme() {
        // Check for dark theme indicators on the website
        const bodyStyle = window.getComputedStyle(document.body);
        const bgColor = bodyStyle.backgroundColor;
        const isDarkTheme = bgColor && 
          (bgColor.includes('255, 255, 255') || bgColor.includes('255, 255, 255') ? false : true);
        
        // Alternative method: Check for CSS variables or classes that indicate theme
        const hasDarkClass = document.body.classList.contains('dark-theme') || 
                            document.body.classList.contains('dark');
        
        // Additional check: if background color is dark
        const bgColorMatch = bgColor.match(/\d+,\s*\d+,\s*\d+/);
        if (bgColorMatch) {
          const [r, g, b] = bgColorMatch[0].split(',').map(n => parseInt(n.trim()));
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          return brightness < 128 || hasDarkClass; // Brightness value < 128 is considered dark
        }
        
        // Default to dark if no specific theme detected
        return true;
      }

      // Set up a theme observer to handle website theme changes
      const themeObserver = new MutationObserver(function(mutations) {
        let themeChanged = false;
        for (const mutation of mutations) {
          if (mutation.type === 'attributes') {
            // Check for changes to common theme-related attributes
            if (mutation.attributeName === 'class' || 
                mutation.attributeName === 'style' || 
                mutation.attributeName === 'data-theme') {
              themeChanged = true;
              break;
            }
          }
        }
        if (themeChanged) {
          setTimeout(() => {
            // Re-detect theme and update editor if needed
            const isDarkTheme = getWebsiteTheme();
            const currentTheme = isDarkTheme ? 'vs-dark' : 'vs';
            monaco.editor.setTheme(currentTheme);
          }, 100);
        }
      });

      // Observe multiple potential theme containers
      themeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['class', 'style', 'data-theme']
      });
      
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'style', 'data-theme']
      });
    });
  } catch (err) {
    console.error('CSES Companion: Fatal error in initializer.js', err);
  }
})();