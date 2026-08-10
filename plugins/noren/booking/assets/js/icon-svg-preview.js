(function () {
    var EMPTY = '<span style="color:#ccc;font-size:11px;">—</span>';

    function initField(textarea) {
        if (textarea.dataset.svgPreviewInit) return;
        textarea.dataset.svgPreviewInit = '1';

        var wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.gap = '12px';
        wrapper.style.alignItems = 'flex-start';

        textarea.parentNode.insertBefore(wrapper, textarea);
        wrapper.appendChild(textarea);
        textarea.style.flex = '1';
        textarea.style.minWidth = '0';

        var preview = document.createElement('div');
        preview.style.width = '40px';
        preview.style.height = '40px';
        preview.style.flexShrink = '0';
        preview.style.display = 'flex';
        preview.style.alignItems = 'center';
        preview.style.justifyContent = 'center';
        preview.style.border = '1px solid #e0e4f0';
        preview.style.borderRadius = '8px';
        preview.style.background = '#f8f9ff';
        preview.style.color = '#4f6bed';
        preview.style.overflow = 'hidden';
        preview.innerHTML = textarea.value.trim() || EMPTY;
        wrapper.appendChild(preview);

        textarea.addEventListener('input', function () {
            var val = textarea.value.trim();
            preview.innerHTML = val || EMPTY;
        });
    }

    function scan(root) {
        (root || document).querySelectorAll('.icon-svg-field textarea').forEach(initField);
    }

    scan();

    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (node) {
                if (node.nodeType !== 1) return;
                if (node.matches && node.matches('.icon-svg-field textarea')) {
                    initField(node);
                } else if (node.querySelectorAll) {
                    scan(node);
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
