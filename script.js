'use strict';

const blob = document.querySelector('#blob');
const blobPath = document.querySelector('#blob-path');
const hamburger = document.querySelector('.hamburger');
const menu = document.querySelector('.history');
const innerMenu = document.querySelector('.history__content');
const hamContainer = document.querySelector('.hamburger-container');
const noteContainer = document.querySelector('.note-container');
const searchInput = document.querySelector('.search__input');
const removeIcon = document.querySelector('.search__close');

const form = document.querySelector('.note-container');
const submitBtn = document.querySelector('.submit');
const notes = document.querySelector('.notes');
const inputTitle = document.querySelector('.add-note__input--title');
const inputDesc = document.querySelector('.add-note__input--desc');
const history = document.querySelector('.history__content');
const addNewMemory = document.querySelector('.add-box');
const searchMenu = document.querySelector('.search-menu');
const searchMenuLinks = document.querySelectorAll('.search-menu__link');
const sortMenu = document.querySelector('.search-menu-sort');
const sortDate = document.querySelector('.search-menu-sort__option--date');
const sortTitle = document.querySelector('.search-menu-sort__option--title');
const editNote = document.querySelectorAll('.menu__option--edit');
const deleteNote = document.querySelectorAll('.menu__option--delete');
const sortChoice = document.querySelector('.sort-choice');
let dotsSettings;
let settings, currentId;
let defaultUpdate = true;

class Memory {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, title, description) {
    this.coords = coords;
    this.title = title;
    this.description = description;
    this.#setSubtitle();
    this.#setDate();
  }

  #setDate(date) {
    this.dateFormat = Intl.DateTimeFormat(navigator.language).format(date);
  }
  #setSubtitle() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.subtitle = `${this.title[0].toUpperCase()}${this.title.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

const memo = new Memory([39, -12], 'first', 'desijpkaslpfoajöoöafaS');

class App {
  #map;
  #mapEvent;
  #memories = [];
  #mapZoomLevel = 13;
  #memoryMarkers = [];
  #userCoords = [];

  constructor() {
    // Get user's position
    this.#getposition();

    // Get data from local storage
    this.#getLocalStorage();

    // Attach event handlers
    form.addEventListener('submit', this.#submit.bind(this));

    notes.addEventListener('click', this.#moveToPopup.bind(this));

    addNewMemory.addEventListener('click', this.#showForm.bind(this));

    searchMenu.addEventListener('click', this.#searchOptions.bind(this));

    sortDate.addEventListener('click', this.#sortDate.bind(this));

    sortTitle.addEventListener('click', this.#sortTitle.bind(this));

    searchInput.addEventListener('keydown', this.#search.bind(this));
  }

  #getposition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this.#loadMap.bind(this),
        function () {
          alert('Could not get current position');
        }
      );
  }

  #loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    // Saving the initial coords of the user
    this.#userCoords[0] = latitude;
    this.#userCoords[1] = longitude;
    //  console.log(`https://www.google.co.uk/maps/@${latitude},${longitude}`);
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Handling clicks on map
    this.#map.on('click', this.#showForm.bind(this));

    // Update map
    this.#update(this.#memories);

    this.#showAll();
  }

  #update(memories) {
    memories.forEach(memo => {
      this.#renderMemoryMarker(memo);
    });
  }

  #showForm(mapE) {
    if (defaultUpdate) submitBtn.textContent = 'Add Memory';
    else submitBtn.textContent = 'Update Memory';

    form.classList.add('show');
    inputTitle.focus();
    this.#hideMenu();
    this.#mapEvent = mapE;
  }

  #hideForm() {
    // Empty inputs
    inputTitle.value = inputDesc.value = '';

    form.style.display = 'none';
    form.classList.remove('show');
    setTimeout(() => (form.style.display = 'flex'), 1000);
  }

  #showMenu() {
    hamburger.classList.add('open');
    menu.classList.add('expanded');
    menuExpanded = true;
  }

