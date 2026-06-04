var ICON_PICKER_ICONS = [
    'Anchor','Activity','Award','AlertTriangle',
    'Baby','BadgeCheck','Bell','Bike','Binoculars','Building',
    'Calendar','Camera','Car','Check','CheckCircle2','Clock','Cloud','CloudRain','Coffee','Compass','CreditCard',
    'Dumbbell','Droplets',
    'Eye',
    'Fish','Flame','Flashlight',
    'Gift','Globe',
    'Headphones','Heart','HelpCircle',
    'Image','Info',
    'Key',
    'Leaf','LifeBuoy','Lock',
    'Mail','Map','MapPin','Medal','MessageCircle','Moon','Mountain','Music',
    'Navigation','Navigation2',
    'Palmtree','Phone','Plane','Plus',
    'Salad','Search','Shield','ShieldCheck','Ship','ShoppingBag','Sparkles','Star','Sun','Sunrise','Sunset',
    'Tag','Thermometer','Ticket','TreePine','Trophy',
    'Umbrella','Users','User','UserCheck','UtensilsCrossed',
    'Video',
    'Waves','Wind','Wine',
    'Zap',
];

function _toKebab(str) {
    return str.replace(/([A-Z])/g, function(m, c, i) {
        return (i > 0 ? '-' : '') + c.toLowerCase();
    });
}

function _extractSvg(el) {
    var svg = el.querySelector('svg');
    if (!svg) return '';
    // Clean up: remove class, set size via style
    var clone = svg.cloneNode(true);
    clone.removeAttribute('class');
    clone.setAttribute('width', '100%');
    clone.setAttribute('height', '100%');
    clone.setAttribute('stroke', 'currentColor');
    return clone.outerHTML;
}

function iconPickerRender(fieldId, filter) {
    if (typeof lucide === 'undefined') return;
    var grid = document.getElementById(fieldId + '_grid');
    if (!grid) return;
    var current = document.getElementById(fieldId).value;
    var icons = filter
        ? ICON_PICKER_ICONS.filter(function(n) { return n.toLowerCase().indexOf(filter.toLowerCase()) !== -1; })
        : ICON_PICKER_ICONS;

    grid.innerHTML = '';
    icons.forEach(function(name) {
        var isSelected = name === current;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.title = name;
        btn.style.cssText = [
            'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;',
            'padding:7px 4px;border-radius:8px;cursor:pointer;border:2px solid;',
            'font-size:9px;color:#555;background:#fff;transition:all 0.15s;min-width:0;',
            isSelected
                ? 'border-color:#4f6bed;background:#eef1ff;color:#4f6bed;font-weight:700;'
                : 'border-color:#eaeef8;'
        ].join('');

        var ico = document.createElement('i');
        ico.setAttribute('data-lucide', _toKebab(name));
        ico.style.cssText = 'width:20px;height:20px;stroke:' + (isSelected ? '#4f6bed' : '#666') + ';flex-shrink:0;';

        var lbl = document.createElement('span');
        lbl.textContent = name.length > 9 ? name.slice(0, 8) + '…' : name;
        lbl.style.overflow = 'hidden';
        lbl.style.textOverflow = 'ellipsis';
        lbl.style.maxWidth = '54px';

        btn.appendChild(ico);
        btn.appendChild(lbl);
        btn.addEventListener('click', function() {
            // Extract SVG after Lucide has rendered it
            var svgStr = _extractSvg(btn);
            iconPickerSelect(fieldId, name, svgStr);
        });
        grid.appendChild(btn);
    });

    lucide.createIcons({ nodes: grid.querySelectorAll('[data-lucide]') });
}

function iconPickerSelect(fieldId, name, svgStr) {
    // Save name
    document.getElementById(fieldId).value = name;
    // Save SVG
    var svgInput = document.getElementById(fieldId + '_svg');
    if (svgInput) svgInput.value = svgStr || '';

    // Update label
    var label = document.getElementById(fieldId + '_label');
    if (label) label.textContent = name;

    // Update preview
    var preview = document.getElementById(fieldId + '_preview');
    if (preview && svgStr) {
        preview.innerHTML = svgStr;
        // Style the SVG
        var svg = preview.querySelector('svg');
        if (svg) {
            svg.style.width = '22px';
            svg.style.height = '22px';
            svg.style.stroke = '#4f6bed';
        }
    }

    // Re-render grid
    var searchEl = document.getElementById(fieldId + '_search');
    iconPickerRender(fieldId, searchEl ? searchEl.value : '');
}

function iconPickerClear(fieldId) {
    document.getElementById(fieldId).value = '';
    var svgInput = document.getElementById(fieldId + '_svg');
    if (svgInput) svgInput.value = '';
    var label = document.getElementById(fieldId + '_label');
    if (label) label.textContent = 'No icon selected';
    var preview = document.getElementById(fieldId + '_preview');
    if (preview) preview.innerHTML = '<span style="color:#bbb;font-size:18px;">?</span>';
    iconPickerRender(fieldId, '');
}

function iconPickerSearch(fieldId) {
    var el = document.getElementById(fieldId + '_search');
    iconPickerRender(fieldId, el ? el.value : '');
}
