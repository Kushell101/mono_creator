const RES = typeof GetParentResourceName === 'function'
    ? GetParentResourceName()
    : 'mono_creator';

/* ------------------------------------------------------------------ */
/* Dane statyczne                                                      */
/* ------------------------------------------------------------------ */

const MALE_PARENTS = [
    [0, 'Benjamin'], [1, 'Daniel'], [2, 'Joshua'], [3, 'Noah'], [4, 'Andrew'], [5, 'Juan'], [6, 'Alex'],
    [7, 'Isaac'], [8, 'Evan'], [9, 'Ethan'], [10, 'Vincent'], [11, 'Angel'], [12, 'Diego'], [13, 'Adrian'],
    [14, 'Gabriel'], [15, 'Michael'], [16, 'Santiago'], [17, 'Kevin'], [18, 'Louis'], [19, 'Samuel'],
    [20, 'Anthony'], [42, 'Claude'], [43, 'Niko'], [44, 'John']
];

const FEMALE_PARENTS = [
    [21, 'Hannah'], [22, 'Audrey'], [23, 'Jasmine'], [24, 'Giselle'], [25, 'Amelia'], [26, 'Isabella'],
    [27, 'Zoe'], [28, 'Ava'], [29, 'Camila'], [30, 'Violet'], [31, 'Sophia'], [32, 'Evelyn'], [33, 'Nicole'],
    [34, 'Ashley'], [35, 'Gracie'], [36, 'Brianna'], [37, 'Natalie'], [38, 'Olivia'], [39, 'Elizabeth'],
    [40, 'Charlotte'], [41, 'Emma'], [45, 'Misty']
];

const FACE_GROUPS = [
    ['Nos', [
        ['noseWidth', 'Szerokość nosa'], ['nosePeakHeight', 'Wysokość czubka'], ['nosePeakLength', 'Długość nosa'],
        ['noseBoneHigh', 'Grzbiet nosa'], ['nosePeakLowering', 'Opadanie czubka'], ['noseBoneTwist', 'Skrzywienie nosa']
    ]],
    ['Brwi i policzki', [
        ['eyebrowHeight', 'Wysokość brwi'], ['eyebrowDepth', 'Głębokość brwi'],
        ['cheekboneHeight', 'Wysokość kości policzkowych'], ['cheekboneWidth', 'Szerokość kości policzkowych'],
        ['cheekWidth', 'Szerokość policzków']
    ]],
    ['Oczy i usta', [['eyeOpening', 'Otwarcie oczu'], ['lipThickness', 'Grubość ust']]],
    ['Szczęka i broda', [
        ['jawBoneWidth', 'Szerokość szczęki'], ['jawBoneBackLength', 'Długość szczęki'], ['chinBone', 'Wysokość brody'],
        ['chinBoneLength', 'Długość brody'], ['chinBoneShape', 'Kształt brody'], ['chinHole', 'Dołek w brodzie']
    ]],
    ['Szyja', [['neckThickness', 'Grubość szyi']]]
];

// Przy otwarciu grupy kamera podjeżdża bliżej tej części twarzy.
const FACE_CAM = { 'Nos': 'faceClose', 'Oczy i usta': 'faceClose' };

const OVERLAY_UI = {
    blemishes: { label: 'Niedoskonałości' },
    facialHair: { label: 'Zarost', color: 'hair' },
    eyebrows: { label: 'Brwi', color: 'hair' },
    ageing: { label: 'Starzenie się skóry' },
    makeup: { label: 'Makijaż', color: 'makeup' },
    blush: { label: 'Róż', color: 'makeup' },
    complexion: { label: 'Cera' },
    sunDamage: { label: 'Uszkodzenia słoneczne' },
    lipstick: { label: 'Szminka', color: 'makeup' },
    moles: { label: 'Pieprzyki i piegi' },
    chestHair: { label: 'Owłosienie klatki' }
};

const EYE_COLORS = [
    'Zielone', 'Szmaragdowe', 'Jasnoniebieskie', 'Oceaniczny błękit', 'Jasnobrązowe', 'Ciemnobrązowe',
    'Piwne', 'Ciemnoszare', 'Jasnoszare', 'Różowe', 'Żółte', 'Fioletowe', 'Czarne', 'Odcienie szarości',
    'Tequila Sunrise', 'Atomowe', 'Warp', 'ECola', 'Space Ranger', 'Yin Yang', 'Tarcza strzelnicza',
    'Jaszczurka', 'Smok', 'Kosmita', 'Koza', 'Uśmiech', 'Opętane', 'Demon', 'Zarażone', 'Obce',
    'Nieumarłe', 'Zombie'
];

const COMPONENT_UI = [
    { kind: 'component', id: 11, label: 'Góra' },
    { kind: 'component', id: 3, label: 'Ręce / tors', hint: 'Dopasuj do wybranej góry, żeby ręce nie przenikały przez ubranie.' },
    { kind: 'component', id: 8, label: 'Podkoszulek' },
    { kind: 'component', id: 4, label: 'Spodnie' },
    { kind: 'component', id: 6, label: 'Buty' },
    { kind: 'component', id: 7, label: 'Dodatki (szalik, łańcuch)' },
    { kind: 'prop', id: 0, label: 'Nakrycie głowy' },
    { kind: 'prop', id: 1, label: 'Okulary' },
    { kind: 'prop', id: 2, label: 'Kolczyki' },
    { kind: 'prop', id: 6, label: 'Zegarek' },
    { kind: 'prop', id: 7, label: 'Bransoletka' },
    { kind: 'component', id: 1, label: 'Maska' },
    { kind: 'component', id: 5, label: 'Plecak' },
    { kind: 'component', id: 9, label: 'Kamizelka' },
    { kind: 'component', id: 10, label: 'Naszywki' }
];

const MONTHS = [
    'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
    'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'
];

const FIRST_NAMES = {
    male: ['James', 'Michael', 'Robert', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Daniel', 'Anthony', 'Tyler', 'Ryan', 'Brandon', 'Dominic', 'Vincent'],
    female: ['Mary', 'Jennifer', 'Linda', 'Elizabeth', 'Jessica', 'Sarah', 'Ashley', 'Emily', 'Samantha', 'Nicole', 'Brianna', 'Megan', 'Alexis', 'Chloe', 'Natalie']
};

// Nazwiska sa wspolne dla obu plci.
const LAST_NAMES = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Anderson', 'Taylor',
    'Thomas', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White', 'Harris', 'Clark', 'Lewis', 'Walker',
    'Hall', 'Young', 'King', 'Wright', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson', 'Carter',
    'Mitchell', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart'
];

const NAME_RE = /^[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]+(?:-[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]+)*$/;

const IDENTITY_ERRORS = ['invalid_first_name', 'invalid_last_name', 'invalid_birthdate', 'invalid_date', 'age_too_young', 'age_too_old', 'invalid_gender'];