  #hideMenu() {
    hamburger.classList.remove('open');
    menu.classList.remove('expanded');
    menuExpanded = false;
  }

  #showMenuEditor(e) {
    console.log('click');

    const elem = e.target;
    elem.parentElement.classList.add('show');
    document.addEventListener('click', e => {
      if (!e.target.classList.contains('menu__option') && e.target !== elem) {
        elem.parentElement.classList.remove('show');
      }
    });

    // console.log(e.target);
    // const editorEl = e.target.closest('.settings');

    // if (!editorEl) return;

    // editorEl.classList.add('show');

    // setTimeout(() => {
    //   document.addEventListener('click', e => {
    //     if (e.target.tagName !== 'i' || e.target !== editorEl) {
    //       editorEl.classList.remove('show');
    //     }
    //   });
    // }, 1000);
  }

  #hideAddNewMemory() {
    addNewMemory.classList.add('hide');
  }

  #submit(e) {
    e.preventDefault();
    if (defaultUpdate) this.#newMemory(e);
    if (!defaultUpdate) this.#updateMemory(e);
  }

  #newMemory(e) {
    const validInput = (...inputs) => inputs.every(inp => !inp !== '');

    e.preventDefault();

    // Get data from the form
    const title = inputTitle.value;
    const description = inputDesc.value;

    if (!this.#mapEvent.latlng) return alert('Please select a memory location');

    const { lat, lng } = this.#mapEvent.latlng;
    let memory;

    // If memory running, create running object

    // Check if data is valid
    if (
      //   !Number.isFinite(distance) ||
      //   !Number.isFinite(duration) ||
      //   !Number.isFinite(cadence)
      !validInput(title, description)
    )
      return alert('Inputs have to be positive number');

    memory = new Memory([lat, lng], title, description);

    // Add new Object to memory array
    this.#memories.push(memory);

    // Render memory on map as marker
    this.#renderMemoryMarker(memory);

    // Render memory on list
    this.#renderMemory(memory);

    // Hide form and Clear input fields
    this.#hideForm();

    // expand menu
    this.#showMenu();

    // hide add new note
    this.#hideAddNewMemory();

    // Set local storage to all memorys
    this.#setLocalStorage();
  }

  #updateMemory(e) {
    console.log(currentId);
    const noteUpdated = document.querySelector(`[data-id="${currentId}"]`);
    const memory = this.#memories.find(memory => memory.id === currentId);

    this.#showForm(e);
    memory.title = noteUpdated.querySelector('.note__title').textContent =
      inputTitle.value;
    memory.description = inputDesc.value;
    noteUpdated.querySelector('.note__desc').innerHTML =
      memory.description.replaceAll('\n', '<br/>');

    defaultUpdate = true;

    // Hide form and Clear input fields
    this.#hideForm();
    // expand menu
    this.#showMenu();

    this.#setLocalStorage();
  }

  #renderMemoryMarker(memory) {
    const marker = L.marker(memory.coords, {
      riseOnHover: true,
      title: 'Marker',
      opacity: 0.8,
    }).addTo(this.#map);

    const popup = L.popup({
      maxWidth: 320,
      minWidth: 100,
      autoClose: false,
      closeOnClick: false,
      className: `marker-popup`,
    }).setContent(`📝 ${memory.subtitle}`);
    marker.bindPopup(popup).openPopup();

    this.#memoryMarkers.push(marker);
  }

  #renderMemory(memory) {
    let filterDesc = memory.description.replaceAll('\n', '<br/>');
    let html = `<li class="note" data-id="${memory.id}">
    <div class="details">
      <p class="note__title">${memory.title}</p>
      <span class="note__desc">${filterDesc}</span>
    </div>
    <div class="bottom-content">
      <span class="note__date">${memory.dateFormat}</span>
      <div class="settings">
        <i class="uil uil-ellipsis-h"></i>
        <ul class="settings__menu">
          <li class="menu__option menu__option--edit">
            <i class="uil uil-pen menu__icon"></i>Edit
          </li>
          <li class="menu__option menu__option--delete">
            <i class="uil uil-trash"></i>Delete
          </li>
        </ul>
      </div>
    </div>
  </li>`;

    notes.insertAdjacentHTML('afterbegin', html);

    // dotsSettings = document.querySelectorAll('.uil-ellipsis-h');
    // dotsSettings.forEach(dot => {
    //   console.log(dot);
    //   dot.addEventListener('click', this.#showMenuEditor.bind(this));
    // });
    document
      .querySelector('.uil-ellipsis-h')
      .addEventListener('click', this.#showMenuEditor.bind(this));

    document
      .querySelector('.menu__option--delete')
      .addEventListener('click', this.#deleteNote.bind(this));

    document
      .querySelector('.menu__option--edit')
      .addEventListener('click', this.#editNote.bind(this));
  }

  #moveToPopup(e) {
    const check = e.target.closest('.settings__menu');
    const memoryEl = e.target.closest('.note');

    if (!memoryEl || check) return;

    const memory = this.#memories.find(memo => memo.id === memoryEl.dataset.id);

    this.#map.setView(memory.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

    // using the public interface
    // memory.click();
  }

  #setLocalStorage() {
    localStorage.setItem('memories', JSON.stringify(this.#memories));
  }

  #getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('memories'));

    if (!data) return;

    data.forEach(it => (it.__proto__ = Memory.prototype));

    this.#memories = data;

    this.#memories.forEach(memo => {
      this.#renderMemory(memo);
    });

    this.#hideAddNewMemory();
  }

  #searchOptions(e) {
    const searchEl = e.target.closest('.search-menu__link');

    if (!searchEl) return;

    searchMenuLinks.forEach(el => el.classList.remove('selected'));
    searchEl.classList.add('selected');

    if (searchEl.classList.contains('delete-all')) return this.#deleteAll();
    if (searchEl.classList.contains('show-all')) return this.#showAll();
    if (searchEl.classList.contains('sort')) return this.#sortMenu();
  }

  #deleteAll() {
    let confirmDel = confirm('Are you sure you want to delete all notes?');
    if (!confirmDel) return;
    this.reset();
  }

  #showAll() {
    const group = new L.featureGroup(this.#memoryMarkers);
    this.#map.fitBounds(group.getBounds());
  }

  #sortMenu() {
    sortMenu.classList.toggle('selected');
    document.addEventListener('click', e => {
      if (sortMenu.classList.contains('selected'))
        if (!e.target.closest('.sort')) {
          sortMenu.classList.toggle('selected');
        }
    });
  }

  #deleteNote(e) {
    let confirmDel = confirm('Are you sure you want to delete this note?');
    if (!confirmDel) return;
    // Identification of the workout that has to be deleted
    const el = e.target.closest('.note');

    // Delete marker from Markers UI and workoutMarkers array
    const memoryCoords = this.#memories.find(
      workout => workout.id === el.dataset.id
    ).coords;

    const markerIndex = this.#memoryMarkers.findIndex(marker => {
      return (
        marker._latlng.lat === memoryCoords[0] &&
        marker._latlng.lng === memoryCoords[1]
      );
    });

    this.#map.removeLayer(this.#memoryMarkers[markerIndex]); // Delete from UI
    this.#memoryMarkers.splice(markerIndex, 1); // Delete from workouMarkers Array

    // Delete workout from workout Arrays
    this.#memories = this.#memories.filter(memo => {
      return memo.id !== el.dataset.id;
    });

    // Delete workout from list in UI
    el.remove();

    // Checking if the workout array is empty or not, If it is, this function will disable all menu links
    this.#checkMemories();

    // Updating localStorage or resetting it if there are no more workouts
    if (this.#memories.length !== 0) {
      this.#setLocalStorage(); // Will overwrite the previous 'workout' item
    } else {
      localStorage.removeItem('memories');
      addNewMemory.classList.remove('hide');

      // Also, if we delete the last workout, the map should be positioned on user's initial coords
      this.#map.setView(this.#userCoords, this.#mapZoomLevel, {
        animate: true,
        duration: 1.2,
      });
    }
  }

  #checkMemories() {
    if (this.#memories.length === 0) {
      document.querySelectorAll('.menu__link').forEach(link => {
        link.classList.add('disabled');
      });
    } else {
      document.querySelectorAll('.menu__link').forEach(link => {
        link.classList.remove('disabled');
      });
    }
  }

  #editNote(e) {
    const item = e.target.closest('.note');

    currentId = item.dataset.id;
    const memory = this.#memories.find(memory => memory.id === currentId);

    inputTitle.value = memory.title;
    inputDesc.value = memory.description;
    defaultUpdate = false;

    this.#showForm(e);
  }

  #sortDate(e) {
    // Sorting by date (default)
    e.preventDefault();

    // Hiding the sort menu
    sortMenu.classList.remove('selected');

    // Doing the sort (date is default, no need to pass the string 'date') to _sortWorkouts()
    this.#sortMemories();
  }

  #sortTitle(e) {
    // Sorting by title
    e.preventDefault();
    // Hiding the sort menu
    sortMenu.classList.remove('selected');

    // Doing the sort
    this.#sortMemories('title');
  }

  #sortMemories(option = 'date') {
    // Changing the visual text on the sort link
    sortChoice.textContent = option;

    document.querySelectorAll('.note').forEach(el => el.remove());

    console.log(this.#memories);
    this.#memories
      .slice()
      .sort((a, b) => {
        if (option === 'date') return a[option] - b[option];
        if (option === 'title') {
          if (a[option] > b[option]) {
            return -1;
          }
          if (a[option] < b[option]) {
            return 1;
          }
          return 0;
        }
      })
      .forEach(memory => {
        this.#renderMemory(memory);
      });
    console.log(this.#memories);
  }

  #search() {
    console.log('search');
  }

  reset() {
    localStorage.removeItem('memories');
    location.reload();
  }
}

