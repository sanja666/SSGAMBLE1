const modal = document.getElementById('login-modal');
const modalTriggers = document.querySelectorAll('[data-modal="login"]');
const modalClose = document.querySelector('.modal__close');
const languageSelect = document.getElementById('language-select');
const serviceSearch = document.getElementById('service-search');
const searchInput = document.getElementById('search-input');
const quickLogin = document.querySelector('.quick-login');
const modalForm = document.querySelector('#login-modal .modal-form');
const tagButtons = document.querySelectorAll('.tag');

const translations = {
    lv: {
        pageTitle: 'Latvijas Valsts Pakalpojumi',
        portalMark: 'Latvijas valsts portāls',
        metaResidents: 'Iedzīvotājiem',
        metaBusiness: 'Uzņēmējiem',
        metaAuthorities: 'Iestādēm',
        brandTitle: 'Latvijas Valsts Pakalpojumi',
        brandSubtitle: 'Vienotais e-pakalpojumu portāls',
        navServices: 'Pakalpojumi',
        navSituations: 'Dzīves situācijas',
        navHow: 'Kā sākt',
        navNews: 'Jaunumi',
        navSupport: 'Atbalsts',
        login: 'Pierakstīties',
        languageLabel: 'Valoda',
        languageSelectLabel: 'Valodas izvēle',
        languageLv: 'Latviešu',
        languageEn: 'English',
        heroEyebrow: 'Vienuviet visiem dzīves gadījumiem',
        heroTitle: 'Vienkārša piekļuve valsts pakalpojumiem',
        heroSubtitle: 'Pārvaldiet dokumentus, deklarācijas un pieteikumus vienuviet – droši un ērtā laikā.',
        searchLabel: 'Meklēt pakalpojumu',
        searchPlaceholder: 'Meklēt pakalpojumu vai tēmu',
        searchButton: 'Meklēt',
        tagTax: 'Gada deklarācija',
        tagBenefit: 'Ģimenes pabalsti',
        tagResidence: 'Dzīvesvietas deklarācija',
        tagVehicle: 'Transportlīdzekļi',
        quickLinkBusiness: 'Uzņēmējdarbības pakalpojumi',
        quickLinkBusinessHint: 'Reģistrācija, licences un iesniegumi',
        quickLinkFamily: 'Ģimenes atbalsts',
        quickLinkFamilyHint: 'Pabalsti, bērnudārzi, veselība',
        quickLinkSupport: 'Nepieciešama palīdzība?',
        quickLinkSupportHint: 'Tiešraides čats un tālrunis',
        heroPanelTitle: 'Sākt darbu uzreiz',
        panelItemOne: 'Pārbaudiet savu pieteikumu statusu reāllaikā',
        panelItemTwo: 'Saņemiet paziņojumus par termiņiem un izmaiņām',
        panelItemThree: 'Droši maksājiet nodokļus un nodevas tiešsaistē',
        personalCodeLabel: 'Personas kods',
        authMethodLabel: 'Autentifikācijas veids',
        authBank: 'Internetbanka',
        authIdCard: 'eID karte',
        authSmartId: 'Smart-ID',
        continueButton: 'Turpināt',
        securityNote: 'Drošam pieslēgumam izmantojiet tikai oficiālās autentifikācijas iespējas.',
        popularServicesTitle: 'Populārākie pakalpojumi',
        popularServicesIntro: 'Atlasīti biežāk lietotie pakalpojumi ar ātru piekļuvi dokumentiem un iesniegumiem.',
        viewAllServices: 'Skatīt visus',
        serviceTaxTitle: 'Nodokļu deklarācijas',
        serviceTaxDescription: 'Iesniedziet gada ienākumu deklarāciju un sekojiet atmaksu statusam.',
        serviceTaxAction: 'Aizpildīt deklarāciju',
        serviceHealthTitle: 'E-veselības dati',
        serviceHealthDescription: 'Apskatiet receptes, nosūtījumus un pārvaldiet ārstu vizītes.',
        serviceHealthAction: 'Atvērt e-veselību',
        serviceBusinessTitle: 'Uzņēmumu reģistrācija',
        serviceBusinessDescription: 'Reģistrējiet uzņēmumu tiešsaistē un atjaunojiet datus.',
        serviceBusinessAction: 'Reģistrēt uzņēmumu',
        serviceFamilyTitle: 'Ģimenes pabalsti',
        serviceFamilyDescription: 'Piesakieties bērna piedzimšanas un citiem ģimenes pabalstiem.',
        serviceFamilyAction: 'Pieteikties pabalstam',
        serviceResidenceTitle: 'Deklarēšanās',
        serviceResidenceDescription: 'Deklarējiet dzīvesvietu un pārbaudiet deklarācijas vēsturi.',
        serviceResidenceAction: 'Deklarēt adresi',
        serviceTransportTitle: 'Transportlīdzekļu pakalpojumi',
        serviceTransportDescription: 'Apmaksājiet ceļa nodokli un rezervējiet tehnisko apskati.',
        serviceTransportAction: 'Pārvaldīt transportu',
        situationsTitle: 'Dzīves situāciju ceļveži',
        situationsIntro: 'Atrast vajadzīgo pakalpojumu palīdz strukturētie ceļveži biežāk sastopamajām situācijām.',
        situationFamilyTitle: 'Bērna piedzimšana',
        situationFamilyItem1: 'Pabalstu un vecāku atvaļinājuma pieteikšana',
        situationFamilyItem2: 'Pirmā dokumentu un veselības aprūpes noformēšana',
        situationFamilyItem3: 'Bērnudārzu un skolu rindas',
        situationResidenceTitle: 'Pārcelšanās Latvijā',
        situationResidenceItem1: 'Deklarācijas un komunālo pakalpojumu pieteikšana',
        situationResidenceItem2: 'Transportlīdzekļu un vadītāja apliecības jautājumi',
        situationResidenceItem3: 'Skolu un veselības aprūpes pārreģistrēšana',
        situationBusinessTitle: 'Uzņēmuma uzsākšana',
        situationBusinessItem1: 'Reģistrācijas un licencēšanas prasības',
        situationBusinessItem2: 'Nodokļu un algu aprēķinu rīki',
        situationBusinessItem3: 'Valsts atbalsta programmas',
        situationExplore: 'Apskatīt soļus',
        newsTitle: 'Jaunumi portālā',
        newsIntro: 'Sekojiet līdzi svarīgiem paziņojumiem, uzlabojumiem un termiņiem.',
        newsItem1Title: 'Jauna eID aktivizācija tiešsaistē',
        newsItem1Text: 'No 2024. gada eID karti iespējams aktivizēt mājās, izmantojot drošu lietotni.',
        newsItem1Link: 'Lasīt vairāk',
        newsItem2Title: 'Atbalsts ģimenēm pieaug',
        newsItem2Text: 'Ieviesti vienkāršāki pieteikšanās soļi bērna kopšanas pabalstiem.',
        newsItem2Link: 'Lasīt vairāk',
        newsItem3Title: 'Uzņēmumu portāla uzlabojumi',
        newsItem3Text: 'Jauns pārskatu panelis ļauj sekot licenču un atļauju derīgumam.',
        newsItem3Link: 'Lasīt vairāk',
        howToTitle: 'Kā sākt darbu ar portālu',
        howToIntro: 'Četri vienkārši soļi no pieslēgšanās līdz rezultātam.',
        howStep1Title: 'Izveidojiet drošu pieslēgumu',
        howStep1Text: 'Izmantojiet eID karti, Smart-ID vai savu internetbanku, lai apstiprinātu identitāti.',
        howStep2Title: 'Izvēlieties pakalpojumu',
        howStep2Text: 'Atlasiet nepieciešamo pakalpojumu un pārliecinieties par nepieciešamajiem dokumentiem.',
        howStep3Title: 'Aizpildiet iesniegumu',
        howStep3Text: 'Seko norādēm soli pa solim un pievieno pieprasītos dokumentus.',
        howStep4Title: 'Saņemiet rezultātu',
        howStep4Text: 'Sekojiet līdzi statusam un saņemiet paziņojumus portālā un e-pastā.',
        supportTitle: 'Palīdzība un atbalsts',
        supportIntro: 'Izvēlieties ērtāko veidu, kā sazināties ar speciālistiem.',
        supportSelfServiceTitle: 'Pašapkalpošanās centrs',
        supportSelfServiceText: 'Ceļveži, bieži uzdotie jautājumi un video instrukcijas par pakalpojumiem.',
        supportSelfServiceLink: 'Apmeklēt centru',
        supportContactTitle: 'Zvanu centrs',
        supportContactText: 'Darba dienās 8.00–18.00 pa tālruni +371 6601 2345.',
        supportContactLink: 'Zvanīt',
        supportChatTitle: 'Tiešsaistes čats',
        supportChatText: 'Saņemiet ātru palīdzību no konsultanta, izmantojot drošu čatu.',
        supportChatLink: 'Sākt čatu',
        supportEmail: 'Rakstīt e-pastu',
        ctaTitle: 'Nepieciešama palīdzība ar iesniegumiem?',
        ctaText: 'Mūsu speciālisti palīdzēs sagatavot dokumentus un atbildēs uz jautājumiem.',
        ctaButton: 'Pieteikt konsultāciju',
        footerAboutTitle: 'Par portālu',
        footerAboutText: 'Valsts vienotais e-pakalpojumu portāls iedzīvotājiem, uzņēmējiem un iestādēm.',
        footerLinksTitle: 'Ātrās saites',
        footerSupportTitle: 'Atbalsts',
        footerLinkServices: 'Pakalpojumu katalogs',
        footerLinkSituations: 'Dzīves situācijas',
        footerLinkNews: 'Jaunumi un paziņojumi',
        footerLinkSupport: 'Palīdzības centrs',
        footerLinkAccessibility: 'Pieejamības paziņojums',
        footerLinkPrivacy: 'Privātuma politika',
        footerLegal: '© 2024 Latvijas Valsts Pakalpojumi. Visas tiesības aizsargātas.',
        modalTitle: 'Pierakstīšanās',
        modalIntro: 'Izvēlieties autentifikācijas veidu un ievadiet personas kodu.',
        modalSubmit: 'Pierakstīties',
        loginNotice: 'Demonstrācijas versija — autentifikācija nav pieejama.',
        searchDemo: 'Šī ir demonstrācijas versija. Meklēšanas rezultāti nav pieejami.',
        quickLoginPlaceholder: '010101-12345'
    },
    en: {
        pageTitle: 'Latvian State Services',
        portalMark: 'Latvian state portal',
        metaResidents: 'For residents',
        metaBusiness: 'For businesses',
        metaAuthorities: 'For authorities',
        brandTitle: 'Latvian State Services',
        brandSubtitle: 'Unified e-services portal',
        navServices: 'Services',
        navSituations: 'Life events',
        navHow: 'How to start',
        navNews: 'News',
        navSupport: 'Support',
        login: 'Sign in',
        languageLabel: 'Language',
        languageSelectLabel: 'Language selection',
        languageLv: 'Latvian',
        languageEn: 'English',
        heroEyebrow: 'One portal for every life event',
        heroTitle: 'Simple access to public services',
        heroSubtitle: 'Manage documents, declarations, and applications in one place — securely and on your schedule.',
        searchLabel: 'Search service',
        searchPlaceholder: 'Search for a service or topic',
        searchButton: 'Search',
        tagTax: 'Annual declaration',
        tagBenefit: 'Family benefits',
        tagResidence: 'Residence declaration',
        tagVehicle: 'Vehicles',
        quickLinkBusiness: 'Business services',
        quickLinkBusinessHint: 'Registration, licences, applications',
        quickLinkFamily: 'Family support',
        quickLinkFamilyHint: 'Benefits, childcare, health',
        quickLinkSupport: 'Need assistance?',
        quickLinkSupportHint: 'Live chat and hotline',
        heroPanelTitle: 'Get started now',
        panelItemOne: 'Track application progress in real time',
        panelItemTwo: 'Receive deadline alerts and updates',
        panelItemThree: 'Pay taxes and fees securely online',
        personalCodeLabel: 'Personal ID code',
        authMethodLabel: 'Authentication method',
        authBank: 'Internet bank',
        authIdCard: 'eID card',
        authSmartId: 'Smart-ID',
        continueButton: 'Continue',
        securityNote: 'Use only official authentication options for a secure login.',
        popularServicesTitle: 'Popular services',
        popularServicesIntro: 'Frequently used services with quick access to documents and applications.',
        viewAllServices: 'View all',
        serviceTaxTitle: 'Tax declarations',
        serviceTaxDescription: 'Submit annual income declarations and track refund status.',
        serviceTaxAction: 'Complete declaration',
        serviceHealthTitle: 'E-health records',
        serviceHealthDescription: 'Review prescriptions, referrals, and manage doctor visits.',
        serviceHealthAction: 'Open e-health',
        serviceBusinessTitle: 'Business registration',
        serviceBusinessDescription: 'Register a company online and keep information up to date.',
        serviceBusinessAction: 'Register business',
        serviceFamilyTitle: 'Family benefits',
        serviceFamilyDescription: 'Apply for childbirth and other family support benefits.',
        serviceFamilyAction: 'Apply for benefit',
        serviceResidenceTitle: 'Residence declaration',
        serviceResidenceDescription: 'Declare your place of residence and review declaration history.',
        serviceResidenceAction: 'Declare address',
        serviceTransportTitle: 'Vehicle services',
        serviceTransportDescription: 'Pay road tax and book a technical inspection.',
        serviceTransportAction: 'Manage vehicle',
        situationsTitle: 'Life event guides',
        situationsIntro: 'Structured guides for the most common situations help you find the right service.',
        situationFamilyTitle: 'Having a child',
        situationFamilyItem1: 'Apply for parental leave and benefits',
        situationFamilyItem2: 'Arrange first documents and healthcare',
        situationFamilyItem3: 'Register for childcare and schools',
        situationResidenceTitle: 'Moving within Latvia',
        situationResidenceItem1: 'Declare residence and set up utilities',
        situationResidenceItem2: 'Handle vehicle and driving licence changes',
        situationResidenceItem3: 'Transfer school and healthcare records',
        situationBusinessTitle: 'Starting a business',
        situationBusinessItem1: 'Registration and licensing requirements',
        situationBusinessItem2: 'Tax and payroll calculation tools',
        situationBusinessItem3: 'State support programmes',
        situationExplore: 'View steps',
        newsTitle: 'Portal news',
        newsIntro: 'Stay informed about important announcements, upgrades, and deadlines.',
        newsItem1Title: 'New online eID activation',
        newsItem1Text: 'From 2024 you can activate your eID card at home using a secure app.',
        newsItem1Link: 'Read more',
        newsItem2Title: 'More support for families',
        newsItem2Text: 'Simplified application steps introduced for parental benefits.',
        newsItem2Link: 'Read more',
        newsItem3Title: 'Business portal upgrades',
        newsItem3Text: 'A new dashboard helps track licence and permit validity periods.',
        newsItem3Link: 'Read more',
        howToTitle: 'How to get started',
        howToIntro: 'Four simple steps from login to results.',
        howStep1Title: 'Create a secure login',
        howStep1Text: 'Use your eID card, Smart-ID, or internet bank to confirm your identity.',
        howStep2Title: 'Choose a service',
        howStep2Text: 'Select the required service and make sure you have the necessary documents.',
        howStep3Title: 'Submit the form',
        howStep3Text: 'Follow the guided steps and attach the requested documents.',
        howStep4Title: 'Receive the result',
        howStep4Text: 'Track progress and receive notifications in the portal and via email.',
        supportTitle: 'Help and support',
        supportIntro: 'Choose the most convenient way to reach our specialists.',
        supportSelfServiceTitle: 'Self-service centre',
        supportSelfServiceText: 'Guides, FAQs, and video tutorials for every service.',
        supportSelfServiceLink: 'Visit centre',
        supportContactTitle: 'Call centre',
        supportContactText: 'Weekdays 8:00–18:00 at +371 6601 2345.',
        supportContactLink: 'Call',
        supportChatTitle: 'Live chat',
        supportChatText: 'Get quick help from an advisor via secure chat.',
        supportChatLink: 'Start chat',
        supportEmail: 'Send email',
        ctaTitle: 'Need help with your applications?',
        ctaText: 'Our specialists will prepare documents and answer your questions.',
        ctaButton: 'Book a consultation',
        footerAboutTitle: 'About the portal',
        footerAboutText: 'The national one-stop e-services portal for residents, businesses, and authorities.',
        footerLinksTitle: 'Quick links',
        footerSupportTitle: 'Support',
        footerLinkServices: 'Services catalogue',
        footerLinkSituations: 'Life events',
        footerLinkNews: 'News and announcements',
        footerLinkSupport: 'Help centre',
        footerLinkAccessibility: 'Accessibility statement',
        footerLinkPrivacy: 'Privacy policy',
        footerLegal: '© 2024 Latvian State Services. All rights reserved.',
        modalTitle: 'Sign in',
        modalIntro: 'Choose your authentication method and enter your personal ID code.',
        modalSubmit: 'Sign in',
        loginNotice: 'Demonstration only — authentication is not available.',
        searchDemo: 'This is a demonstration. Search results are not available.',
        quickLoginPlaceholder: '010101-12345'
    }
};

