import { NavSlide } from './slide.js';

const slide = new NavSlide('.slide', '.slide-wrapper');
slide.init();
slide.addArrow('.prev', '.next');
slide.addControl();