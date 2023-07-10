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
const notes = document.querySelector('.notes');
const inputTitle = document.querySelector('.add-note__input--title');
const inputDesc = document.querySelector('.add-note__input--desc');
const history = document.querySelector('.history__content');
const addNewMemory = document.querySelector('.add-box');
const searchMenu = document.querySelector('.search-menu');
const searchMenuLinks = document.querySelectorAll('.search-menu__link');

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
    console.log(this.subtitle);
  }
}

const memo = new Memory([39, -12], 'first', 'desijpkaslpfoajöoöafaS');

class App {
  #map;
  #mapEvent;
  #memories = [];
  #mapZoomLevel = 13;

  constructor() {
    // Get user's position
    this.#getposition();

    // Get data from local storage
    this.#getLocalStorage();

    // Attach event handlers
    form.addEventListener('submit', this.#newMemory.bind(this));

    notes.addEventListener('click', this.#moveToPopup.bind(this));

    addNewMemory.addEventListener('click', this.#showForm.bind(this));

    searchMenu.addEventListener('click', this.#searchOptions.bind(this));
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
    //  console.log(`https://www.google.co.uk/maps/@${latitude},${longitude}`);
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Handling clicks on map
    this.#map.on('click', this.#showForm.bind(this));

    this.#memories.forEach(memo => {
      this.#renderMemoryMarker(memo);
    });
  }

  #showForm(mapE) {
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

  #hideAddNewMemory() {
    addNewMemory.classList.add('hide');
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

    // expan menu
    this.#showMenu();

    // hide add new note
    this.#hideAddNewMemory();

    // Set local storage to all memorys
    this.#setLocalStorage();
  }

  #renderMemoryMarker(memory) {
    L.marker(memory.coords, {
      riseOnHover: true,
      title: 'Marker',
      opacity: 0.8,
    })
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 320,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `marker-popup`,
        })
      )
      .setPopupContent(`📝 ${memory.subtitle}`)
      .openPopup();
  }

  #renderMemory(memory) {
    let html = `<li class="note" data-id="${memory.id}">
    <div class="details">
      <p class="note__title">${memory.title}</p>
      <span class="note__desc">${memory.description}</span>
    </div>
    <div class="bottom-content">
      <span class="note__date">${memory.dateFormat}</span>
      <div class="settings show">
        <i onclick="showMenu(this)" class="uil uil-ellipsis-h"></i>
        <ul class="menu">
          <li class="menu__option">
            <i class="uil uil-pen menu__icon"></i>Edit
          </li>
          <li class="menu__option">
            <i class="uil uil-trash"></i>Delete
          </li>
        </ul>
      </div>
    </div>
  </li>`;

    notes.insertAdjacentHTML('afterbegin', html);
  }

  #moveToPopup(e) {
    const memoryEl = e.target.closest('.note');
    console.log(memoryEl);

    if (!memoryEl) return;

    console.log(memoryEl.dataset.id);

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