const ICONS = {
    identity: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
    heritage: '<circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/>',
    face: '<ellipse cx="12" cy="12" rx="7" ry="9"/><path d="M9 10h.01M15 10h.01M9.5 15.5c1.5 1 3.5 1 5 0"/>',
    hair: '<path d="M5 15c0-6 3-10 7-10s7 4 7 10"/><path d="M5 15c2-1 3-3 3-6M19 15c-2-1-3-3-3-6M9 9c2 1 4 1 6 0"/>',
    skin: '<path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="M19 17l.8 2 2 .8-2 .8L19 23l-.8-2.4-2-.8 2-.8z"/>',
    makeup: '<path d="M10 3h4v7h-4z"/><path d="M9 10h6v4H9z"/><path d="M8 14h8v7H8z"/>',
    clothes: '<path d="M8 4L3 7l2 4 3-1v10h8V10l3 1 2-4-5-3c-1 2-2 3-4 3S9 6 8 4z"/>',
    summary: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M14 10h4M14 14h4M6 16c.5-1.5 1.5-2 3-2s2.5.5 3 2"/>'
};

/* ------------------------------------------------------------------ */
/* Stan                                                                */
/* ------------------------------------------------------------------ */

const state = {
    open: false,
    skinMode: false,
    wardrobeMode: false,
    outfitName: '',
    step: 0,
    settings: { minAge: 18, maxAge: 85, year: 2026, month: 1, day: 1, nameMin: 2, nameMax: 20, maxEyeColor: 31 },
    identity: { firstName: '', lastName: '', day: 1, month: 1, year: 2000, gender: 'male' },
    appearance: null,
    defaults: null,
    limits: null,
    colors: { hair: [], makeup: [] },
    errors: {},
    busy: false,
    submitting: false,
    cancelArmed: false,
    camera: 'body',
    poses: [],
    poseId: null,
    parentsEnabled: true,
    heritageTab: 'both',
    parentPicker: 'mother',
    faceOpen: 'Nos',
    clothCat: 0,
    undo: []
};

const $ = (id) => document.getElementById(id);

const els = {
    root: $('root'),
    rail: $('rail'),
    title: $('title'),
    subtitle: $('subtitle'),
    progress: $('progress'),
    content: $('content'),
    back: $('back'),
    next: $('next'),
    random: $('random'),
    cancel: $('cancel'),
    busy: $('busy'),
    stage: $('stage'),
    dock: $('dock'),
    toasts: $('toasts'),
    outfitModal: $('outfit-name-modal'),
    outfitNameInput: $('outfit-name-input'),
    outfitNameCancel: $('outfit-name-cancel'),
    outfitNameSave: $('outfit-name-save')
};

/* ------------------------------------------------------------------ */
/* Pomocnicze                                                          */
/* ------------------------------------------------------------------ */

function h(tag, props, ...children) {
    const el = document.createElement(tag);

    for (const [key, value] of Object.entries(props || {})) {
        if (value === false || value == null) continue;

        if (key === 'class') el.className = value;
        else if (key.startsWith('on')) el.addEventListener(key.slice(2), value);
        else el.setAttribute(key, value);
    }

    for (const child of children.flat()) {
        if (child == null || child === false) continue;
        el.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }

    return el;
}

function icon(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    svg.setAttribute('viewBox', '0 0 24 24');
    svg.innerHTML = ICONS[name] || '';

    return svg;
}

