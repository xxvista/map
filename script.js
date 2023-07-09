window.addEventListener('DOMContentLoaded', function () {
  let height = window.innerHeight,
    x = 0,
    y = height / 2,
    curveX = 10,
    curveY = 0,
    targetX = 0,
    xitteration = 0,
    yitteration = 0,
    menuExpanded = false;

  const blob = document.querySelector('#blob');
  const blobPath = document.querySelector('#blob-path');
  const hamburger = document.querySelector('.hamburger');
  const menu = document.querySelector('.history');
  const innerMenu = document.querySelector('.history__content');
  const hamContainer = document.querySelector('.hamburger-container');
  const noteContainer = document.querySelector('.note-container');

  let isMobile = false;
  //   isMobile = navigator.userAgentData.mobile; //resolves true/false
  function detectMob() {
    return window.innerWidth <= 800 && window.innerHeight <= 1000;
  }

  isMobile = detectMob();

  if (typeof screen.orientation === 'undefined') isMobile = true;

  //   hamContainer.addEventListener(
  //     'touchstart',
  //     e => {
  //       isMobile = true;
  //       hamburger.classList.toggle('open');
  //       menu.classList.toggle('expanded');
  //       // noteContainer.classList.toggle('show');
  //       menuExpanded = false;
  //     },
  //     false
  //   );

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
    //  noteContainer.classList.toggle('show');
    menuExpanded = false;
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

class App {
  #map;
  #mapEvent;
  #workouts = [];
  #mapZoomLevel = 13;

  constructor() {
    // Get user's position
    this.#getposition();
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

    //  // Handling clicks on map
    //  this.#map.on('click', this.#showForm.bind(this));

    //  this.#workouts.forEach(work => {
    //    this.#renderWorkoutMarker(work);
    //  });
  }
}

const app = new App();

////////////////////////////////////////////////////////////////

(searchInput = document.querySelector('.search__input')),
  (removeIcon = document.querySelector('.search__close'));

searchInput.addEventListener('keyup', () => {
  if (searchInput.value !== '') removeIcon.classList.add('visible');
  if (searchInput.value === '') removeIcon.classList.remove('visible');
});
removeIcon.addEventListener('click', () => {
  searchInput.value = '';
  searchInput.focus();
  removeIcon.classList.remove('visible');
});
