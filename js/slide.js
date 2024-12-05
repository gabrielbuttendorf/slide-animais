export default class Slide {
  constructor(slide, wrapper) {
    this.slide = document.querySelector(slide);
    this.wrapper = document.querySelector(wrapper);
    this.distances = { startPosition: 0, lastPosition: 0, movement: 0 };
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

  addEvents() {
    this.wrapper.addEventListener('mousedown', this.onStart);
    this.wrapper.addEventListener('touchstart', this.onStart);
    this.wrapper.addEventListener('mouseup', this.onEnd);
    this.wrapper.addEventListener('touchend', this.onEnd);
  }

  bindEvents() {
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);
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
  }

  init() {
    this.transition(true);
    this.bindEvents();
    this.addEvents();
    this.updatePosition();
    this.slidesConfig();

    return this;
  }
}