async function call(name, payload = {}) {
    try {
        const res = await fetch(`https://${RES}/${name}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        return await res.json();
    } catch {
        return { ok: false, error: 'network' };
    }
}

function toast(text) {
    const el = h('div', { class: 'toast' }, text);

    els.toasts.append(el);

    setTimeout(() => el.remove(), 4200);
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const range = (n) => Array.from({ length: n }, (_, i) => i);
const rnd = (a, b) => a + Math.random() * (b - a);
const rndInt = (a, b) => Math.floor(rnd(a, b + 1));
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const clone = (value) => JSON.parse(JSON.stringify(value));
const isMale = () => state.identity.gender === 'male';

let previewTimer = null;
const previewSections = new Set();

// Wysylamy najwyzej co 60 ms - klient i tak stosuje tylko najnowszy stan.
// section = ktora czesc wygladu sie zmienila (klient przebuduje tylko ja); bez niej - calosc.
function queuePreview(section) {
    previewSections.add(section || '*');

    if (previewTimer) return;

    previewTimer = setTimeout(() => {
        previewTimer = null;

        const sections = previewSections.has('*') ? [] : [...previewSections];

        previewSections.clear();

        call('preview', { appearance: state.appearance, sections });
    }, 60);
}

function cancelPreview() {
    clearTimeout(previewTimer);

    previewTimer = null;
    previewSections.clear();
}

// Tak samo jak serwer: "jAN-kowalski" -> "Jan-Kowalski" (podglad w podsumowaniu).
function formatName(value) {
    return value
        .trim()
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join('-');
}

/* ---------- Cofanie (Ctrl+Z) ---------- */

function pushUndo() {
    if (!state.appearance) return;

    const snap = JSON.stringify(state.appearance);

    if (state.undo[state.undo.length - 1] === snap) return;

    state.undo.push(snap);

    if (state.undo.length > 40) state.undo.shift();
}

function undo() {
    const snap = state.undo.pop();

    if (!snap || state.submitting || state.busy) return;

    cancelPreview();

    state.appearance = JSON.parse(snap);

    renderContent(true);
    queuePreview();
    syncParents();
}

/* ------------------------------------------------------------------ */
/* Kontrolki                                                           */
/* ------------------------------------------------------------------ */

// opts.def = wartosc po dwukliku (reset); opts.bipolar = wypelnienie od srodka.
function slider({ label, min, max, step, get, set, format, section, bipolar, def }) {
    const fmt = format || ((v) => (Math.round(v * 100) / 100).toString());
    const out = h('span', { class: 'ctl-value' }, fmt(get()));

    const paint = (value) => {
        const p = ((value - min) / (max - min)) * 100;

        input.style.setProperty('--lo', (bipolar ? Math.min(50, p) : 0) + '%');
        input.style.setProperty('--hi', (bipolar ? Math.max(50, p) : p) + '%');
    };

    const input = h('input', {
        type: 'range',
        min,
        max,
        step,
        value: get(),
        onpointerdown: pushUndo,
        oninput: (event) => {
            const value = Number(event.target.value);

            set(value);
            out.textContent = fmt(value);
            paint(value);
            queuePreview(section);
        },
        ondblclick: () => {
            if (def === undefined) return;

            pushUndo();
            set(def);

            input.value = def;
            out.textContent = fmt(def);
            paint(def);
            queuePreview(section);
        }
    });

    paint(get());

    return h('div', { class: 'ctl' }, h('div', { class: 'ctl-head' }, h('span', { class: 'ctl-label' }, label), out), input);
}

function choiceGrid({ items, get, set, section, render, kind = 'tile', hoverSet, hoverRevert, hoverQueue = true, onCommit, style }) {
    const wrap = h('div', { class: kind === 'swatch' ? 'swatches' : kind === 'pill' ? 'pills' : 'tiles' });
    const buttons = new Map();

    let committed = get();
    let timer = null;
    let hovering = false;

    const mark = () => buttons.forEach((el, value) => el.classList.toggle('on', value === committed));

    const revert = () => {
        clearTimeout(timer);

        if (!hovering) return;

        hovering = false;

        (hoverRevert || (() => set(committed)))();

        if (hoverQueue) queuePreview(section);
    };

    items.forEach((value) => {
        const button = h(
            'button',
            {
                class: kind + (value === committed ? ' on' : ''),
                title: kind === 'swatch' ? String(value + 1) : null,
                style: style ? style(value) : null,
                onmouseenter: () => {
                    clearTimeout(timer);

                    timer = setTimeout(() => {
                        hovering = true;

                        (hoverSet || set)(value);

                        if (hoverQueue) queuePreview(section);
                    }, 60);
                },
                onclick: () => {
                    clearTimeout(timer);
                    revert();
                    pushUndo();

                    committed = value;

                    set(value);
                    mark();
                    queuePreview(section);

                    if (onCommit) onCommit(value);
                }
            },
            render ? render(value) : null
        );

        buttons.set(value, button);
        wrap.append(button);
    });

    wrap.addEventListener('mouseleave', revert);

    // Przewin siatke do zatwierdzonego elementu (po wstawieniu do DOM).
    requestAnimationFrame(() => {
        const el = buttons.get(committed);

        if (el && wrap.isConnected && wrap.scrollHeight > wrap.clientHeight) {
            wrap.scrollTop = el.offsetTop - wrap.clientHeight / 2;
        }
    });

    return wrap;
}

const tileLabel = (value) => (value < 0 ? '∅' : String(value + 1));

function segmented(options, current, onPick) {
    return h(
        'div',
        { class: 'segmented' },
        options.map(([value, text]) => h('button', { class: current === value ? 'on' : '', onclick: () => onPick(value) }, text))
    );
}

function group(title, tools, ...children) {
    return h(
        'div',
        { class: 'group' },
        h('div', { class: 'group-head' }, h('span', { class: 'group-title' }, title), tools ? h('div', { class: 'group-tools' }, tools) : null),
        ...children
    );
}

const tool = (text, onclick) => h('button', { class: 'link', onclick }, text);

/* ------------------------------------------------------------------ */
/* Rodzice w scenie                                                    */
/* ------------------------------------------------------------------ */

function parentsPayload(over = {}) {
    const b = state.appearance.headBlend;
    const mother = { shape: b.shapeFirst, skin: b.skinFirst };
    const father = { shape: b.shapeSecond, skin: b.skinSecond };

    if (over.mother != null) mother.shape = mother.skin = over.mother;
    if (over.father != null) father.shape = father.skin = over.father;

    return { show: true, mother, father };
}

function syncParents() {
    if (!state.parentsEnabled || !state.appearance) return;

    call('parents', currentSteps()[state.step].parents ? parentsPayload() : { show: false });
}

/* ------------------------------------------------------------------ */
/* Kroki                                                               */
/* ------------------------------------------------------------------ */

function stepIdentity() {
    const { identity, settings } = state;

    const clearError = (key, wrap) => {
        if (!state.errors[key]) return;

        delete state.errors[key];

        wrap.classList.remove('error');
        wrap.querySelector('.error-text')?.remove();
    };

    const textField = (key, label, placeholder) => {
        const wrap = h(
            'div',
            { class: 'field' + (state.errors[key] ? ' error' : '') },
            h('label', {}, label),
            h('input', {
                type: 'text',
                value: identity[key],
                placeholder,
                maxlength: settings.nameMax,
                spellcheck: 'false',
                autocomplete: 'off',
                oninput: (event) => {
                    identity[key] = event.target.value;
                    clearError(key, wrap);
                }
            }),
            state.errors[key] && h('div', { class: 'error-text' }, state.errors[key])
        );

        return wrap;
    };

    const yearMax = settings.year - settings.minAge;
    const yearMin = settings.year - settings.maxAge;

    const months = MONTHS.map((name, i) => [i + 1, name]);
    const years = Array.from({ length: yearMax - yearMin + 1 }, (_, i) => yearMax - i);

    const dateWrap = h('div', { class: 'field' + (state.errors.date ? ' error' : '') });
    const ageOut = h('span', { class: 'ctl-value' });

    const showAge = () => {
        ageOut.textContent = `Wiek postaci: ${calcAge()} lat`;
    };

    const daySelect = h('select', {
        onchange: (event) => {
            identity.day = Number(event.target.value);
            clearError('date', dateWrap);
            showAge();
        }
    });

    // Lista dni dopasowana do miesiaca i roku (bez 31 lutego).
    const fillDays = () => {
        const max = new Date(identity.year, identity.month, 0).getDate();

        if (identity.day > max) identity.day = max;

        daySelect.replaceChildren(
            ...Array.from({ length: max }, (_, i) =>
                h('option', { value: i + 1, selected: i + 1 === identity.day ? 'selected' : false }, i + 1)
            )
        );
    };

    const dateSelect = (key, options) =>
        h(
            'select',
            {
                onchange: (event) => {
                    identity[key] = Number(event.target.value);
                    fillDays();
                    clearError('date', dateWrap);
                    showAge();
                }
            },
            options.map(([value, text]) => h('option', { value, selected: value === identity[key] ? 'selected' : false }, text))
        );

    fillDays();
    showAge();

    dateWrap.append(
        h('label', {}, 'Data urodzenia'),
        h('div', { class: 'row3' }, daySelect, dateSelect('month', months), dateSelect('year', years.map((y) => [y, y]))),
        h('div', { style: 'margin-top:8px' }, ageOut)
    );

    if (state.errors.date) {
        dateWrap.append(h('div', { class: 'error-text' }, state.errors.date));
    }

    const genderCard = (value, symbol, text) =>
        h(
            'button',
            { class: identity.gender === value ? 'on' : '', onclick: () => changeGender(value) },
            h('b', {}, symbol),
            h('span', {}, text)
        );

    return [
        h('div', { class: 'gender' }, genderCard('male', '♂', 'Mężczyzna'), genderCard('female', '♀', 'Kobieta')),
        textField('firstName', 'Imię', 'np. John'),
        textField('lastName', 'Nazwisko', 'np. Smith'),
        dateWrap,
        h('p', { class: 'note' }, 'Zmiana płci resetuje wygląd do ustawień domyślnych. Resztę ustawisz w kolejnych krokach — możesz wracać do nich w dowolnej kolejności.')
    ];
}

function randomName() {
    state.identity.firstName = pick(FIRST_NAMES[state.identity.gender]);
    state.identity.lastName = pick(LAST_NAMES);
    state.errors = {};

    renderContent(true);
}

function stepHeritage() {
    const blend = state.appearance.headBlend;
    const keys = state.heritageTab === 'both' ? ['shape', 'skin'] : [state.heritageTab];
    const slotOf = (role) => (role === 'mother' ? 'First' : 'Second');
    const read = (role) => blend[keys[0] + slotOf(role)];
    const roleList = { mother: FEMALE_PARENTS, father: MALE_PARENTS };
    const nameOf = (role) => (roleList[role].find((p) => p[0] === read(role)) || [0, '—'])[1];

    const card = (role, label) =>
        h(
            'button',
            { class: 'pcard' + (state.parentPicker === role ? ' on' : ''), onclick: () => { state.parentPicker = role; renderContent(true); } },
            h('span', { class: 'pcard-avatar' }, nameOf(role).charAt(0)),
            h('span', {}, h('span', { class: 'pcard-role' }, label), h('span', { class: 'pcard-name' }, nameOf(role)))
        );

    const role = state.parentPicker;

    const picker = choiceGrid({
        kind: 'pill',
        items: roleList[role].map((p) => p[0]),
        section: 'headBlend',
        hoverQueue: false,
        render: (id) => roleList[role].find((p) => p[0] === id)[1],
        get: () => read(role),
        set: (id) => keys.forEach((k) => { blend[k + slotOf(role)] = id; }),
        hoverSet: (id) => call('parents', parentsPayload({ [role]: id })),
        hoverRevert: () => syncParents(),
        onCommit: () => { syncParents(); renderContent(true); }
    });

    return [
        h('p', { class: 'note' }, 'Rodzice stoją obok postaci. Najedź na imię, żeby zobaczyć ich twarz; kliknij, aby ją wybrać. Suwak ustawia, do kogo postać jest bardziej podobna.'),
        segmented([['both', 'Rysy i skóra'], ['shape', 'Tylko rysy'], ['skin', 'Tylko skóra']], state.heritageTab, (tab) => {
            state.heritageTab = tab;
            renderContent(true);
        }),
        h('div', { class: 'parents' }, card('mother', 'Matka'), card('father', 'Ojciec')),
        slider({
            label: 'Podobieństwo',
            min: 0,
            max: 1,
            step: 0.01,
            section: 'headBlend',
            def: 0.5,
            get: () => blend[keys[0] + 'Mix'],
            set: (v) => keys.forEach((k) => { blend[k + 'Mix'] = v; }),
            format: (v) => `Matka ${Math.round((1 - v) * 100)}% · Ojciec ${Math.round(v * 100)}%`
        }),
        group(role === 'mother' ? 'Wybierz matkę' : 'Wybierz ojca', null, picker)
    ];
}

function randomHeritage() {
    const b = state.appearance.headBlend;

    pushUndo();

    b.shapeFirst = b.skinFirst = pick(FEMALE_PARENTS)[0];
    b.shapeSecond = b.skinSecond = pick(MALE_PARENTS)[0];
    b.shapeMix = b.skinMix = Math.round(rnd(0.15, 0.85) * 100) / 100;

    renderContent(true);
    queuePreview('headBlend');
    syncParents();
}

function stepFace() {
    const features = state.appearance.faceFeatures;

    const resetGroup = (fields) => {
        pushUndo();
        fields.forEach(([key]) => { features[key] = 0; });
        renderContent(true);
        queuePreview('faceFeatures');
    };

    const accordion = ([title, fields]) => {
        const open = state.faceOpen === title;
        const changed = fields.filter(([key]) => Math.abs(features[key]) > 0.001).length;

        return h(
            'div',
            { class: 'acc' + (open ? ' open' : '') },
            h(
                'div',
                {
                    class: 'acc-head',
                    onclick: () => {
                        state.faceOpen = open ? null : title;
                        renderContent(true);
                        setCamera(state.faceOpen ? (FACE_CAM[title] || 'face') : 'face');
                    }
                },
                h('span', {}, title),
                h('span', { class: 'ctl-value' }, changed ? `zmieniono: ${changed}  ` : '', h('span', { class: 'chev' }, '›'))
            ),
            h(
                'div',
                { class: 'acc-body' },
                fields.map(([key, label]) =>
                    slider({
                        label,
                        min: -1,
                        max: 1,
                        step: 0.05,
                        bipolar: true,
                        def: 0,
                        section: 'faceFeatures',
                        get: () => features[key],
                        set: (v) => { features[key] = v; }
                    })
                ),
                h('div', { class: 'group-tools', style: 'justify-content:flex-end; margin-bottom:10px' }, tool('Zeruj tę grupę', () => resetGroup(fields)))
            )
        );
    };

    return [
        h('p', { class: 'note' }, 'Dwuklik na suwaku zeruje go. Otwarcie grupy przybliża kamerę do tej części twarzy.'),
        ...FACE_GROUPS.map(accordion)
    ];
}

function randomFace() {
    const features = state.appearance.faceFeatures;

    pushUndo();

    Object.keys(features).forEach((key) => {
        features[key] = Math.round(clamp(rnd(-0.6, 0.6), -1, 1) * 20) / 20;
    });

    renderContent(true);
    queuePreview('faceFeatures');
}

function overlayGroup(key) {
    const ui = OVERLAY_UI[key];
    const overlays = state.appearance.overlays;
    const styleKey = key + 'Style';
    const count = Math.max(state.limits.overlays[key] ?? 1, 1);

    const controls = [
        choiceGrid({
            items: [-1, ...range(count)],
            section: 'overlays',
            render: tileLabel,
            get: () => overlays[styleKey],
            set: (v) => { overlays[styleKey] = v; },
            onCommit: () => renderContent(true)
        })
    ];

    // Intensywnosc i kolor maja sens dopiero, gdy wybrano jakis styl.
    if (overlays[styleKey] >= 0) {
        controls.push(
            h('div', { style: 'margin-top:14px' }),
            slider({
                label: 'Intensywność',
                section: 'overlays',
                min: 0,
                max: 1,
                step: 0.05,
                def: 1,
                get: () => overlays[key + 'Opacity'],
                set: (v) => { overlays[key + 'Opacity'] = v; },
                format: (v) => `${Math.round(v * 100)}%`
            })
        );

        if (ui.color) {
            controls.push(paletteGrid('Kolor', ui.color, 'overlays', () => overlays[key + 'Color'], (v) => { overlays[key + 'Color'] = v; }));
        }
    }

    return group(ui.label, null, ...controls);
}

function paletteGrid(label, paletteName, section, get, set) {
    const palette = state.colors[paletteName];

    return h(
        'div',
        {},
        h('div', { class: 'sub-label' }, label),
        choiceGrid({
            kind: 'swatch',
            items: range(palette.length),
            section,
            get,
            set,
            style: (i) => `background: rgb(${palette[i].join(',')})`
        })
    );
}

function stepHair() {
    const { hair, eyeColor } = state.appearance;
    const hairCount = Math.max(state.limits.hair, 1);
    const eyeItems = range(Math.min((state.settings.maxEyeColor ?? 31) + 1, EYE_COLORS.length));

    const nodes = [
        group(
            'Fryzura',
            null,
            choiceGrid({
                items: range(hairCount),
                section: 'hair',
                render: (v) => String(v + 1),
                get: () => hair.style,
                set: (v) => { hair.style = v; }
            }),
            paletteGrid('Kolor włosów', 'hair', 'hair', () => hair.color, (v) => { hair.color = v; }),
            paletteGrid('Pasemka', 'hair', 'hair', () => hair.highlight, (v) => { hair.highlight = v; })
        ),
        overlayGroup('eyebrows')
    ];

    if (isMale()) {
        nodes.push(overlayGroup('facialHair'), overlayGroup('chestHair'));
    }

    nodes.push(
        group(
            'Kolor oczu',
            null,
            choiceGrid({
                kind: 'pill',
                items: eyeItems,
                section: 'eyeColor',
                render: (v) => EYE_COLORS[v],
                get: () => eyeColor.color,
                set: (v) => { eyeColor.color = v; }
            })
        )
    );

    return nodes;
}

function randomHair() {
    const a = state.appearance;
    const colors = state.colors.hair.length || 1;
    const maxEye = Math.min(state.settings.maxEyeColor ?? 31, EYE_COLORS.length - 1);

    pushUndo();

    a.hair.style = rndInt(0, Math.max(state.limits.hair - 1, 0));
    a.hair.color = rndInt(0, colors - 1);
    a.hair.highlight = rndInt(0, colors - 1);
    a.eyeColor.color = rndInt(0, maxEye);
    a.overlays.eyebrowsStyle = rndInt(0, Math.max((state.limits.overlays.eyebrows ?? 1) - 1, 0));
    a.overlays.eyebrowsColor = a.hair.color;

    if (isMale()) {
        a.overlays.facialHairStyle = Math.random() < 0.5 ? -1 : rndInt(0, Math.max((state.limits.overlays.facialHair ?? 1) - 1, 0));
        a.overlays.facialHairColor = a.hair.color;
    }

    renderContent(true);
    queuePreview();
}

const stepSkin = () => ['blemishes', 'ageing', 'complexion', 'sunDamage', 'moles'].map(overlayGroup);
const stepMakeup = () => ['makeup', 'blush', 'lipstick'].map(overlayGroup);

/* ---------- Ubrania ---------- */

const clothingStore = (def) => (def.kind === 'prop' ? state.appearance.props : state.appearance.components);
const clothingPrefix = (def) => (def.kind === 'prop' ? 'p' : 'c') + def.id;

function clothingCount(def) {
    const limits = def.kind === 'prop' ? state.limits.props : state.limits.components;

    return Math.max(limits[String(def.id)] ?? 1, 1);
}

function clothingLabel(def) {
    const drawable = clothingStore(def)[clothingPrefix(def) + 'Drawable'];

    return drawable < 0 ? 'Brak' : `#${drawable + 1}`;
}

function clothingPanel(def, onChange) {
    const isProp = def.kind === 'prop';
    const store = clothingStore(def);
    const prefix = clothingPrefix(def);
    const dk = prefix + 'Drawable';
    const tk = prefix + 'Texture';
    const section = isProp ? 'props' : 'components';
    const cur = { d: store[dk], t: store[tk] };
    const variants = h('div', {});

    const loadVariants = async () => {
        let count = 1;

        if (store[dk] >= 0) {
            const res = await call('getTextures', { kind: def.kind, id: def.id, drawable: store[dk] });

            count = res.count || 1;
        }

        if (cur.t >= count) {
            cur.t = 0;
            store[tk] = 0;
            queuePreview(section);
        }

        variants.replaceChildren(
            ...(count > 1
                ? [
                    h('div', { class: 'sub-label' }, `Wariant kolorystyczny (${count})`),
                    choiceGrid({
                        items: range(count),
                        section,
                        render: (v) => String(v + 1),
                        get: () => cur.t,
                        set: (v) => { store[tk] = v; },
                        onCommit: (v) => { cur.t = v; }
                    })
                ]
                : [])
        );
    };

    const drawables = choiceGrid({
        items: isProp ? [-1, ...range(clothingCount(def))] : range(clothingCount(def)),
        section,
        render: tileLabel,
        get: () => cur.d,
        set: (v) => { store[dk] = v; store[tk] = 0; },
        hoverSet: (v) => { store[dk] = v; store[tk] = 0; },
        hoverRevert: () => { store[dk] = cur.d; store[tk] = cur.t; },
        onCommit: (v) => {
            cur.d = v;
            cur.t = 0;
            loadVariants();
            onChange();
        }
    });

    const reset = () => {
        pushUndo();

        const base = state.defaults[isProp ? 'props' : 'components'];

        store[dk] = base[dk];
        store[tk] = base[tk];

        renderContent(true);
        queuePreview(section);
    };

    const shuffle = async () => {
        pushUndo();
        await randomizeClothing(def);
        renderContent(true);
        queuePreview(section);
    };

    loadVariants();

    return h(
        'div',
        {},
        group(def.label, [tool('Losuj', shuffle), tool(isProp ? 'Zdejmij' : 'Domyślne', reset)], drawables),
        variants,
        def.hint && h('p', { class: 'note', style: 'margin-top:14px' }, def.hint)
    );
}

async function randomizeClothing(def) {
    const store = clothingStore(def);
    const prefix = clothingPrefix(def);
    const count = clothingCount(def);
    const drawable = rndInt(0, count - 1);

    store[prefix + 'Drawable'] = drawable;
    store[prefix + 'Texture'] = 0;

    const res = await call('getTextures', { kind: def.kind, id: def.id, drawable });

    store[prefix + 'Texture'] = rndInt(0, Math.max((res.count || 1) - 1, 0));
}

async function randomOutfit() {
    pushUndo();

    // Tylko podstawowe elementy; maski, plecaki, kamizelki itd. zostaja bez zmian.
    const core = COMPONENT_UI.filter((d) => d.kind === 'component' && [11, 8, 4, 6].includes(d.id));
    const props = COMPONENT_UI.filter((d) => d.kind === 'prop' && [0, 1].includes(d.id));

    for (const def of core) await randomizeClothing(def);

    for (const def of props) {
        if (Math.random() < 0.6) {
            const store = clothingStore(def);

            store[clothingPrefix(def) + 'Drawable'] = -1;
            store[clothingPrefix(def) + 'Texture'] = 0;
        } else {
            await randomizeClothing(def);
        }
    }

    renderContent(true);
    queuePreview();
}

function stepClothes() {
    const catButtons = [];

    const refreshCats = () => COMPONENT_UI.forEach((def, i) => { catButtons[i].querySelector('em').textContent = clothingLabel(def); });

    const nav = h(
        'div',
        { class: 'cats' },
        COMPONENT_UI.map((def, i) => {
            const button = h(
                'button',
                { class: 'cat' + (i === state.clothCat ? ' on' : ''), onclick: () => { state.clothCat = i; renderContent(true); } },
                h('span', {}, def.label),
                h('em', {}, clothingLabel(def))
            );

            catButtons.push(button);

            return button;
        })
    );

    return [h('div', { class: 'cloth' }, nav, clothingPanel(COMPONENT_UI[state.clothCat], refreshCats))];
}

/* ---------- Podsumowanie ---------- */

function stepSummary() {
    const { identity } = state;
    const pad = (n) => String(n).padStart(2, '0');

    return [
        h(
            'div',
            { class: 'idcard' },
            h('div', { class: 'idcard-type' }, 'Dowód osobisty · Monoskrypt RP'),
            h('div', { class: 'idcard-name' }, formatName(identity.firstName) || '—', h('br'), formatName(identity.lastName) || '—'),
            h('div', { class: 'kv' }, h('span', {}, 'Data urodzenia'), h('span', {}, `${pad(identity.day)}.${pad(identity.month)}.${identity.year}`)),
            h('div', { class: 'kv' }, h('span', {}, 'Wiek'), h('span', {}, `${calcAge()} lat`)),
            h('div', { class: 'kv' }, h('span', {}, 'Płeć'), h('span', {}, isMale() ? 'Mężczyzna' : 'Kobieta'))
        ),
        h('p', { class: 'note' }, 'Sprawdź dane i obejrzyj postać z każdej strony (dock na dole ekranu). Po utworzeniu wygląd zapisuje się na stałe — późniejsze zmiany będą możliwe tylko tam, gdzie serwer je udostępni (np. fryzjer).')
    ];
}

const STEPS = [
    { label: 'Tożsamość', icon: 'identity', identity: true, camera: 'body', title: 'Kim jest Twoja postać?', desc: 'Imię, nazwisko, data urodzenia i płeć.', render: stepIdentity, random: randomName },
    { label: 'Rodzice', icon: 'heritage', camera: 'heritage', parents: true, title: 'Dziedzictwo', desc: 'Twarz i skóra to mieszanka dwojga rodziców.', render: stepHeritage, random: randomHeritage },
    { label: 'Twarz', icon: 'face', camera: 'face', title: 'Rysy twarzy', desc: 'Dopracuj nos, oczy, szczękę i resztę rysów.', render: stepFace, random: randomFace },
    { label: 'Włosy', icon: 'hair', camera: 'face', title: 'Włosy i oczy', desc: 'Najedź na fryzurę, żeby zobaczyć ją na postaci.', render: stepHair, random: randomHair },
    { label: 'Skóra', icon: 'skin', camera: 'face', title: 'Skóra', desc: 'Niedoskonałości, cera, piegi i oznaki wieku.', render: stepSkin },
    { label: 'Makijaż', icon: 'makeup', camera: 'face', title: 'Makijaż', desc: 'Makijaż, róż i szminka.', render: stepMakeup },
    { label: 'Ubrania', icon: 'clothes', clothing: true, camera: 'body', title: 'Ubrania', desc: 'Przesuwaj kursor po kafelkach — postać przymierza ubrania od razu.', render: stepClothes, random: randomOutfit },
    { label: 'Gotowe', icon: 'summary', summary: true, camera: 'body', title: 'Podsumowanie', desc: 'Ostatnie spojrzenie przed utworzeniem postaci.', render: stepSummary }
];

function currentSteps() {
    if (state.wardrobeMode) return STEPS.filter(step => step.clothing);
    return state.skinMode ? STEPS.filter(step => !step.identity && !step.summary && !step.clothing) : STEPS;
}

/* ------------------------------------------------------------------ */
/* Renderowanie                                                        */
/* ------------------------------------------------------------------ */

function renderRail() {
    const steps = currentSteps();
    els.rail.replaceChildren(
        ...steps.map((step, index) =>
            h(
                'button',
                { class: 'rail-btn' + (state.step === index ? ' active' : index < state.step ? ' done' : ''), onclick: () => goToStep(index) },
                icon(step.icon),
                step.label
            )
        )
    );
}

function renderHeader() {
    const steps = currentSteps();
    const step = steps[state.step];

    els.title.textContent = step.title;
    els.subtitle.textContent = step.desc;
    els.progress.style.width = `${((state.step + 1) / steps.length) * 100}%`;
}

function renderFooter() {
    const last = state.step === currentSteps().length - 1;

    els.back.disabled = state.step === 0 || state.submitting;
    els.next.disabled = state.submitting;
    els.next.textContent = last
        ? (state.submitting ? (state.skinMode || state.wardrobeMode ? 'Zapisywanie…' : 'Tworzenie…') : (state.wardrobeMode ? 'Zapisz ubranie' : (state.skinMode ? 'Zapisz wygląd' : 'Stwórz postać')))
        : 'Dalej';
    els.random.classList.toggle('hidden', !currentSteps()[state.step].random);
    els.random.disabled = state.submitting;
}

function renderContent(keepScroll) {
    const scroll = els.content.scrollTop;

    // Animacja wejscia tylko przy zmianie kroku, nie przy odswiezeniu kontrolek.
    els.content.classList.remove('enter');

    els.content.replaceChildren(...currentSteps()[state.step].render());
    els.content.scrollTop = keepScroll ? scroll : 0;

    if (!keepScroll) {
        void els.content.offsetWidth;
        els.content.classList.add('enter');
    }
}

function dockGroup(label, ...children) {
    return h('div', { class: 'dock-group' }, h('span', { class: 'dock-label' }, label), h('div', { class: 'dock-row' }, ...children));
}

function renderDock() {
    const dockButton = (text, on, onclick, extra = {}) => h('button', { class: 'dock-btn' + (on ? ' on' : ''), onclick, ...extra }, text);

    const children = [];

    if (!state.skinMode && !state.wardrobeMode) {
        if (state.poses.length > 1) {
            children.push(dockGroup('Poza', ...state.poses.map((pose) => dockButton(pose.label, state.poseId === pose.id, () => setPose(pose.id)))));
        }

        children.push(dockGroup('Obrót', ...[['front', 'Przód'], ['profile', 'Profil'], ['back', 'Tył']].map(([preset, text]) => dockButton(text, false, () => call('turn', { preset })))));
    }

    children.push(
        dockGroup('Kamera', ...(state.wardrobeMode
            ? [['body', 'Ciało'], ['feet', 'Stopy']]
            : [['face', 'Twarz'], ['body', 'Ciało'], ['feet', 'Stopy']]
        ).map(([preset, text]) => dockButton(text, false, () => setCamera(preset), { 'data-camera': preset }))),
        ...(state.wardrobeMode ? [dockGroup('Obrót kamery',
            dockButton('←', false, () => call('orbitCamera', { delta: -15 }), { title: 'Obróć kamerę w lewo', 'aria-label': 'Obróć kamerę w lewo' }),
            dockButton('→', false, () => call('orbitCamera', { delta: 15 }), { title: 'Obróć kamerę w prawo', 'aria-label': 'Obróć kamerę w prawo' })
        )] : []),
        ...(state.wardrobeMode ? [dockGroup('Obrót postaci',
            dockButton('←', false, () => call('rotate', { delta: -15 }), { title: 'Obróć postać w lewo', 'aria-label': 'Obróć postać w lewo' }),
            dockButton('→', false, () => call('rotate', { delta: 15 }), { title: 'Obróć postać w prawo', 'aria-label': 'Obróć postać w prawo' })
        )] : []),
        dockGroup('Edycja', dockButton('Cofnij', false, undo))
    );

    els.dock.replaceChildren(...children);

    renderCameraButtons();
}

function renderCameraButtons() {
    const shown = state.camera === 'faceClose' ? 'face' : state.camera;

    document.querySelectorAll('[data-camera]').forEach((button) => {
        button.classList.toggle('on', button.dataset.camera === shown);
    });
}

function setCamera(preset) {
    state.camera = preset;

    renderCameraButtons();
    call('camera', { preset });
}

function goToStep(index) {
    if (state.submitting) return;

    const steps = currentSteps();
    state.step = clamp(index, 0, steps.length - 1);

    renderRail();
    renderHeader();
    renderContent();
    renderFooter();

    setCamera(steps[state.step].camera);
    syncParents();
}

/* ------------------------------------------------------------------ */
/* Akcje                                                               */
/* ------------------------------------------------------------------ */

async function changeGender(gender) {
    if (state.identity.gender === gender || state.busy) return;

    // Zalegly podglad ze starej plci nie moze trafic na nowy model.
    cancelPreview();

    state.busy = true;
    els.busy.classList.remove('hidden');

    const res = await call('setGender', { gender });

    state.busy = false;
    els.busy.classList.add('hidden');

    if (!res.ok) {
        return toast('Nie udało się zmienić modelu postaci.');
    }

    state.identity.gender = gender;
    state.appearance = res.appearance;
    state.defaults = clone(res.appearance);
    state.limits = res.limits;
    state.undo = [];

    renderContent(true);
}

function setPose(id) {
    state.poseId = id;

    renderDock();
    call('pose', { id });
}

function calcAge() {
    const { identity, settings } = state;

    let age = settings.year - identity.year;

    if (settings.month < identity.month || (settings.month === identity.month && settings.day < identity.day)) {
        age -= 1;
    }

    return age;
}

function validateIdentity() {
    const { identity, settings } = state;
    const errors = {};

    const bad = (value) => value.length < settings.nameMin || value.length > settings.nameMax || !NAME_RE.test(value);

    if (bad(identity.firstName.trim())) {
        errors.firstName = `Imię: ${settings.nameMin}–${settings.nameMax} liter, dozwolony myślnik.`;
    }

    if (bad(identity.lastName.trim())) {
        errors.lastName = `Nazwisko: ${settings.nameMin}–${settings.nameMax} liter, dozwolony myślnik.`;
    }

    const date = new Date(identity.year, identity.month - 1, identity.day);

    if (date.getFullYear() !== identity.year || date.getMonth() !== identity.month - 1 || date.getDate() !== identity.day) {
        errors.date = 'Taka data nie istnieje.';
    } else {
        const age = calcAge();

        if (age < settings.minAge) errors.date = `Postać musi mieć co najmniej ${settings.minAge} lat.`;
        else if (age > settings.maxAge) errors.date = `Postać może mieć najwyżej ${settings.maxAge} lat.`;
    }

    return Object.keys(errors).length ? errors : null;
}

function buildDateOfBirth() {
    const pad = (n) => String(n).padStart(2, '0');

    return `${state.identity.year}-${pad(state.identity.month)}-${pad(state.identity.day)}`;
}

function showOutfitNameModal(name = '') {
    els.outfitNameInput.value = name;
    els.outfitModal.classList.remove('hidden');
    requestAnimationFrame(() => els.outfitNameInput.focus());
}

function hideOutfitNameModal() {
    els.outfitModal.classList.add('hidden');
}

function confirmOutfitName() {
    const name = els.outfitNameInput.value.trim();
    if (!name) return toast('Wpisz nazwę zapisywanego stroju.');

    hideOutfitNameModal();
    submit(name);
}

async function submit(outfitName = '') {
    if (state.submitting) return;

    const appearanceEdit = state.skinMode || state.wardrobeMode;
    const errors = appearanceEdit ? null : validateIdentity();

    if (errors) {
        state.errors = errors;
        goToStep(0);

        return toast('Uzupełnij poprawnie dane postaci.');
    }

    state.errors = {};
    state.outfitName = outfitName;
    state.submitting = true;

    renderFooter();

    await call('submit', {
        identity: appearanceEdit ? undefined : {
            firstName: state.identity.firstName.trim(),
            lastName: state.identity.lastName.trim(),
            dateOfBirth: buildDateOfBirth(),
            gender: state.identity.gender
        },
        appearance: state.appearance,
        outfitName: state.wardrobeMode ? outfitName : undefined
    });
}

function submitFailed(code) {
    state.submitting = false;

    const { settings } = state;

    const messages = {
        invalid_first_name: 'Nieprawidłowe imię.',
        invalid_last_name: 'Nieprawidłowe nazwisko.',
        invalid_birthdate: 'Nieprawidłowa data urodzenia.',
        invalid_date: 'Taka data nie istnieje.',
        age_too_young: `Postać musi mieć co najmniej ${settings.minAge} lat.`,
        age_too_old: `Postać może mieć najwyżej ${settings.maxAge} lat.`,
        invalid_gender: 'Nieprawidłowa płeć.',
        slot_occupied: 'Ten slot jest już zajęty.',
        has_active_character: 'Masz już aktywną postać.',
        not_allowed: state.wardrobeMode
            ? 'Sesja szatni wygasła. Otwórz ją ponownie przy punkcie szatni.'
            : state.skinMode
            ? 'Sesja edycji wygasła. Uruchom ponownie komendę /skin [ID].'
            : 'Sesja kreatora wygasła. Wróć do wyboru postaci i spróbuj ponownie.',
        character_changed: 'Aktywna postać się zmieniła. Uruchom edytor ponownie komendą /skin.',
        wait: 'Poczekaj chwilę i spróbuj zapisać ponownie.',
        database_error: 'Błąd bazy danych. Spróbuj ponownie.',
        internal_error: 'Błąd serwera (szczegóły w konsoli serwera).',
        timeout: 'Serwer nie odpowiedział. Spróbuj ponownie.',
        invalid_eye_color: 'Ten kolor oczu jest niedostępny.',
        invalid_appearance: 'Nieprawidłowe dane wyglądu.',
        core_unavailable: 'mono_core jest niedostępny.'
    };

    toast(messages[code] || (state.skinMode || state.wardrobeMode
        ? `Nie udało się zapisać zmian (${code}).`
        : `Nie udało się utworzyć postaci (${code}).`));

    if (IDENTITY_ERRORS.includes(code)) {
        state.errors = {
            firstName: code === 'invalid_first_name' ? messages[code] : null,
            lastName: code === 'invalid_last_name' ? messages[code] : null,
            date: ['invalid_birthdate', 'invalid_date', 'age_too_young', 'age_too_old'].includes(code) ? messages[code] : null
        };

        return goToStep(0);
    }

    renderFooter();
    if (state.wardrobeMode) showOutfitNameModal(state.outfitName);
}

let cancelTimer = null;

function resetCancelButton() {
    clearTimeout(cancelTimer);

    state.cancelArmed = false;
    els.cancel.textContent = state.skinMode || state.wardrobeMode ? 'Anuluj' : 'Wróć';
    els.cancel.classList.remove('danger');
}

function requestCancel() {
    if (state.submitting) return;

    if (!state.cancelArmed) {
        state.cancelArmed = true;
        els.cancel.textContent = 'Na pewno?';
        els.cancel.classList.add('danger');

        cancelTimer = setTimeout(resetCancelButton, 3000);

        return;
    }

    resetCancelButton();
    call('cancel');
}

/* ------------------------------------------------------------------ */
/* Otwieranie / zamykanie                                              */
/* ------------------------------------------------------------------ */

function open(data) {
    cancelPreview();

    state.skinMode = data.mode === 'skin';
    state.wardrobeMode = data.mode === 'wardrobe';
    state.outfitName = '';
    state.settings = { ...state.settings, ...(data.settings || {}) };
    state.appearance = data.appearance;
    state.defaults = clone(data.appearance);
    state.limits = data.limits;
    state.colors = data.colors || { hair: [], makeup: [] };
    state.poses = data.poses || [];
    state.poseId = data.poseId;
    state.parentsEnabled = data.parentsEnabled !== false;
    state.errors = {};
    state.step = 0;
    state.busy = false;
    state.submitting = false;
    state.undo = [];
    state.heritageTab = 'both';
    state.parentPicker = 'mother';
    state.faceOpen = 'Nos';
    state.clothCat = 0;
    state.camera = 'body';

    state.identity = {
        firstName: '',
        lastName: '',
        day: 1,
        month: 1,
        year: clamp(state.settings.year - 25, state.settings.year - state.settings.maxAge, state.settings.year - state.settings.minAge),
        gender: data.gender || 'male'
    };

    state.open = true;

    els.root.classList.toggle('skin-mode', state.skinMode);
    els.root.classList.toggle('wardrobe-mode', state.wardrobeMode);
    document.querySelector('.brand').textContent = state.wardrobeMode ? 'Mono Skin • Szatnia' : 'Monoskrypt RP';
    document.querySelector('.stage-hint').textContent = state.wardrobeMode
        ? 'LPM: obrót kamery · PPM: obrót postaci · strzałki: precyzyjny obrót'
        : 'Przeciągnij, aby obrócić · kółko myszy: zoom · Ctrl+Z: cofnij';
    els.cancel.textContent = state.skinMode || state.wardrobeMode ? 'Anuluj' : 'Wróć';
    els.root.classList.remove('hidden');
    els.busy.classList.add('hidden');

    renderRail();
    renderHeader();
    renderContent();
    renderFooter();
    renderDock();
}

function close() {
    state.open = false;
    hideOutfitNameModal();

    cancelPreview();
    resetCancelButton();

    els.root.classList.add('hidden');
    els.root.classList.remove('skin-mode');
    els.root.classList.remove('wardrobe-mode');
    state.skinMode = false;
    state.wardrobeMode = false;
}

window.addEventListener('message', (event) => {
    const data = event.data;

    if (!data || !data.action) return;

    if (data.action === 'open') open(data);
    if (data.action === 'close') close();
    if (data.action === 'submitResult' && !data.ok) submitFailed(data.error);
});

els.back.addEventListener('click', () => goToStep(state.step - 1));

els.random.addEventListener('click', () => currentSteps()[state.step].random?.());

els.next.addEventListener('click', () => {
    if (state.step === currentSteps().length - 1) {
        if (state.wardrobeMode) return showOutfitNameModal();
        return submit();
    }

    // Nie przepuszczamy dalej z blednymi danymi tozsamosci - blad widac od razu przy polu.
    if (!state.skinMode && !state.wardrobeMode && state.step === 0) {
        const errors = validateIdentity();

        if (errors) {
            state.errors = errors;
            renderContent();

            return toast('Uzupełnij poprawnie dane postaci.');
        }
    }

    goToStep(state.step + 1);
});

els.cancel.addEventListener('click', requestCancel);

els.outfitNameCancel.addEventListener('click', hideOutfitNameModal);
els.outfitNameSave.addEventListener('click', confirmOutfitName);
els.outfitNameInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        confirmOutfitName();
    }
});

