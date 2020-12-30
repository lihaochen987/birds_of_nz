const carousel = document.querySelector('.main-carousel');
const flkty = new Flickity( carousel, {
  imagesLoaded: true,
  percentPosition: false,
});

const imgs = carousel.querySelectorAll('.carousel-cell img');
// get transform property
const docStyle = document.documentElement.style;
const transformProp = typeof docStyle.transform == 'string' ?
  'transform' : 'WebkitTransform';

flkty.on( 'scroll', function() {
  flkty.slides.forEach( function( slide, i ) {
    const img = imgs[i];
    const x = ( slide.target + flkty.x ) * -1/3;
    img.style[ transformProp ] = 'translateX(' + x  + 'px)';
  });
});