let currentLanguage = 'lv';
const fallbackLanguage = 'lv';
const storageKey = 'lv-portal-language';

function getTranslation(lang, key) {
    const dictionary = translations[lang] || translations[fallbackLanguage];
    return dictionary[key] ?? translations[fallbackLanguage][key] ?? key;
}

function applyTranslations(lang) {
    const targetLanguage = translations[lang] ? lang : fallbackLanguage;
    currentLanguage = targetLanguage;

    document.documentElement.lang = targetLanguage;
    const pageTitle = getTranslation(targetLanguage, 'pageTitle');
    if (pageTitle) {
        document.title = pageTitle;
    }

    document.querySelectorAll('[data-i18n]').forEach((element) => {
        const key = element.getAttribute('data-i18n');
        if (!key) return;
        const value = getTranslation(targetLanguage, key);
        if (element.hasAttribute('data-i18n-html')) {
            element.innerHTML = value;
        } else {
            element.textContent = value;
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (!key) return;
        const value = getTranslation(targetLanguage, key);
        if (value) {
            element.setAttribute('placeholder', value);
        }
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
        const key = element.getAttribute('data-i18n-aria-label');
        if (!key) return;
        const value = getTranslation(targetLanguage, key);
        if (value) {
            element.setAttribute('aria-label', value);
        }
    });

    if (languageSelect) {
        languageSelect.value = targetLanguage;
    }
}

function persistLanguage(lang) {
    try {
        window.localStorage.setItem(storageKey, lang);
    } catch (error) {
        console.warn('Unable to store language preference', error);
    }
}

function readStoredLanguage() {
    try {
        return window.localStorage.getItem(storageKey);
    } catch (error) {
        return null;
    }
}

function t(key) {
    return getTranslation(currentLanguage, key);
}

function openModal() {
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    modal.querySelector('input')?.focus();
}

function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
}

modalTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
        event.preventDefault();
        openModal();
    });
});

modalClose?.addEventListener('click', () => {
    closeModal();
});

modal?.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeModal();
    }
});

serviceSearch?.addEventListener('submit', (event) => {
    event.preventDefault();
    alert(t('searchDemo'));
});

quickLogin?.addEventListener('submit', (event) => {
    event.preventDefault();
    alert(t('loginNotice'));
});

modalForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    closeModal();
    alert(t('loginNotice'));
});

languageSelect?.addEventListener('change', (event) => {
    const selected = event.target.value;
    applyTranslations(selected);
    persistLanguage(selected);
});

tagButtons.forEach((button) => {
    button.addEventListener('click', () => {
        if (searchInput) {
            searchInput.value = button.textContent.trim();
            searchInput.focus();
        }
        alert(t('searchDemo'));
    });
});

const initialLanguage = readStoredLanguage() || fallbackLanguage;
applyTranslations(initialLanguage);