window.addEventListener('keydown', (event) => {
    if (!state.open) return;

    if (event.key === 'Escape') {
        if (!els.outfitModal.classList.contains('hidden')) {
            hideOutfitNameModal();
            return;
        }
        requestCancel();
    }

    const typing = event.target instanceof HTMLInputElement && event.target.type === 'text';

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !typing) {
        event.preventDefault();
        undo();
    }
});

let dragX = null;
let dragTarget = 'camera';
let pendingRotation = 0;
let rotateFrame = 0;
let pendingZoom = 0;
let zoomFrame = 0;

function flushRotation() {
    rotateFrame = 0;

    if (Math.abs(pendingRotation) < 0.01) return;

    const action = state.wardrobeMode && dragTarget !== 'character' ? 'orbitCamera' : 'rotate';
    call(action, { delta: pendingRotation });

    pendingRotation = 0;
}

els.stage.addEventListener('pointerdown', (event) => {
    if (event.target.closest('.dock')) return;

    dragTarget = state.wardrobeMode && event.button === 2 ? 'character' : 'camera';
    if (state.wardrobeMode && event.button === 2) event.preventDefault();
    dragX = event.clientX;
    els.stage.setPointerCapture(event.pointerId);
});

els.stage.addEventListener('pointermove', (event) => {
    if (dragX === null) return;

    pendingRotation += (event.clientX - dragX) * 0.5;
    dragX = event.clientX;

    if (!rotateFrame) {
        rotateFrame = requestAnimationFrame(flushRotation);
    }
});

const endDrag = () => { dragX = null; };

els.stage.addEventListener('pointerup', endDrag);
els.stage.addEventListener('pointercancel', endDrag);
els.stage.addEventListener('contextmenu', (event) => {
    if (state.wardrobeMode) event.preventDefault();
});

els.stage.addEventListener('wheel', (event) => {
    if (event.target.closest('.dock')) return;
    if (state.skinMode || state.wardrobeMode) {
        event.preventDefault();
        pendingZoom = 0;
        return;
    }

    pendingZoom += event.deltaY > 0 ? 1.5 : -1.5;

    if (!zoomFrame) {
        zoomFrame = requestAnimationFrame(() => {
            zoomFrame = 0;

            call('zoom', { delta: pendingZoom });

            pendingZoom = 0;
        });
    }
});
