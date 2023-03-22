document.addEventListener("DOMContentLoaded", () => {
  //Menu scroll
  let navList = document.querySelector('.main__nav-list');
  navList.addEventListener('wheel', (e) => {
    if(navList.scrollWidth > navList.clientWidth) {
      navList.scrollLeft += (e.deltaY > 0) ? 80 : -80;
      e.preventDefault();
    }
  }, {passive: false})

  //Scroll width
  let testDiv = document.createElement('div');
  testDiv.classList.add('visually-hidden');
  testDiv.style.overflowY = 'scroll';
  testDiv.style.width = '50px';
  testDiv.style.height = '50px';
  document.body.append(testDiv);
  let scrollWidth = testDiv.offsetWidth - testDiv.clientWidth;
  testDiv.remove();
  document.body.style.setProperty('--scroll-width', `${scrollWidth}px`);

  //ScrollTo
  let navLinks = document.querySelectorAll('.main__nav-link');

  const scrollTo = (scrollObj, yPos, duration = 600, callback) => {
    const startY = scrollObj === window ? window.scrollY : 0;
    const difference = yPos - startY;
    const startTime = performance.now();

    const step = () => {
      const progress = (performance.now() - startTime) / duration;
      const amount = easeInOutCubic(progress);
      scrollObj.scrollTo({ top: startY + amount * difference });
      if (progress < 0.99) {
        requestAnimationFrame(step);
      } else callback();
    };

    step();
  }
  const easeInOutCubic = t => t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1;

  navLinks.forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      let scrollToElement = new Object();
      try {
        scrollToElement = document.querySelector(el.getAttribute('href'));
      } catch (error) { return }
      if(scrollToElement !== null) {
        let scrollToElementY = scrollToElement.getBoundingClientRect().top + window.pageYOffset;
        let scrollHeight = Math.max(
          document.body.scrollHeight, document.documentElement.scrollHeight,
          document.body.offsetHeight, document.documentElement.offsetHeight,
          document.body.clientHeight, document.documentElement.clientHeight
        );
        let clientHeight = document.documentElement.clientHeight;
        let scrollObj = burger.menu.contains(scrollToElement) && window.matchMedia('(max-width: 767.98px)').matches ? burger.menu : window;
        let scrollY;
        if(scrollObj === burger.menu) {
          burger.expand();
          scrollY = (burger.menu.scrollHeight - scrollToElement.offsetTop) < clientHeight ? burger.menu.scrollHeight - clientHeight + 80 : scrollToElement.offsetTop + 80;
        } else {
          scrollY = (scrollHeight - scrollToElementY) < clientHeight ? scrollHeight - clientHeight : scrollToElementY;
        }
        scrollTo(scrollObj, scrollY, 600, () => {
          scrollToElement.querySelector('.site-container').classList.add('animate-flash');
        });
      }
    }, {passive: false})
  })
  let siteContainer = document.querySelectorAll('.site-container');
  siteContainer.forEach(el => {
    el.addEventListener('animationend', () => {
      el.classList.remove('animate-flash');
    })
  })

  //Burger
  const burger = {
    menu: document.querySelector('.aside__burger'),
    button: document.querySelector('.aside__burger-btn'),
    buttonTextContainer: document.querySelector('.aside__burger-btn span'),
    buttonDefaultText: 'Ещё кое что...',
    buttonActiveText: 'Назад...',
    collapsed: true,
    scrolledTop: true,
    collapse: function() {
      burger.menu.classList.remove('aside__burger--active');
      document.body.classList.remove('stop-scroll');
      burger.buttonTextContainer.innerText = burger.buttonDefaultText;
      burger.collapsed = true;
    },
    expand: function() {
      burger.menu.classList.add('aside__burger--active');
      burger.button.classList.remove('aside__burger-btn--collapsed');
      document.body.classList.add('stop-scroll');
      burger.buttonTextContainer.innerText = burger.buttonActiveText;
      burger.collapsed = false;
    },
    toggle: function() {
      burger.menu.classList.toggle('aside__burger--active');
      burger.button.classList.remove('aside__burger-btn--collapsed');
      document.body.classList.toggle('stop-scroll');
      burger.buttonTextContainer.innerText = (burger.buttonTextContainer.innerText === burger.buttonActiveText) ? burger.buttonDefaultText : burger.buttonActiveText;
      burger.collapsed = !burger.collapsed;
    }
  }

  const burgerTouch = {
    touchStarted: false,
    startTimeStamp: 0,
    startPos: {x: -1, y: -1},
    deltaPos: {x: -1, y: -1},
    deltaT: 0
  }

  burger.menu.addEventListener('scroll', () => {
    burger.scrolledTop = !burger.menu.scrollTop;
  })

  burger.button.addEventListener('click', () => {
    burger.toggle();
  })

  burger.menu.addEventListener('touchstart', (e) => {
    if((e.targetTouches.length == 1) && !burger.collapsed && burger.scrolledTop) {
      let touch = e.targetTouches.item(0);
      burgerTouch.touchStarted = true;
      burgerTouch.startTimeStamp = Date.now();
      burgerTouch.startPos.x = touch.clientX;
      burgerTouch.startPos.y = touch.clientY;
    }
  })

  burger.menu.addEventListener('touchmove', (e) => {
    if(burgerTouch.touchStarted && (e.targetTouches.length == 1)) {
      let touch = e.targetTouches.item(0);
      burgerTouch.deltaPos.x = touch.clientX - burgerTouch.startPos.x;
      burgerTouch.deltaPos.y = touch.clientY - burgerTouch.startPos.y;
      burgerTouch.deltaT = Date.now() - burgerTouch.startTimeStamp;
    }
  })

  burger.menu.addEventListener('touchend', () => {
    if(burgerTouch.touchStarted && (Math.abs(burgerTouch.deltaPos.y / burgerTouch.deltaPos.x) >= 1) && ((burgerTouch.deltaPos.y / burgerTouch.deltaT) >= 1)) {
      burger.collapse();
    }
    burgerTouch.touchStarted = false;
    burgerTouch.deltaPos.x = 0;
    burgerTouch.deltaPos.y = 0;
    burgerTouch.deltaT = 0;
  })

  burger.menu.addEventListener('click', (e) => {
    if((e.target === burger.menu) && !burger.collapsed) {
      burger.collapse();
    }
  })

  window.addEventListener('resize', () => {
    if(window.matchMedia('(min-width: 768px)').matches && !burger.collapsed) {
      burger.collapse();
    }
  })

  let lastScrollPos;
  window.addEventListener('scroll', (e) => {
    if(!lastScrollPos) {
      lastScrollPos = window.scrollY;
    } else {
      if(window.matchMedia('(max-width: 767.98px)').matches && burger.collapsed) {
        if(window.scrollY - lastScrollPos > 0) {
          burger.button.classList.add('aside__burger-btn--collapsed');
        } else {
          burger.button.classList.remove('aside__burger-btn--collapsed');
        }
        lastScrollPos = undefined;
      }
    }
  })

  //Intro
  const introContainer = document.querySelector('.intro');
  const introSvgUse = introContainer.querySelector('use');
  const container = document.querySelector('.container');

  const introAnimation = (framesCount, duration) => {
    const startTime = performance.now();
    let counter = 1;
    const zeros = '0000';
    const step = () => {
      const progress = (performance.now() - startTime) / duration;
      counter = Math.round((framesCount - 1) * progress) + 1;
      introSvgUse.setAttribute('xlink:href', `img/cat-animation.svg#cat${zeros.substring(String(counter).length)}${counter}`);

      if(progress <= 0.999) {
        requestAnimationFrame(step);
      } else {
        container.classList.add('intro-animation');
        setTimeout(() => {
          introContainer.classList.remove('intro--active');
          document.body.classList.remove('stop-scroll');
        }, 20);
      }
    }
    step();
  }

  window.addEventListener('load', () => {
    introAnimation(173, 2800);
  })

  container.addEventListener('animationend', (e) => {
    if(e.target === container) container.classList.remove('intro-animation');
  })

  //Lang
  fetch('../lang/en.json', {method: 'GET'})
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    let search = location.search.substring(1)
      .split('&')
      .reduce((res, a) => {
        let t = a.split('=');
        res[decodeURIComponent(t[0])] = t.length == 1 ? null : decodeURIComponent(t[1]);
        return res;
      }, {});
    if(!(navigator.language.indexOf('ru') + 1) || search['lang'] === 'en') {
      document.documentElement.setAttribute('lang', 'en');
      let contentStrings = document.querySelectorAll('[data-lang-id]');
      contentStrings.forEach(el => {
        let langId = el.getAttribute('data-lang-id');
        if(langId === 'head-meta-descr') {
          el.setAttribute('content', data[langId])
        } else {
          el.innerHTML = data[langId];
        }
      });
      burger.buttonDefaultText = data['aside-burger-btn'];
      burger.buttonActiveText = data['aside-burger-btn-active'];
      document.querySelector('.aside__hero-img').setAttribute('alt', data['aside-my-name-content']);
    }
  })
})
