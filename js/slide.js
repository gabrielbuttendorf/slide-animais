import debounce from './debounce.js';

export class Slide {
  constructor(slide, wrapper) {
    this.slide = document.querySelector(slide);
    this.wrapper = document.querySelector(wrapper);
    this.distances = { startPosition: 0, lastPosition: 0, movement: 0 };
    this.activeClass = 'ativo';
    this.changeEvent = new Event('changeEvent');
  }

  moveSlide(distanceX) {
    this.distances.movePosition = distanceX;
    this.slide.style.transform = `translate3d(${distanceX}px, 0, 0)`;
  }

  transition(active) {
    this.slide.style.transition = active ? '.3s' : '';
  }

  updatePosition(clientX) {
    this.distances.movement = (this.distances.startPosition - clientX) * 1.6;
    return this.distances.lastPosition - this.distances.movement;
  }

  onStart(event) {
    this.transition(false);
    let moveType;
    event.preventDefault();

    if (event.type === 'mousedown') {
      this.distances.startPosition = event.clientX;
      moveType = 'mousemove';
    } else {
      this.distances.startPosition = event.changedTouches[0].clientX;
      moveType = 'touchmove';
    }

    this.wrapper.addEventListener(moveType, this.onMove);
  }

  onMove(event) {
    const clientX =
      event.type === 'mousemove'
        ? event.clientX
        : event.changedTouches[0].clientX;

    let finalPosition = this.updatePosition(clientX);
    this.moveSlide(finalPosition);
  }

  onEnd(event) {
    const moveType = event.type === 'mouseup' ? 'mousemove' : 'touchmove';
    this.wrapper.removeEventListener(moveType, this.onMove);
    this.distances.lastPosition = this.distances.movePosition;
    this.transition(true);
    this.changeSlideOnEnd();
  }

  changeSlideOnEnd() {
    if (this.distances.movement > 140 && this.index.next !== undefined) {
      this.activeNextSlide();
    } else if (
      this.distances.movement < -140 &&
      this.index.prev !== undefined
    ) {
      this.activePrevSlide();
    } else {
      this.changeSlide(this.index.active);
    }
  }

  slidePosition(slide) {
    const margin = (this.wrapper.offsetWidth - slide.offsetWidth) / 2;
    return -(slide.offsetLeft - margin);
  }

  slidesConfig() {
    this.slideArray = [...this.slide.children].map((element) => {
      const position = this.slidePosition(element);
      return { element, position };
    });
  }

  slidesIndexNav(index) {
    const last = this.slideArray.length - 1;

    this.index = {
      prev: index === 0 ? undefined : index - 1,
      active: index,
      next: index === last ? undefined : index + 1,
    };
  }

  activePrevSlide() {
    if (this.index.prev !== undefined) {
      this.changeSlide(this.index.prev);
    }
  }

  activeNextSlide() {
    if (this.index.next !== undefined) {
      this.changeSlide(this.index.next);
    }
  }

  changeSlide(index) {
    const activeSlide = this.slideArray[index];
    this.moveSlide(activeSlide.position);
    this.slidesIndexNav(index);
    this.distances.lastPosition = activeSlide.position;
    this.changeActiveClass();
    this.wrapper.dispatchEvent(this.changeEvent);
  }

  changeActiveClass() {
    this.slideArray.forEach((slide) => {
      slide.element.classList.remove(this.activeClass);
    });

    this.slideArray[this.index.active].element.classList.add(this.activeClass);
  }

  addSlideEvents() {
    this.wrapper.addEventListener('mousedown', this.onStart);
    this.wrapper.addEventListener('touchstart', this.onStart);
    this.wrapper.addEventListener('mouseup', this.onEnd);
    this.wrapper.addEventListener('touchend', this.onEnd);
    window.addEventListener('resize', this.onResize);
  }

  bindEvents() {
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);
    this.activePrevSlide = this.activePrevSlide.bind(this);
    this.activeNextSlide = this.activeNextSlide.bind(this);
    this.onResize = debounce(this.onResize.bind(this), 200);
    this.eventControl = this.eventControl.bind(this);
    this.activeControlItem = this.activeControlItem.bind(this);
  }

  onResize() {
    setTimeout(() => {
      this.slidesConfig();
      this.changeSlide(this.index.active);
    }, 500);
  }

  init() {
    this.transition(true);
    this.bindEvents();
    this.addSlideEvents();
    this.updatePosition();
    this.slidesConfig();
    this.changeSlide(1);

    return this;
  }
}

export class NavSlide extends Slide {
  addArrow(prev, next) {
    this.prevButton = document.querySelector(prev);
    this.nextButton = document.querySelector(next);
    this.addNavSlideEvents();
  }

  addNavSlideEvents() {
    this.prevButton.addEventListener('click', this.activePrevSlide);
    this.nextButton.addEventListener('click', this.activeNextSlide);
  }

  createControl() {
    const control = document.createElement('ul');
    control.dataset.control = 'slide';
    this.slideArray.forEach((item, index) => {
      control.innerHTML += `<li><a href="#slide${index + 1}">${index + 1}</a></li>`;
    });

    this.wrapper.appendChild(control);
    return control;
  }

  eventControl(item, index) {
    item.addEventListener('click', (event) => {
      event.preventDefault();
      this.changeSlide(index);
    });
    this.wrapper.addEventListener('changeEvent', this.activeControlItem);
  }

  addControl(customControl) {
    this.control = document.querySelector(customControl) || this.createControl();
    this.controlArray = [...this.control.children];
    this.controlArray.forEach(this.eventControl);
    this.activeControlItem();
  }

  activeControlItem() {
    this.controlArray.forEach((item) => {
      item.classList.remove(this.activeClass);
    })
    this.controlArray[this.index.active].classList.add(this.activeClass);
  }
}
