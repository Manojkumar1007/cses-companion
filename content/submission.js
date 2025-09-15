(() => {
  if (window.location.href.includes('/submit')) {
    chrome.storage.local.get('codeToSubmit', (result) => {
      if (chrome.runtime?.id && result.codeToSubmit) {
        const { code, language, filename } = result.codeToSubmit;

        // Map our language codes to CSES language values
        const csesLanguages = {
          'cpp': 'C++',
          'java': 'Java',
          'python': 'Python 3'
        };
        const csesLanguage = csesLanguages[language];

        const form = document.querySelector('form[action*="/submit"]');
        if (!form) {
          console.error('CSES Companion: Submission form not found.');
          return;
        }

        // Select the language
        const languageSelect = form.querySelector('select[name="language"]');
        if (languageSelect && csesLanguage) {
          languageSelect.value = csesLanguage;
        }

        // Create and inject the file
        try {
          const file = new File([code], filename, { type: 'text/plain' });
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          const fileInput = form.querySelector('input[type="file"]');

          if (fileInput) {
            fileInput.files = dataTransfer.files;

            // Clear the stored code and submit
            chrome.storage.local.remove('codeToSubmit', () => {
              form.submit();
            });
          } else {
            console.error('CSES Companion: File input not found on the form!');
          }
        } catch (error) {
          console.error('CSES Companion: Error during submission process:', error);
        }
      }
    });
  }
})();