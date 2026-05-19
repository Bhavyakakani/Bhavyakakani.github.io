// =============================================
// PREMIUM DARK PORTFOLIO - MAIN JS
// STANDARDIZED VERSION - Compatible with aesthetic-portfolio JSON structure
// =============================================

document.addEventListener('DOMContentLoaded', () => initializeApp());

async function initializeApp() {
    try {
        await Promise.all([
            loadSiteConfig(),
            loadNavigation(),
            loadHero(),
            loadAbout(),
            loadExperience(),
            loadProjects(),
            loadSkills(),
            loadEducation(),
            loadContact(),
            loadFooter()
        ]);
        initializeNavigation();
        initializeScrollEffects();
        initializeBackToTop();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

async function loadSiteConfig() {
    try {
        const data = await fetch('data/site-config.json').then(r => r.json());
        const meta = data.meta || data;
        document.title = meta.title || document.title;
        document.querySelector('meta[name="description"]').content = meta.description || '';
        document.querySelector('meta[name="author"]').content = meta.author || '';
    } catch (error) {
        console.error('Error loading site config:', error);
    }
}

async function loadNavigation() {
    try {
        const data = await fetch('data/navigation.json').then(r => r.json());
        const brand = document.getElementById('nav-brand');
        brand.textContent = data.brand.name;
        brand.href = data.brand.href || '#hero';
        document.getElementById('nav-menu').innerHTML = data.menuItems.map(item =>
            `<li><a href="${item.href}" class="nav-link">${item.text}</a></li>`
        ).join('');
    } catch (error) {
        console.error('Error loading navigation:', error);
    }
}

async function loadHero() {
    try {
        const data = await fetch('data/hero.json').then(r => r.json());

        // Support both old and new structure
        const greeting = data.greeting || '';
        const name = data.name || '';
        const title = data.title || '';
        const summary = data.summary || data.tagline || '';
        const description = data.description || '';

        document.getElementById('hero-greeting').textContent = greeting;
        document.getElementById('hero-name').textContent = name;
        document.getElementById('hero-title').textContent = title;
        document.getElementById('hero-tagline').textContent = summary;
        document.getElementById('hero-description').textContent = description || summary;

        const avatar = document.getElementById('hero-avatar');
        if (avatar && data.avatarUrl) {
            avatar.src = data.avatarUrl;
            avatar.alt = `${name} professional headshot`;
        }

        // Handle CTA - support both structures
        const ctaElement = document.getElementById('hero-cta');
        if (ctaElement) {
            let buttons = [];
            if (data.cta && data.cta.buttons) {
                // New structure: { buttons: [...] }
                buttons = data.cta.buttons;
            } else if (Array.isArray(data.cta)) {
                // Old structure: [...]
                buttons = data.cta;
            }

            ctaElement.innerHTML = buttons.map(btn =>
                `<a href="${btn.href}" class="btn btn-${btn.type}"${btn.external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${btn.text}</a>`
            ).join('');
        }

        const socialElement = document.getElementById('hero-social');
        if (socialElement && data.socialLinks) {
            socialElement.innerHTML = data.socialLinks.map(link =>
                `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="${link.platform}"><i class="${link.icon}"></i></a>`
            ).join('');
        }

        // Handle stats/highlights - support both
        const statsElement = document.getElementById('hero-stats');
        if (statsElement) {
            const highlights = data.highlights || data.stats || [];
            statsElement.innerHTML = highlights.map(item => {
                // Support both formats
                const number = item.number || item.value || item.text || '';
                const label = item.label || '';
                return `<div class="stat-item"><span class="stat-number">${number}</span><span class="stat-label">${label}</span></div>`;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading hero:', error);
    }
}

async function loadAbout() {
    try {
        const data = await fetch('data/about.json').then(r => r.json());
        document.getElementById('about-title').textContent = data.sectionTitle;
        document.getElementById('about-content').innerHTML = data.content.map(p => `<p>${p}</p>`).join('');
        document.getElementById('about-highlights').innerHTML = data.highlights.map(h =>
            `<div class="highlight-card"><i class="${h.icon}"></i><h3>${h.title}</h3><p>${h.description}</p></div>`
        ).join('');
    } catch (error) {
        console.error('Error loading about:', error);
    }
}

// NEW: Load work experience (STANDARDIZED)
async function loadExperience() {
    try {
        const data = await fetch('data/experience.json').then(r => r.json());
        const title = document.getElementById('experience-title');
        const list = document.getElementById('experience-list');
        if (!title || !list) return;

        title.textContent = data.sectionTitle || 'Professional Experience';
        list.innerHTML = (data.experiences || []).map(exp => {
            const logo = exp.logo?.src
                ? `<img src="${exp.logo.src}" alt="${exp.logo.alt || exp.company}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-flex';">
                   <span class="logo-fallback">${exp.logo.fallback || exp.company}</span>`
                : `<span class="logo-fallback visible">${exp.company}</span>`;
            const responsibilities = (exp.responsibilities || [])
                .slice(0, 5)
                .map(item => `<li>${item}</li>`)
                .join('');

            const logoTheme = exp.logo?.theme === 'dark' ? ' dark' : '';

            return `<article class="experience-card">
                <div class="experience-header">
                    <div class="company-logo${logoTheme}">${logo}</div>
                    <div>
                        <p class="experience-company">${exp.company}</p>
                        <h3 class="experience-role">${exp.title}</h3>
                        <p class="experience-meta">${exp.period}${exp.location ? ` | ${exp.location}` : ''}</p>
                    </div>
                </div>
                <ul class="experience-points">${responsibilities}</ul>
            </article>`;
        }).join('');
    } catch (error) {
        console.error('Error loading experience:', error);
    }
}

// Load projects (STANDARDIZED - was part of loadWork)
async function loadProjects() {
    try {
        const data = await fetch('data/projects.json').then(r => r.json());
        const workTitle = document.getElementById('projects-title');
        if (workTitle) workTitle.textContent = data.sectionTitle || 'Featured Projects';

        const subtitle = document.getElementById('projects-subtitle');
        if (subtitle) subtitle.textContent = data.subtitle || '';

        const workGrid = document.getElementById('projects-grid');
        const projects = data.projects || data.items || [];

        if (workGrid && projects.length > 0) {
            workGrid.innerHTML = projects.map(project => {
                // Support both "technologies" and "tags"
                const tags = project.technologies || project.tags || [];

                const links = project.links || {};
                const linkItems = [
                    links.github || project.github ? { url: links.github || project.github, text: 'GitHub', icon: 'fab fa-github' } : null,
                    links.live || project.demo ? { url: links.live || project.demo, text: 'View', icon: 'fas fa-arrow-up-right-from-square' } : null
                ].filter(Boolean);

                return `<article class="work-card">
                    <div class="work-image" style="background-image: url('${project.image}')">
                        <div class="work-icon"><i class="${project.icon}"></i></div>
                    </div>
                    <div class="work-content">
                        <p class="work-category">${project.category}</p>
                        <h3 class="work-title">${project.title}</h3>
                        <p class="work-description">${project.description}</p>
                        <div class="work-tags">
                            ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                        ${linkItems.length ? `<div class="work-links">${linkItems.map(link => `<a href="${link.url}" target="_blank" rel="noopener noreferrer"><i class="${link.icon}"></i>${link.text}</a>`).join('')}</div>` : ''}
                    </div>
                </article>`;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

async function loadSkills() {
    try {
        const data = await fetch('data/skills.json').then(r => r.json());
        document.getElementById('skills-title').textContent = data.sectionTitle;
        document.getElementById('skills-grid').innerHTML = data.categories.map(cat =>
            `<div class="skill-category">
                <div class="skill-category-header">
                    <i class="${cat.icon}"></i>
                    <h3 class="skill-category-name">${cat.name || cat.category}</h3>
                </div>
                <div class="skill-list">
                    ${cat.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>`
        ).join('');
    } catch (error) {
        console.error('Error loading skills:', error);
    }
}

// NEW: Load education (STANDARDIZED)
async function loadEducation() {
    try {
        const data = await fetch('data/education.json').then(r => r.json());
        const title = document.getElementById('education-title');
        const grid = document.getElementById('education-grid');
        if (!title || !grid) return;

        title.textContent = data.sectionTitle || 'Education';
        grid.innerHTML = (data.education || []).map(item =>
            `<article class="education-card">
                <p class="education-period">${item.period}</p>
                <h3>${item.degree}</h3>
                <p>${item.institution || item.school}</p>
                ${item.details ? `<span>${item.details}</span>` : ''}
            </article>`
        ).join('');
    } catch (error) {
        console.error('Error loading education:', error);
    }
}

async function loadContact() {
    try {
        const data = await fetch('data/contact.json').then(r => r.json());
        document.getElementById('contact-title').textContent = data.sectionTitle;
        document.getElementById('contact-subtitle').textContent = data.subtitle;
        const phone = data.phone ? `<div class="contact-item"><i class="fas fa-phone"></i> <a href="tel:${data.phone.replace(/\s/g, '')}">${data.phone}</a></div>` : '';
        document.getElementById('contact-info').innerHTML = `
            <div class="contact-item"><i class="fas fa-envelope"></i> <a href="mailto:${data.email}">${data.email}</a></div>
            ${phone}
            <div class="contact-item"><i class="fas fa-map-marker-alt"></i> ${data.location}</div>
            <div class="contact-item"><i class="fas fa-clock"></i> ${data.availability}</div>
        `;
        document.getElementById('contact-social').innerHTML = data.socialLinks.map(link =>
            `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="${link.platform}"><i class="${link.icon}"></i></a>`
        ).join('');
    } catch (error) {
        console.error('Error loading contact:', error);
    }
}

async function loadFooter() {
    try {
        const data = await fetch('data/footer.json').then(r => r.json());
        document.getElementById('footer-text').textContent = data.text;
        document.getElementById('footer-copyright').textContent = data.copyright;
        document.getElementById('footer-links').innerHTML = data.links.map(link =>
            `<a href="${link.href}"${link.href?.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${link.text}</a>`
        ).join('');
    } catch (error) {
        console.error('Error loading footer:', error);
    }
}

function initializeNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }
}

function initializeScrollEffects() {
    const sections = document.querySelectorAll('section');
    const observerOptions = { threshold: 0.1, rootMargin: '-50px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, observerOptions);
    sections.forEach(section => observer.observe(section));
}

function initializeBackToTop() {
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('visible', window.scrollY > 300);
        });
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}
