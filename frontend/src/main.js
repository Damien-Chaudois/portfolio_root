import './style.css'

const katas = [
  {
    name: 'Infrastructure VPS',
    description: 'Nginx, Docker Compose, TLS wildcard, CI/CD GitHub Actions',
    url: null,
    status: 'live',
  },
]

function renderKata(kata) {
  const tag = kata.status === 'live'
    ? '<span class="badge badge--live">live</span>'
    : '<span class="badge badge--wip">en cours</span>'

  const inner = `
    <div class="kata__header">
      <span class="kata__name">${kata.name}</span>
      ${tag}
    </div>
    <p class="kata__desc">${kata.description}</p>
  `

  if (kata.url) {
    return `<a class="kata kata--link" href="${kata.url}" target="_blank" rel="noopener noreferrer">${inner}</a>`
  }
  return `<article class="kata">${inner}</article>`
}

document.querySelector('#app').innerHTML = `
  <div class="layout">
    <header class="hero">
      <p class="hero__label">portfolio</p>
      <h1 class="hero__name">Damien Chaudois</h1>
      <p class="hero__title">Développeur Fullstack .NET</p>
      <p class="hero__subtitle">
        Ce site est un laboratoire public. Chaque kata démontre une maîtrise technique
        concrète — de l'infrastructure jusqu'à l'application.
      </p>
      <div class="hero__links">
        <a href="https://github.com/Damien-Chaudois" target="_blank" rel="noopener noreferrer" class="btn">
          GitHub
        </a>
      </div>
    </header>

    <main>
      <section class="section">
        <h2 class="section__title">Katas</h2>
        <div class="katas">
          ${katas.map(renderKata).join('')}
        </div>
      </section>
    </main>

    <footer class="footer">
      <p>Infrastructure hébergée sur Hetzner VPS — déployée via GitHub Actions</p>
    </footer>
  </div>
`
