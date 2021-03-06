let projects, currentProject;
let pins = [],
    filteredPins = [],
    currentPin;
let filter = { 'project': '', 'tag': '' };
let mode = 0; //...mode=0:New & mode=1:Update

// Navbar
const navbar = document.getElementById('navbar');
const navbarOpenIcon = document.getElementById('navbar-open-icon');
const navbarCloseIcon = document.getElementById('navbar-close-icon');
const navbarAddProject = document.getElementById('navbar-add-project');
const navbarAddProjectIcon = document.getElementById('navbar-add-project-icon');
const projectAll = document.getElementById('project-all');
const projectInbox = document.getElementById('project-inbox');
const navbarProjects = document.getElementById('navbar-projects');

// Main
const main = document.getElementById('main');
const projectDetail = document.getElementById('project-detail');
const projectTitle = document.getElementById('project-title');
const projectTags = document.getElementById('project-tags');
const projectDescription = document.getElementById('project-description');
const updateProjectIcon = document.getElementById('update-project-icon');
const projectBoard = document.getElementById('project-board');
const masonry = new Masonry(projectBoard, {
    columnWidth: '.grid-item',
    itemSelector: '.grid-item'
});

// Sidebar 1
const sidebar1 = document.getElementById('sidebar-1');
const sidebar1OpenIcon = document.getElementById('sidebar-1-open-icon');
const sidebar1CloseIcon = document.getElementById('sidebar-1-close-icon');
const pinFormUrlIcon = document.getElementById('pin-form-url-icon');
const pinForm = document.getElementById('pin-form');
const pinFormFavicon = document.getElementById('pin-form-favicon');
const pinFormImages = document.getElementById('pin-form-images');
const pinFormImage = document.getElementById('pin-form-image');
const pinFormProject = document.getElementById('pin-form-project');
const pinFormTitle = document.getElementById('pin-form-title');
const pinFormTags = document.getElementById('pin-form-tags');
new BulmaTagsInput(pinFormTags);
const pinFormTagsInput = pinFormTags.BulmaTagsInput();
const pinFormType = document.getElementById('pin-form-type');
const pinFormUrl = document.getElementById('pin-form-url');
const pinFormDescription = document.getElementById('pin-form-description');
const pinFormNote = document.getElementById('pin-form-note');
const addPinIcon = document.getElementById('add-pin-icon');
const removePinIcon = document.getElementById('remove-pin-icon');
autosize(document.querySelectorAll('textarea'));

// Sidebar 2
const sidebar2 = document.getElementById('sidebar-2');
const sidebar2Min = document.getElementById('sidebar-2-min');
const sidebar2Max = document.getElementById('sidebar-2-max');
const sidebarEditIcon = document.getElementById('sidebar-edit-icon');
const sidebarPreviewIcon = document.getElementById('sidebar-preview-icon');
const E = window.wangEditor;
const editor = new E('#editor');
editor.config.height = window.innerHeight - 100;
editor.config.fontNames = [
    'Arial',
    'Tahoma',
    'Verdana',
    'Times New Roman',
    'Courier New',
];
editor.config.excludeMenus = [
    'redo',
    'undo'
]
editor.config.lang = 'en';
editor.i18next = window.i18next;
editor.create();