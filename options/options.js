document.addEventListener('DOMContentLoaded', () => {
    const languageSelector = document.getElementById('template-language');
    const templatesList = document.getElementById('templates-list');
    const newTemplateBtn = document.getElementById('new-template-btn');
    const templateEditor = document.getElementById('template-editor');
    const templateIdInput = document.getElementById('template-id');
    const templateNameInput = document.getElementById('template-name');
    const templateCodeInput = document.getElementById('template-code');
    const saveTemplateBtn = document.getElementById('save-template-btn');
    const cancelTemplateBtn = document.getElementById('cancel-template-btn');

    let currentLanguage = languageSelector.value;

    async function renderTemplates() {
        templatesList.innerHTML = '';
        const templates = await getTemplatesForLanguage(currentLanguage);
        templates.forEach(template => {
            const templateEl = document.createElement('div');
            templateEl.classList.add('template-item');
            templateEl.innerHTML = `
                <div class="template-name">${template.name}</div>
                <div class="template-actions">
                    <button class="edit-template-btn" data-id="${template.id}">Edit</button>
                    <button class="delete-template-btn" data-id="${template.id}">Delete</button>
                </div>
            `;
            templatesList.appendChild(templateEl);
        });
    }

    function showEditor(template = null) {
        templateEditor.classList.remove('hidden');
        if (template) {
            templateIdInput.value = template.id;
            templateNameInput.value = template.name;
            templateCodeInput.value = template.code;
        } else {
            templateIdInput.value = '';
            templateNameInput.value = '';
            templateCodeInput.value = '';
        }
    }

    function hideEditor() {
        templateEditor.classList.add('hidden');
    }

    languageSelector.addEventListener('change', () => {
        currentLanguage = languageSelector.value;
        renderTemplates();
    });

    newTemplateBtn.addEventListener('click', () => {
        showEditor();
    });

    saveTemplateBtn.addEventListener('click', async () => {
        const template = {
            id: templateIdInput.value,
            name: templateNameInput.value,
            code: templateCodeInput.value
        };
        await saveTemplate(currentLanguage, template);
        hideEditor();
        renderTemplates();
    });

    cancelTemplateBtn.addEventListener('click', () => {
        hideEditor();
    });

    templatesList.addEventListener('click', async (event) => {
        const target = event.target;
        if (target.classList.contains('edit-template-btn')) {
            const templateId = target.dataset.id;
            const templates = await getTemplatesForLanguage(currentLanguage);
            const template = templates.find(t => t.id === templateId);
            showEditor(template);
        } else if (target.classList.contains('delete-template-btn')) {
            const templateId = target.dataset.id;
            if (confirm('Are you sure you want to delete this template?')) {
                await deleteTemplate(currentLanguage, templateId);
                renderTemplates();
            }
        }
    });

    renderTemplates();
});