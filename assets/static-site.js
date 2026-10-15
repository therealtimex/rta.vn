(() => {
  'use strict';
  // The old theme can leave its mobile nav empty after a static export.
  const menuToggle = document.querySelector('[aria-label="Toggle mobile menu"]');
  const sourceMenu = document.querySelector('.fusion-main-menu > ul');
  if (menuToggle && sourceMenu) {
    const navigation = document.createElement('nav');
    navigation.id = 'static-mobile-navigation';
    navigation.setAttribute('aria-label', 'Mobile navigation');
    navigation.hidden = true;
    const menu = sourceMenu.cloneNode(true);
    for (const element of [menu, ...menu.querySelectorAll('*')]) {
      element.removeAttribute('id');
      element.removeAttribute('class');
      element.removeAttribute('style');
    }
    for (const element of menu.querySelectorAll('form, .fusion-main-menu-search')) element.remove();
    navigation.append(menu);
    document.querySelector('.fusion-header-wrapper')?.append(navigation);
    menuToggle.setAttribute('aria-controls', navigation.id);
    menuToggle.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      navigation.hidden = !navigation.hidden;
      menuToggle.setAttribute('aria-expanded', String(!navigation.hidden));
    }, true);
  }
  for (const element of document.querySelectorAll('[data-static-action]')) {
    const action = JSON.parse(element.dataset.staticAction);
    const activate = () => {
      if (action.type === 'link' && /^https?:\/\//.test(action.action || '')) {
        if (action.target === '_blank') window.open(action.action, '_blank', 'noopener');
        else location.href = action.action;
      } else if (action.type === 'section') {
        document.getElementById(action.action)?.scrollIntoView({behavior:'smooth',block:'start'});
      } else if (action.type === 'hidden_show') {
        for (const id of action.hidden_ids || []) document.getElementById(id)?.style.setProperty('display','none','important');
        for (const id of action.show_ids || []) document.getElementById(id)?.style.setProperty('display','block','important');
      }
    };
    element.addEventListener('click', activate);
    element.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {event.preventDefault();activate();}
    });
  }
  const target = document.getElementById('static-search-results');
  if (!target) return;
  const query = (new URLSearchParams(location.search).get('s') || '').trim();
  const input = document.getElementById('static-query');
  if (input) input.value = query;
  if (!query) {
    target.textContent = 'Enter a word or phrase to search the archived pages.';
    return;
  }
  const normalize = text => text.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  fetch('/assets/search-index.json')
    .then(response => {
      if (!response.ok) throw new Error('Search index could not be loaded');
      return response.json();
    })
    .then(pages => {
      const matches = pages.map(page => {
        const title = normalize(page.title);
        const text = normalize(page.text);
        return {page, score: terms.every(term => title.includes(term) || text.includes(term))
          ? terms.reduce((score, term) => score + (title.includes(term) ? 10 : 1), 0) : 0};
      }).filter(match => match.score).sort((a, b) => b.score - a.score);
      target.replaceChildren();
      const count = document.createElement('p');
      count.textContent = `${matches.length} results for “${query}”`;
      target.append(count);
      for (const {page} of matches) {
        const article = document.createElement('article');
        const heading = document.createElement('h2');
        const link = document.createElement('a');
        link.href = page.url;
        link.textContent = page.title;
        heading.append(link);
        const excerpt = document.createElement('p');
        excerpt.textContent = page.text.slice(0, 240) + (page.text.length > 240 ? '…' : '');
        article.append(heading, excerpt);
        target.append(article);
      }
    }).catch(() => {
      target.textContent = 'Search is temporarily unavailable. Please use the navigation menu.';
    });
})();