const app = new App();

////////////////////////////////////////////////////////////////

searchInput.addEventListener('keyup', () => {
  if (searchInput.value !== '') removeIcon.classList.add('visible');
  if (searchInput.value === '') removeIcon.classList.remove('visible');
});

removeIcon.addEventListener('click', () => {
  searchInput.value = '';
  searchInput.focus();
  removeIcon.classList.remove('visible');
});

////////////////////////////////////////////////////////////////

let menuExpanded = false;

window.addEventListener('DOMContentLoaded', function () {
  let height = window.innerHeight,
    x = 0,
    y = height / 2,
    curveX = 10,
    curveY = 0,
    targetX = 0,
    xitteration = 0,
    yitteration = 0;

  let isMobile = false;
  //   isMobile = navigator.userAgentData.mobile; //resolves true/false
  function detectMob() {
    return window.innerWidth <= 800 && window.innerHeight <= 1000;
  }

  isMobile = detectMob();

  if (typeof screen.orientation === 'undefined') isMobile = true;

  window.addEventListener('mousemove', function (e) {
    x = e.pageX;
    y = e.pageY;
  });

  hamburger.addEventListener('mouseenter', function (e) {
    e.stopPropagation();
    if (isMobile) return;
    if (e.clientX > 100) return;
    this.classList.add('open');
    menu.classList.add('expanded');
    //  noteContainer.classList.remove('show');
    menuExpanded = true;
  });

  hamContainer.addEventListener('mouseenter', function (e) {
    e.stopPropagation();
    if (isMobile) return;
    if (e.clientX > 100) return;
    hamburger.classList.add('open');
    menu.classList.add('expanded');
    //  noteContainer.classList.remove('show');
    menuExpanded = true;
  });

  hamContainer.addEventListener('click', function () {
    hamburger.classList.toggle('open');
    menu.classList.toggle('expanded');
    menuExpanded = false;
    //  noteContainer.classList.toggle('show');
  });

  if (isMobile) return;

  function easeOutExpo(
    currentIteration,
    startValue,
    changeInValue,
    totalIterations
  ) {
    return (
      changeInValue *
        (-Math.pow(2, (-10 * currentIteration) / totalIterations) + 1) +
      startValue
    );
  }

  let hoverZone = 150;
  let expandAmount = 20;

  function svgCurve() {
    if (curveX > x - 1 && curveX < x + 1) {
      xitteration = 0;
    } else {
      if (menuExpanded) {
        targetX = 0;
      } else {
        xitteration = 0;
        if (x > hoverZone) {
          targetX = 0;
        } else {
          targetX = -(((60 + expandAmount) / 100) * (x - hoverZone));
        }
      }
      xitteration++;
    }

    if (curveY > y - 1 && curveY < y + 1) {
      yitteration = 0;
    } else {
      yitteration = 0;
      yitteration++;
    }

    curveX = easeOutExpo(xitteration, curveX, targetX - curveX, 100);
    curveY = easeOutExpo(yitteration, curveY, y - curveY, 100);

    let anchorDistance = 200;
    let curviness = anchorDistance - 40;

    let newCurve2 =
      'M60,' +
      height +
      'H0V0h60v' +
      (curveY - anchorDistance) +
      'c0,' +
      curviness +
      ',' +
      curveX +
      ',' +
      curviness +
      ',' +
      curveX +
      ',' +
      anchorDistance +
      'S60,' +
      curveY +
      ',60,' +
      (curveY + anchorDistance * 2) +
      'V' +
      height +
      'z';

    blobPath.setAttribute('d', newCurve2);

    blob.setAttribute('width', curveX + 60);

    hamburger.style.transform = 'translate(' + curveX + 'px, ' + curveY + 'px)';

    window.requestAnimationFrame(svgCurve);
  }

  window.requestAnimationFrame(svgCurve);
});

//////////////////////////////////////////////////////////////////
