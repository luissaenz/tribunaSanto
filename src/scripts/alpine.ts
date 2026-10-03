// WEB.3 — Única entrada funcional de cliente: inicialización de Alpine.js.
//
// El markup sólo referencia componentes por nombre (x-data="siteNav",
// x-data="carousel(3)"): toda la lógica vive aquí y en ./interactions/.

import Alpine from 'alpinejs';
import { CAROUSEL_INTERVAL_MS, COPY_FEEDBACK_MS } from './interactions/constants.js';
import { clampIndex, nextIndex, prevIndex } from './interactions/carousel.js';
import { endX, startX, swipeDirection } from './interactions/swipe.js';
import { shouldShowBackToTop } from './interactions/scroll.js';
import { copyText } from './interactions/copy.js';
import { formatToday, searchUrl } from './interactions/nav.js';

declare global {
  interface Window {
    Alpine: typeof Alpine;
  }
}

/** Magias de Alpine disponibles en `this` dentro de cada componente. */
type Magics = {
  $nextTick: (callback: () => void) => void;
  $refs: Record<string, HTMLElement | undefined>;
  $root: HTMLElement;
};

const component = <T extends object>(definition: T & ThisType<T & Magics>): T => definition;

Alpine.data('siteNav', () =>
  component({
    menuOpen: false,
    searchOpen: false,
    q: '',
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    },
    closeMenu() {
      this.menuOpen = false;
    },
    toggleSearch() {
      this.searchOpen = !this.searchOpen;
      if (this.searchOpen) this.$nextTick(() => (this.$refs.searchInput as HTMLInputElement | undefined)?.focus());
    },
    closeAll() {
      this.menuOpen = false;
      this.searchOpen = false;
    },
    submitSearch() {
      const url = searchUrl(this.q);
      if (url) window.location.href = url;
    }
  })
);

Alpine.data('topbarDate', () =>
  component({
    text: '',
    init() {
      this.text = formatToday();
    }
  })
);

Alpine.data('carousel', (count: number) =>
  component({
    current: 0,
    count,
    hovered: false,
    focused: false,
    timer: null as ReturnType<typeof setInterval> | null,
    dragStartX: 0,
    get paused() {
      return this.hovered || this.focused;
    },
    init() {
      this.startTimer();
    },
    destroy() {
      this.stopTimer();
    },
    isActive(index: number) {
      return this.current === index;
    },
    next() {
      this.current = nextIndex(this.current, this.count);
    },
    prev() {
      this.current = prevIndex(this.current, this.count);
    },
    goTo(index: number) {
      this.current = clampIndex(index, this.count);
      this.startTimer();
    },
    manualNext() {
      this.next();
      this.startTimer();
    },
    manualPrev() {
      this.prev();
      this.startTimer();
    },
    startTimer() {
      this.stopTimer();
      this.timer = setInterval(() => {
        if (!this.paused) this.next();
      }, CAROUSEL_INTERVAL_MS);
    },
    stopTimer() {
      if (this.timer) clearInterval(this.timer);
      this.timer = null;
    },
    onDragStart(event: MouseEvent | TouchEvent) {
      this.dragStartX = startX(event as unknown as Parameters<typeof startX>[0]);
    },
    onDragEnd(event: MouseEvent | TouchEvent) {
      const direction = swipeDirection(this.dragStartX, endX(event as unknown as Parameters<typeof endX>[0]));
      if (direction === 'next') this.next();
      if (direction === 'prev') this.prev();
    },
    // Pausa sólo con foco de teclado: un clic en flechas o indicadores no detiene el autoplay (golden master).
    onFocusIn(event: FocusEvent) {
      const target = event.target as Element | null;
      if (target?.matches(':focus-visible')) this.focused = true;
    },
    onFocusOut(event: FocusEvent) {
      const root = this.$root;
      if (!root.contains(event.relatedTarget as Node | null)) this.focused = false;
    },
    onKeydown(event: KeyboardEvent) {
      if (event.key === 'ArrowRight') this.manualNext();
      if (event.key === 'ArrowLeft') this.manualPrev();
    }
  })
);

Alpine.data('backToTop', () =>
  component({
    show: false,
    onScroll() {
      this.show = shouldShowBackToTop(window.scrollY);
    },
    toTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  })
);

Alpine.data('copyLink', () =>
  component({
    copied: false,
    timer: null as ReturnType<typeof setTimeout> | null,
    async copy() {
      if (!(await copyText(navigator.clipboard, window.location.href))) return;
      this.copied = true;
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => (this.copied = false), COPY_FEEDBACK_MS);
    }
  })
);

Alpine.data('contactForm', () =>
  component({
    sent: false,
    subject: '',
    orgSubjects: [] as string[],
    init() {
      const root = this.$root;
      this.orgSubjects = [...root.querySelectorAll<HTMLOptionElement>('option[data-org]')].map((o) => o.value);
    },
    get showOrg() {
      return this.orgSubjects.includes(this.subject);
    },
    submit() {
      this.sent = true;
    },
    reset() {
      this.sent = false;
    }
  })
);

Alpine.data('faq', () =>
  component({
    open: null as number | null,
    toggle(index: number) {
      this.open = this.open === index ? null : index;
    },
    isOpen(index: number) {
      return this.open === index;
    }
  })
);

Alpine.data('careers', () =>
  component({
    filter: 'all',
    openId: null as string | null,
    setFilter(filter: string) {
      this.filter = filter;
    },
    visible(dept: string) {
      return this.filter === 'all' || this.filter === dept;
    },
    toggle(id: string) {
      this.openId = this.openId === id ? null : id;
    },
    isOpen(id: string) {
      return this.openId === id;
    }
  })
);

Alpine.data('applyForm', () =>
  component({
    sent: false,
    submit() {
      this.sent = true;
    }
  })
);

// Newsletter: no-op DEMO (sin backend, sin request, sin mensaje de éxito).
Alpine.data('newsletter', () =>
  component({
    submit() {}
  })
);

window.Alpine = Alpine;
Alpine.start();
