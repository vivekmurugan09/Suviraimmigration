// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const closeMenuBtn = document.querySelector('.close-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav a');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function () {
            mobileMenu.classList.add('active');
            mobileMenuOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        closeMenuBtn.addEventListener('click', closeMobileMenu);
        mobileMenuOverlay.addEventListener('click', closeMobileMenu);

        mobileNavLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
    }

    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // FAQ Functionality
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', function () {
            const faqItem = this.parentElement;
            const answer = this.nextElementSibling;
            const icon = this.querySelector('i');

            // Close other open FAQs
            document.querySelectorAll('.faq-item.active').forEach(item => {
                if (item !== faqItem) {
                    item.classList.remove('active');
                    item.querySelector('.faq-answer').style.maxHeight = '0';
                    item.querySelector('.faq-answer').style.opacity = '0';
                    item.querySelector('.faq-answer').style.padding = '0 25px';
                }
            });

            // Toggle current FAQ
            faqItem.classList.toggle('active');

            if (faqItem.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
                answer.style.opacity = '1';
                answer.style.padding = '0 25px 25px';
            } else {
                answer.style.maxHeight = '0';
                answer.style.opacity = '0';
                answer.style.padding = '0 25px';
            }
        });
    });

    // Contact Form Character Counter
    const messageTextarea = document.getElementById('message');
    const charCount = document.getElementById('charCount');

    if (messageTextarea && charCount) {
        messageTextarea.addEventListener('input', function () {
            charCount.textContent = this.value.length;

            if (this.value.length > 1000) {
                this.value = this.value.substring(0, 1000);
                charCount.textContent = 1000;
            }
        });

        // Initialize character count
        charCount.textContent = messageTextarea.value.length;
    }

    // File Upload Preview
    const fileInput = document.getElementById('documents');
    const fileList = document.getElementById('fileList');
    const uploadArea = document.getElementById('uploadArea');

    if (fileInput && fileList && uploadArea) {
        uploadArea.addEventListener('click', function () {
            fileInput.click();
        });

        fileInput.addEventListener('change', function () {
            fileList.innerHTML = '';

            if (this.files.length > 0) {
                Array.from(this.files).forEach(file => {
                    const fileItem = document.createElement('div');
                    fileItem.className = 'file-item';
                    fileItem.innerHTML = `
                        <i class="fas fa-file"></i>
                        <span>${file.name}</span>
                        <small>(${(file.size / 1024 / 1024).toFixed(2)} MB)</small>
                    `;
                    fileList.appendChild(fileItem);
                });
            }
        });

        // Drag and drop functionality
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, unhighlight, false);
        });

        function highlight() {
            uploadArea.style.borderColor = 'var(--primary)';
            uploadArea.style.background = 'rgba(10, 36, 114, 0.05)';
        }

        function unhighlight() {
            uploadArea.style.borderColor = 'var(--light-gray)';
            uploadArea.style.background = 'var(--light)';
        }

        uploadArea.addEventListener('drop', handleDrop, false);

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            fileInput.files = files;

            // Trigger change event
            const event = new Event('change');
            fileInput.dispatchEvent(event);
        }
    }

    // Contact Form Submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            const submitBtn = this.querySelector('.submit-btn');
            const loader = this.querySelector('.loader');

            // Show loading state
            submitBtn.disabled = true;
            loader.style.display = 'block';

            // Validate form
            const privacyCheckbox = document.getElementById('privacy');
            if (!privacyCheckbox.checked) {
                e.preventDefault();
                alert('Please agree to the Privacy Policy');
                submitBtn.disabled = false;
                loader.style.display = 'none';
                return false;
            }

            // Validate file size (max 5MB each)
            const files = fileInput.files;
            if (files.length > 0) {
                for (let file of files) {
                    if (file.size > 5 * 1024 * 1024) { // 5MB
                        e.preventDefault();
                        alert(`File "${file.name}" exceeds 5MB limit. Please upload smaller files.`);
                        submitBtn.disabled = false;
                        loader.style.display = 'none';
                        return false;
                    }
                }
            }
        });
    }


    // --- COUNTRIES SLIDER (SWIPER) ---
    if (typeof Swiper !== 'undefined') {
        new Swiper('.mySwiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            autoplay: {
                delay: 3500,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                640: {
                    slidesPerView: 1,
                },
                768: {
                    slidesPerView: 2,
                    spaceBetween: 30,
                },
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                },
            },
        });
    }

    // Scroll to Top Button
    const scrollTopBtn = document.querySelector('.scroll-top');

    window.addEventListener('scroll', function () {
        // Show/hide scroll to top button
        if (scrollTopBtn) {
            if (window.pageYOffset > 300) {
                scrollTopBtn.classList.add('active');
            } else {
                scrollTopBtn.classList.remove('active');
            }
        }

        // Add scrolled class to navbar
        const navbar = document.querySelector('.navbar');
        if (window.pageYOffset > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Scroll to top functionality
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            if (href !== '#') {
                e.preventDefault();

                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });

                    // Update active nav link
                    document.querySelectorAll('.nav-link, .nav-home').forEach(link => {
                        link.classList.remove('active');
                    });
                    this.classList.add('active');
                }
            }
        });
    });


    // Update current year in footer
    const currentYearSpan = document.querySelector('.current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Form Reset Handler
    const resetBtn = document.querySelector('button[type="reset"]');
    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            // Reset file list
            if (fileList) {
                fileList.innerHTML = '';
            }

            // Reset character count
            if (charCount) {
                charCount.textContent = '0';
            }
        });
    }

    // --- INTERACTIVE ELIGIBILITY CALCULATOR ---
    const calcTabs = document.querySelectorAll('.calc-tab');
    calcTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            calcTabs.forEach(t => {
                t.classList.remove('active');
                t.style.background = '#E2E8F0';
                t.style.color = '#475569';
            });
            this.classList.add('active');
            this.style.background = 'var(--primary)';
            this.style.color = 'white';

            const target = this.getAttribute('data-tab');
            const targetInput = document.getElementById('calcTargetCountry');
            if (targetInput) {
                targetInput.value = target;
            }
            if (typeof calculatePoints === 'function') calculatePoints();
        });
    });

    // --- HERO MULTI-IMAGE GALLERY INTERACTIVE SHOWCASE ---
    setInterval(() => {
        const thumbs = document.querySelectorAll('.hero-thumb-card');
        if (thumbs.length > 0) {
            currentHeroIndex = (currentHeroIndex + 1) % heroGalleryData.length;
            switchHeroGallery(currentHeroIndex);
        }
    }, 3800);

    // Initial calculation on load
    if (typeof calculatePoints === 'function') calculatePoints();

    const activeTheme = localStorage.getItem('suvira_site_theme') || 't6';
    // Trigger stat counters rolling animation
    animateStatCounters();
});

// --- ANIMATED ROLLING STAT COUNTERS ---
function animateStatCounters() {
    const counters = document.querySelectorAll('.stat-counter');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.getAttribute('data-target')) || 0;
                const suffix = el.getAttribute('data-suffix') || '';
                const format = el.getAttribute('data-format') || '';
                const duration = 1800; // 1.8 seconds smooth roll
                const stepTime = 20;
                const steps = duration / stepTime;
                const increment = target / steps;
                let current = 0;

                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    let formattedVal = Math.floor(current);
                    if (format === 'comma') {
                        formattedVal = formattedVal.toLocaleString();
                    }
                    el.innerText = formattedVal + suffix;
                }, stepTime);

                obs.unobserve(el);
            }
        });
    }, { threshold: 0.1 });

    counters.forEach(counter => observer.observe(counter));
}

function switchSiteTheme(themeVal) {
    document.documentElement.setAttribute('data-theme', themeVal);
    document.body.setAttribute('data-theme', themeVal);
    localStorage.setItem('suvira_site_theme', themeVal);
}

const heroGalleryData = [
    {
        src: 'images/hero-immigration.png',
        title: 'Global Immigration Success',
        sub: 'End-to-End Guidance for Families & Professionals'
    },
    {
        src: 'images/hero-immigration-2.png',
        title: 'International Airport Arrivals',
        sub: 'Seamless Landing & Settlement Assistance'
    },
    {
        src: 'images/hero-immigration-3.png',
        title: 'Tech & Student Pathways',
        sub: 'Qualified Work Permits & University Admissions'
    }
];

let currentHeroIndex = 0;

function switchHeroGallery(index) {
    currentHeroIndex = index;
    const mainImg = document.getElementById('mainHeroImg');
    const title = document.getElementById('mainHeroCaptionTitle');
    const sub = document.getElementById('mainHeroCaptionSub');
    const thumbs = document.querySelectorAll('.hero-thumb-card');

    if (mainImg) {
        mainImg.style.opacity = '0.3';
        setTimeout(() => {
            mainImg.src = heroGalleryData[index].src;
            if (title) title.textContent = heroGalleryData[index].title;
            if (sub) sub.textContent = heroGalleryData[index].sub;
            mainImg.style.opacity = '1';
        }, 150);
    }

    thumbs.forEach((t, i) => {
        if (i === index) {
            t.classList.add('active');
            t.style.border = '2px solid #FF9F1C';
            t.style.boxShadow = '0 0 12px rgba(255, 159, 28, 0.4)';
            t.style.opacity = '1';
        } else {
            t.classList.remove('active');
            t.style.border = '2px solid rgba(255, 255, 255, 0.3)';
            t.style.boxShadow = 'none';
            t.style.opacity = '0.75';
        }
    });
}

// Global functions for calculator
function calculatePoints() {
    const targetCountry = document.getElementById('calcTargetCountry') ? document.getElementById('calcTargetCountry').value : 'canada-crs';
    const age = document.getElementById('calcAge') ? document.getElementById('calcAge').value : '20-29';
    const edu = document.getElementById('calcEdu') ? document.getElementById('calcEdu').value : 'master';
    const exp = document.getElementById('calcExp') ? document.getElementById('calcExp').value : '3+';
    const ielts = document.getElementById('calcIelts') ? document.getElementById('calcIelts').value : 'clb9';

    const scoreDisplay = document.getElementById('scoreDisplay');
    const scoreUnit = document.getElementById('scoreUnit');
    const scoreAdvice = document.getElementById('scoreAdvice');

    if (!scoreDisplay) return;

    let score = 0;

    if (targetCountry === 'canada-crs') {
        // Canada Express Entry CRS Approximation
        score += (age === '20-29' ? 110 : age === '30-34' ? 95 : age === '35-39' ? 75 : 50);
        score += (edu === 'phd' ? 150 : edu === 'master' ? 135 : edu === 'bachelor' ? 120 : 110);
        score += (exp === '5+' ? 80 : exp === '3+' ? 64 : exp === '1-2' ? 40 : 0);
        score += (ielts === 'clb9' ? 124 : ielts === 'clb8' ? 96 : ielts === 'clb7' ? 68 : 30);

        scoreDisplay.textContent = score;
        scoreUnit.textContent = "CRS Points (67-Pt FSW Eligible)";
        if (score >= 450) {
            scoreAdvice.textContent = "Excellent score! High probability for Express Entry STEM/Category-Based Draws or PNP Nomination.";
        } else if (score >= 400) {
            scoreAdvice.textContent = "Good score! Provincial Nominee Programs (PNP like OINP, AINP) provide an instant +600 points boost.";
        } else {
            scoreAdvice.textContent = "Eligible for FSW 67-point grid! We recommend strategic PNP nomination or IELTS score optimization.";
        }
    } else if (targetCountry === 'australia-pr') {
        // Australia SkillSelect 65 Point Pass Mark System
        score += (age === '20-29' ? 30 : age === '30-34' ? 25 : age === '35-39' ? 15 : 0);
        score += (edu === 'phd' ? 20 : edu === 'master' || edu === 'bachelor' ? 15 : 10);
        score += (exp === '5+' ? 15 : exp === '3+' ? 10 : exp === '1-2' ? 5 : 0);
        score += (ielts === 'clb9' ? 20 : ielts === 'clb8' ? 10 : 0);

        scoreDisplay.textContent = score;
        scoreUnit.textContent = "Points (Pass Mark: 65 Points)";
        if (score >= 75) {
            scoreAdvice.textContent = "Competitive score for Subclass 189 Skilled Independent and Subclass 190 State Nominated Visas.";
        } else if (score >= 65) {
            scoreAdvice.textContent = "Meets the official Australian 65-point EOI lodging threshold. State Nomination (Subclass 190/491) advised.";
        } else {
            scoreAdvice.textContent = "Score below 65 pts. Profile boosting via Partner points, NAATI CCL, or Regional State sponsorship recommended.";
        }
    } else if (targetCountry === 'germany-card') {
        // Germany Opportunity Card (Chancenkarte 2026) 6-Point System
        score += (edu === 'master' || edu === 'phd' || edu === 'bachelor' ? 4 : 2);
        score += (exp === '5+' ? 3 : exp === '3+' ? 2 : 1);
        score += (age === '20-29' ? 2 : age === '30-34' ? 1 : 0);
        score += (ielts === 'clb9' || ielts === 'clb8' ? 1 : 0);

        scoreDisplay.textContent = Math.min(score, 6);
        scoreUnit.textContent = "Points (Pass Mark: 6 Points)";
        scoreAdvice.textContent = score >= 6
            ? "Qualified! You meet the 6-point requirement for the 1-Year Opportunity Card with part-time work rights."
            : "Recognized degree qualification gives direct Route 1 qualification without points!";
    }
}

function prefillContactForm() {
    const targetCountry = document.getElementById('calcTargetCountry') ? document.getElementById('calcTargetCountry').value : '';
    const countrySelect = document.getElementById('country');
    const serviceSelect = document.getElementById('serviceType');

    if (countrySelect) {
        if (targetCountry.includes('canada')) countrySelect.value = 'canada';
        else if (targetCountry.includes('australia')) countrySelect.value = 'australia';
        else if (targetCountry.includes('germany')) countrySelect.value = 'germany';
    }

    if (serviceSelect) {
        serviceSelect.value = 'pr';
    }
}

// Animated Running Numbers Counter (Instant-Start & Scroll Re-trigger)
function initRunningCounters() {
    const statCounters = document.querySelectorAll('.stat-counter');
    if (!statCounters || statCounters.length === 0) return;

    function runCounterAnimation(counter) {
        const target = parseInt(counter.getAttribute('data-target')) || 0;
        const suffix = counter.getAttribute('data-suffix') || '';
        const isComma = counter.getAttribute('data-format') === 'comma';
        const duration = 1800;
        let startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeOutVal = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(easeOutVal * target);

            if (isComma) {
                counter.innerText = currentVal.toLocaleString('en-US') + suffix;
            } else {
                counter.innerText = currentVal + suffix;
            }

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                if (isComma) {
                    counter.innerText = target.toLocaleString('en-US') + suffix;
                } else {
                    counter.innerText = target + suffix;
                }
            }
        }

        requestAnimationFrame(step);
    }

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    runCounterAnimation(entry.target);
                } else {
                    const suffix = entry.target.getAttribute('data-suffix') || '';
                    entry.target.innerText = '0' + suffix;
                }
            });
        }, { threshold: 0.1 });

        statCounters.forEach(counter => observer.observe(counter));
    } else {
        statCounters.forEach(counter => runCounterAnimation(counter));
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRunningCounters);
} else {
    initRunningCounters();
}

// Homepage Direct Contact Form Handler
function handleHomeTouchSubmit(e) {
    e.preventDefault();
    const name    = document.getElementById('htName').value;
    const phone   = document.getElementById('htPhone').value;
    const email   = document.getElementById('htEmail').value;
    const service = document.getElementById('htService').value;
    const msg     = document.getElementById('htMsg').value;

    try {
        const formData = new FormData();
        formData.append("Full Name", name);
        formData.append("Phone / WhatsApp", phone);
        formData.append("Email Address", email);
        formData.append("Service Required", service);
        formData.append("Message", msg);
        formData.append("_subject", `New Inquiry from Homepage: ${name} (${service})`);
        formData.append("_captcha", "false");

        fetch("https://formsubmit.co/ajax/reachus@suviraimmigration.com", {
            method: "POST",
            headers: { 'Accept': 'application/json' },
            body: formData
        });
    } catch (err) {
        console.log(err);
    }

    const box = document.getElementById('htSuccess');
    if (box) {
        box.style.display = 'flex';
        setTimeout(() => {
            document.getElementById('homeTouchForm').reset();
            box.style.display = 'none';
        }, 3000);
    }
}

// Homepage Instant Score Preview Tab Switcher
function switchHomeScoreTab(e, country) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    const label = document.getElementById('homeScoreLabel');
    const val   = document.getElementById('homeScoreVal');
    const unit  = document.getElementById('homeScoreUnit');
    const desc  = document.getElementById('homeScoreDesc');

    const btnCa = document.getElementById('tabCanada');
    const btnAu = document.getElementById('tabAustralia');
    const btnDe = document.getElementById('tabGermany');

    // Reset tab button background and colors
    [btnCa, btnAu, btnDe].forEach(btn => {
        if (btn) {
            btn.style.background = '#F1F5F9';
            btn.style.color = '#475569';
        }
    });

    if (country === 'canada') {
        if (btnCa) { btnCa.style.background = '#0724A8'; btnCa.style.color = 'white'; }
        if (label) label.innerText = 'ESTIMATED CANADA CRS SCORE';
        if (val)   val.innerText   = '433';
        if (unit)  unit.innerText  = 'Points';
        if (desc)  desc.innerText  = '✅ 67-Pt FSW Eligible — Express Entry Ready';
    } else if (country === 'australia') {
        if (btnAu) { btnAu.style.background = '#0724A8'; btnAu.style.color = 'white'; }
        if (label) label.innerText = 'ESTIMATED AUSTRALIA GSM SCORE';
        if (val)   val.innerText   = '75';
        if (unit)  unit.innerText  = 'Points';
        if (desc)  desc.innerText  = '✅ Subclass 189/190 Eligible — EOI Ready';
    } else if (country === 'germany') {
        if (btnDe) { btnDe.style.background = '#0724A8'; btnDe.style.color = 'white'; }
        if (label) label.innerText = 'GERMANY CHANCENKARTE SCORE';
        if (val)   val.innerText   = '6 / 6';
        if (unit)  unit.innerText  = 'Points';
        if (desc)  desc.innerText  = '✅ 100% Eligible — Opportunity Card Ready';
    }
}

// FAQ Accordion Toggle Handler
function toggleFaqAccordion(headerEl) {
    if (!headerEl) return;
    const parentItem = headerEl.parentElement;
    if (!parentItem) return;
    const answerEl = parentItem.querySelector('.faq-answer');
    const iconEl   = headerEl.querySelector('.fa-chevron-down');

    if (answerEl) {
        if (answerEl.style.display === 'none') {
            answerEl.style.display = 'block';
            if (iconEl) iconEl.style.transform = 'rotate(180deg)';
        } else {
            answerEl.style.display = 'none';
            if (iconEl) iconEl.style.transform = 'rotate(0deg)';
        }
    }
}






                        function switchHomeScore(country, evt) {
                            if (evt) {
                                evt.preventDefault();
                                evt.stopPropagation();
                            }
                            const label = document.getElementById('homeScoreLabel');
                            const val = document.getElementById('homeScoreVal');
                            const unit = document.getElementById('homeScoreUnit');
                            const badge = document.getElementById('homeScoreBadge');
                            const link = document.getElementById('homeCalcLink');

                            const tabCa = document.getElementById('tabCanada');
                            const tabAu = document.getElementById('tabAustralia');
                            const tabDe = document.getElementById('tabGermany');

                            [tabCa, tabAu, tabDe].forEach(t => {
                                if (t) {
                                    t.style.background = '#F1F5F9';
                                    t.style.color = '#475569';
                                    t.style.fontWeight = '600';
                                }
                            });

                            if (country === 'australia') {
                                if (tabAu) { tabAu.style.background = '#0724A8'; tabAu.style.color = 'white'; tabAu.style.fontWeight = '700'; }
                                if (label) label.innerText = 'ESTIMATED GSM POINTS';
                                if (val) val.innerText = '75';
                                if (unit) unit.innerText = 'Points';
                                if (badge) badge.innerText = '✅ 65-Pt Skilled Independent (Subclass 189/190) Qualified';
                                if (link) link.href = 'calculator/index.html?country=australia';
                            } else if (country === 'germany') {
                                if (tabDe) { tabDe.style.background = '#0724A8'; tabDe.style.color = 'white'; tabDe.style.fontWeight = '700'; }
                                if (label) label.innerText = 'CHANCENKARTE SCORE';
                                if (val) val.innerText = '6 / 6';
                                if (unit) unit.innerText = 'Pts';
                                if (badge) badge.innerText = '✅ 6/6 Points Maximum — Opportunity Card Eligible';
                                if (link) link.href = 'calculator/index.html?country=germany';
                            } else {
                                if (tabCa) { tabCa.style.background = '#0724A8'; tabCa.style.color = 'white'; tabCa.style.fontWeight = '700'; }
                                if (label) label.innerText = 'ESTIMATED CRS SCORE';
                                if (val) val.innerText = '433';
                                if (unit) unit.innerText = 'Points';
                                if (badge) badge.innerText = '✅ 67-Pt FSW Eligible — Express Entry Ready';
                                if (link) link.href = 'calculator/index.html?country=canada';
                            }
                        }
                    


        function handleAboutFormSubmit(e) {
            e.preventDefault();
            const name = document.getElementById('clientName').value;
            const phone = document.getElementById('clientPhone').value;
            const email = document.getElementById('clientEmail').value;
            const country = document.getElementById('clientCountry').value;
            const notes = document.getElementById('clientNotes').value || 'N/A';

            // 1. Direct background submit to reachus@suviraimmigration.com via FormSubmit API
            try {
                const formData = new FormData();
                formData.append("Full Name", name);
                formData.append("Phone / WhatsApp", phone);
                formData.append("Email Address", email);
                formData.append("Target Country", country);
                formData.append("Qualifications & Notes", notes);
                formData.append("_subject", `New Profile Audit Request: ${name} (${country})`);
                formData.append("_captcha", "false");

                fetch("https://formsubmit.co/ajax/reachus@suviraimmigration.com", {
                    method: "POST",
                    headers: { 'Accept': 'application/json' },
                    body: formData
                });
            } catch (err) {
                console.log(err);
            }

            alert(`Thank you, ${name}! Your details have been sent to reachus@suviraimmigration.com. Our senior Chennai team will contact you within 24 hours.`);
            document.getElementById('aboutAuditForm').reset();
        }
    


        window.activeTab = 'canada';

        window.switchCalcTab = function(tab) {
            window.activeTab = tab;
            const btnCanada = document.getElementById('tabBtnCanada');
            const btnAustralia = document.getElementById('tabBtnAustralia');
            const btnGermany = document.getElementById('tabBtnGermany');
            
            const panelCanada = document.getElementById('calcPanelCanada');
            const panelAustralia = document.getElementById('calcPanelAustralia');
            const panelGermany = document.getElementById('calcPanelGermany');

            if (btnCanada) { btnCanada.style.background = '#F8F7F4'; btnCanada.style.color = '#111111'; btnCanada.style.boxShadow = 'none'; btnCanada.style.border = '1px solid #E2E0D9'; }
            if (btnAustralia) { btnAustralia.style.background = '#F8F7F4'; btnAustralia.style.color = '#111111'; btnAustralia.style.boxShadow = 'none'; btnAustralia.style.border = '1px solid #E2E0D9'; }
            if (btnGermany) { btnGermany.style.background = '#F8F7F4'; btnGermany.style.color = '#111111'; btnGermany.style.boxShadow = 'none'; btnGermany.style.border = '1px solid #E2E0D9'; }

            if (panelCanada) panelCanada.style.display = 'none';
            if (panelAustralia) panelAustralia.style.display = 'none';
            if (panelGermany) panelGermany.style.display = 'none';

            if (tab === 'canada') {
                if (btnCanada) { btnCanada.style.background = '#1B4FBB'; btnCanada.style.color = 'white'; btnCanada.style.boxShadow = '0 4px 14px rgba(27,79,187,0.25)'; btnCanada.style.border = 'none'; }
                if (panelCanada) panelCanada.style.display = 'block';
            } else if (tab === 'australia') {
                if (btnAustralia) { btnAustralia.style.background = '#1B4FBB'; btnAustralia.style.color = 'white'; btnAustralia.style.boxShadow = '0 4px 14px rgba(27,79,187,0.25)'; btnAustralia.style.border = 'none'; }
                if (panelAustralia) panelAustralia.style.display = 'block';
            } else if (tab === 'germany') {
                if (btnGermany) { btnGermany.style.background = '#1B4FBB'; btnGermany.style.color = 'white'; btnGermany.style.boxShadow = '0 4px 14px rgba(27,79,187,0.25)'; btnGermany.style.border = 'none'; }
                if (panelGermany) panelGermany.style.display = 'block';
            }
            window.calculateLiveScore();
        };

        window.calculateLiveScore = function() {
            const numEl = document.getElementById('liveScoreNum');
            const maxEl = document.getElementById('liveScoreMax');
            const verdictEl = document.getElementById('liveScoreVerdict');
            const descEl = document.getElementById('liveScoreDesc');
            if (!numEl || !maxEl || !verdictEl || !descEl) return;

            if (window.activeTab === 'canada') {
                const age = parseInt(document.getElementById('cAge')?.value) || 110;
                const edu = parseInt(document.getElementById('cEdu')?.value) || 135;
                const lang = parseInt(document.getElementById('cLang')?.value) || 124;
                const exp = parseInt(document.getElementById('cExp')?.value) || 50;
                const total = age + edu + lang + exp;

                numEl.innerText = total;
                maxEl.innerText = ' / 1200 Pts';
                if (total >= 460) {
                    verdictEl.innerHTML = '🟢 High Chance of PR Direct Invitation';
                    verdictEl.style.background = 'rgba(37, 211, 102, 0.2)'; verdictEl.style.color = '#25D366'; verdictEl.style.border = '1px solid #25D366';
                    descEl.innerText = 'Your score exceeds cutoff averages. Direct Express Entry ITA is highly achievable.';
                } else {
                    verdictEl.innerHTML = '🔵 Eligible for PNP Nomination (+600 Pts)';
                    verdictEl.style.background = 'rgba(59, 130, 246, 0.2)'; verdictEl.style.color = '#60A5FA'; verdictEl.style.border = '1px solid #60A5FA';
                    descEl.innerText = 'Suvira can route your profile through OINP or AAIP stream to add 600 points to your score.';
                }
            } else if (window.activeTab === 'australia') {
                const age = parseInt(document.getElementById('aAge')?.value) || 30;
                const edu = parseInt(document.getElementById('aEdu')?.value) || 15;
                const lang = parseInt(document.getElementById('aLang')?.value) || 20;
                const exp = parseInt(document.getElementById('aExp')?.value) || 15;
                const total = age + edu + lang + exp;

                numEl.innerText = total;
                maxEl.innerText = ' / 100 Pts';
                if (total >= 65) {
                    verdictEl.innerHTML = '🟢 Meets 65-Point Skill Threshold';
                    verdictEl.style.background = 'rgba(37, 211, 102, 0.2)'; verdictEl.style.color = '#25D366'; verdictEl.style.border = '1px solid #25D366';
                    descEl.innerText = 'You meet Australia Subclass 189/190/491 EOI invitation requirements.';
                } else {
                    verdictEl.innerHTML = '🟡 Needs State Nomination (+5 to +15 Pts)';
                    verdictEl.style.background = 'rgba(245, 158, 11, 0.2)'; verdictEl.style.color = '#FBBF24'; verdictEl.style.border = '1px solid #FBBF24';
                    descEl.innerText = 'State sponsorship or partner points will bring you above the 65-point benchmark.';
                }
            } else if (window.activeTab === 'germany') {
                const qual = parseInt(document.getElementById('gQual')?.value) || 4;
                const exp = parseInt(document.getElementById('gExp')?.value) || 3;
                const lang = parseInt(document.getElementById('gLang')?.value) || 2;
                const age = parseInt(document.getElementById('gAge')?.value) || 1;
                const total = qual + exp + lang + age;

                numEl.innerText = total;
                maxEl.innerText = ' / 6 Points';
                if (total >= 6) {
                    verdictEl.innerHTML = '🟢 6/6 Maximum Chancenkarte Score';
                    verdictEl.style.background = 'rgba(37, 211, 102, 0.2)'; verdictEl.style.color = '#25D366'; verdictEl.style.border = '1px solid #25D366';
                    descEl.innerText = 'Full eligibility for Germany Opportunity Card 2026 job seeker visa.';
                } else {
                    verdictEl.innerHTML = '🔵 Qualified for Opportunity Visa';
                    verdictEl.style.background = 'rgba(59, 130, 246, 0.2)'; verdictEl.style.color = '#60A5FA'; verdictEl.style.border = '1px solid #60A5FA';
                    descEl.innerText = 'You have sufficient points for embassy filing and blocked account verification.';
                }
            }
        };

        document.addEventListener('DOMContentLoaded', function() {
            const btnCa = document.getElementById('tabBtnCanada');
            const btnAu = document.getElementById('tabBtnAustralia');
            const btnDe = document.getElementById('tabBtnGermany');
            if (btnCa) btnCa.addEventListener('click', function() { window.switchCalcTab('canada'); });
            if (btnAu) btnAu.addEventListener('click', function() { window.switchCalcTab('australia'); });
            if (btnDe) btnDe.addEventListener('click', function() { window.switchCalcTab('germany'); });
            window.calculateLiveScore();
        });
    


        function handleEligibilitySubmit(e) {
            e.preventDefault();
            const n = document.getElementById('eName').value;
            const d = document.getElementById('eDob').value;
            const p = document.getElementById('ePhone').value;
            const em = document.getElementById('eEmail').value;
            const ed = document.getElementById('eEdu').value;
            const ie = document.getElementById('eIelts').value;
            const ex = document.getElementById('eExp').value;
            const oc = document.getElementById('eOcc').value || 'N/A';
            const ma = document.getElementById('eMarital').value;
            const co = document.getElementById('eCountry').value;
            const vi = document.getElementById('eVisa').value;
            const no = document.getElementById('eNotes').value || 'None';

            // 1. Direct background submit to reachus@suviraimmigration.com via FormSubmit API
            try {
                fetch("https://formsubmit.co/ajax/reachus@suviraimmigration.com", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        name: n,
                        dob: d,
                        phone: p,
                        email: em,
                        education: ed,
                        language_test: ie,
                        experience: ex,
                        occupation: oc,
                        marital_status: ma,
                        target_country: co,
                        visa_category: vi,
                        notes: no,
                        _subject: `New Eligibility Assessment: ${n} → ${co}`,
                        _captcha: "false"
                    })
                });
            } catch (err) {
                console.log(err);
            }

            // 2. Mailto fallback
            const subject = encodeURIComponent(`Eligibility Assessment: ${n} → ${co}`);
            const body = encodeURIComponent(
                `SUVIRA IMMIGRATION — PR & VISA ELIGIBILITY SUBMISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERSONAL INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Full Name       : ${n}
Date of Birth   : ${d}
Phone/WhatsApp  : ${p}
Email           : ${em}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EDUCATION & LANGUAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Highest Education : ${ed}
Language Test     : ${ie}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORK EXPERIENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Experience      : ${ex}
Occupation      : ${oc}
Marital Status  : ${ma}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TARGET DESTINATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Country         : ${co}
Visa Category   : ${vi}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ADDITIONAL NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${no}

            try {
                const formData = new FormData();
                formData.append("Full Name", name);
                formData.append("Phone / WhatsApp", phone);
                formData.append("Email Address", email);
                formData.append("Age", age);
                formData.append("Education Level", edu);
                formData.append("English Proficiency", eng);
                formData.append("Work Experience", ex);
                formData.append("Target Country", co);
                formData.append("Visa Category", vi);
                formData.append("Notes", no);
                formData.append("_subject", `New Eligibility Calculator Submission: ${name} (${co})`);
                formData.append("_captcha", "false");

                fetch("https://formsubmit.co/ajax/reachus@suviraimmigration.com", {
                    method: "POST",
                    headers: { 'Accept': 'application/json' },
                    body: formData
                });
            } catch (err) {
                console.log(err);
            }

            const msg = document.getElementById('successMsg');
            msg.style.display = 'flex';
            msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => document.getElementById('eligibilityForm').reset(), 1500);
        }

        // Live Interactive Tab Switcher & Calculator Logic
        window.activeTab = 'canada';

        window.switchCalcTab = function(tab) {
            window.activeTab = tab;
            const btnCanada = document.getElementById('tabBtnCanada');
            const btnAustralia = document.getElementById('tabBtnAustralia');
            const btnGermany = document.getElementById('tabBtnGermany');
            
            const panelCanada = document.getElementById('calcPanelCanada');
            const panelAustralia = document.getElementById('calcPanelAustralia');
            const panelGermany = document.getElementById('calcPanelGermany');

            if (btnCanada) { btnCanada.style.background = '#F8F7F4'; btnCanada.style.color = '#111111'; btnCanada.style.boxShadow = 'none'; btnCanada.style.border = '1px solid #E2E0D9'; }
            if (btnAustralia) { btnAustralia.style.background = '#F8F7F4'; btnAustralia.style.color = '#111111'; btnAustralia.style.boxShadow = 'none'; btnAustralia.style.border = '1px solid #E2E0D9'; }
            if (btnGermany) { btnGermany.style.background = '#F8F7F4'; btnGermany.style.color = '#111111'; btnGermany.style.boxShadow = 'none'; btnGermany.style.border = '1px solid #E2E0D9'; }

            if (panelCanada) panelCanada.style.display = 'none';
            if (panelAustralia) panelAustralia.style.display = 'none';
            if (panelGermany) panelGermany.style.display = 'none';

            if (tab === 'canada') {
                if (btnCanada) { btnCanada.style.background = '#1B4FBB'; btnCanada.style.color = 'white'; btnCanada.style.boxShadow = '0 4px 14px rgba(27,79,187,0.25)'; btnCanada.style.border = 'none'; }
                if (panelCanada) panelCanada.style.display = 'block';
            } else if (tab === 'australia') {
                if (btnAustralia) { btnAustralia.style.background = '#1B4FBB'; btnAustralia.style.color = 'white'; btnAustralia.style.boxShadow = '0 4px 14px rgba(27,79,187,0.25)'; btnAustralia.style.border = 'none'; }
                if (panelAustralia) panelAustralia.style.display = 'block';
            } else if (tab === 'germany') {
                if (btnGermany) { btnGermany.style.background = '#1B4FBB'; btnGermany.style.color = 'white'; btnGermany.style.boxShadow = '0 4px 14px rgba(27,79,187,0.25)'; btnGermany.style.border = 'none'; }
                if (panelGermany) panelGermany.style.display = 'block';
            }
            window.calculateLiveScore();
        };

        window.calculateLiveScore = function() {
            const numEl = document.getElementById('liveScoreNum');
            const maxEl = document.getElementById('liveScoreMax');
            const verdictEl = document.getElementById('liveScoreVerdict');
            const descEl = document.getElementById('liveScoreDesc');
            if (!numEl || !maxEl || !verdictEl || !descEl) return;

            if (window.activeTab === 'canada') {
                const age = parseInt(document.getElementById('cAge')?.value) || 110;
                const edu = parseInt(document.getElementById('cEdu')?.value) || 135;
                const lang = parseInt(document.getElementById('cLang')?.value) || 124;
                const exp = parseInt(document.getElementById('cExp')?.value) || 50;
                const total = age + edu + lang + exp;

                numEl.innerText = total;
                maxEl.innerText = ' / 1200 Pts';
                if (total >= 460) {
                    verdictEl.innerHTML = '🟢 High Chance of PR Direct Invitation';
                    verdictEl.style.background = 'rgba(37, 211, 102, 0.2)'; verdictEl.style.color = '#25D366'; verdictEl.style.border = '1px solid #25D366';
                    descEl.innerText = 'Your score exceeds cutoff averages. Direct Express Entry ITA is highly achievable.';
                } else {
                    verdictEl.innerHTML = '🔵 Eligible for PNP Nomination (+600 Pts)';
                    verdictEl.style.background = 'rgba(59, 130, 246, 0.2)'; verdictEl.style.color = '#60A5FA'; verdictEl.style.border = '1px solid #60A5FA';
                    descEl.innerText = 'Suvira can route your profile through OINP or AAIP stream to add 600 points to your score.';
                }
            } else if (window.activeTab === 'australia') {
                const age = parseInt(document.getElementById('aAge')?.value) || 30;
                const edu = parseInt(document.getElementById('aEdu')?.value) || 15;
                const lang = parseInt(document.getElementById('aLang')?.value) || 20;
                const exp = parseInt(document.getElementById('aExp')?.value) || 15;
                const total = age + edu + lang + exp;

                numEl.innerText = total;
                maxEl.innerText = ' / 100 Pts';
                if (total >= 65) {
                    verdictEl.innerHTML = '🟢 Meets 65-Point Skill Threshold';
                    verdictEl.style.background = 'rgba(37, 211, 102, 0.2)'; verdictEl.style.color = '#25D366'; verdictEl.style.border = '1px solid #25D366';
                    descEl.innerText = 'You meet Australia Subclass 189/190/491 EOI invitation requirements.';
                } else {
                    verdictEl.innerHTML = '🟡 Needs State Nomination (+5 to +15 Pts)';
                    verdictEl.style.background = 'rgba(245, 158, 11, 0.2)'; verdictEl.style.color = '#FBBF24'; verdictEl.style.border = '1px solid #FBBF24';
                    descEl.innerText = 'State sponsorship or partner points will bring you above the 65-point benchmark.';
                }
            } else if (window.activeTab === 'germany') {
                const qual = parseInt(document.getElementById('gQual')?.value) || 4;
                const exp = parseInt(document.getElementById('gExp')?.value) || 3;
                const lang = parseInt(document.getElementById('gLang')?.value) || 2;
                const age = parseInt(document.getElementById('gAge')?.value) || 1;
                const total = qual + exp + lang + age;

                numEl.innerText = total;
                maxEl.innerText = ' / 6 Points';
                if (total >= 6) {
                    verdictEl.innerHTML = '🟢 6/6 Maximum Chancenkarte Score';
                    verdictEl.style.background = 'rgba(37, 211, 102, 0.2)'; verdictEl.style.color = '#25D366'; verdictEl.style.border = '1px solid #25D366';
                    descEl.innerText = 'Full eligibility for Germany Opportunity Card 2026 job seeker visa.';
                } else {
                    verdictEl.innerHTML = '🔵 Qualified for Opportunity Visa';
                    verdictEl.style.background = 'rgba(59, 130, 246, 0.2)'; verdictEl.style.color = '#60A5FA'; verdictEl.style.border = '1px solid #60A5FA';
                    descEl.innerText = 'You have sufficient points for embassy filing and blocked account verification.';
                }
            }
        };
    


        // Auto-select dropdown option if redirected from Services page with ?service=...
        window.addEventListener('DOMContentLoaded', () => {
            const params = new URLSearchParams(window.location.search);
            const serviceParam = params.get('service');
            if (serviceParam) {
                const select = document.getElementById('cService');
                const map = {
                    'pr': 'Canada PR / Express Entry',
                    'germany': 'Germany Opportunity Card 2026',
                    'study': 'Overseas Study Visa',
                    'visitor': 'Visitor / Tourist Visa',
                    'family': 'Dependent & Family Reunification',
                    'business': 'Business & Investor Visas',
                    'sop': 'SOP & Resume Writing',
                    'resume': 'SOP & Resume Writing',
                    'pcc': 'PCC & Apostille Attestation'
                };
                const val = map[serviceParam.toLowerCase()];
                if (val) {
                    for (let i = 0; i < select.options.length; i++) {
                        if (select.options[i].text.includes(val) || select.options[i].value.includes(val) || val.includes(select.options[i].value)) {
                            select.selectedIndex = i;
                            break;
                        }
                    }
                }
            }
        });

        function handleContactPageSubmit(e) {
            e.preventDefault();
            const name    = document.getElementById('cName').value;
            const phone   = document.getElementById('cPhone').value;
            const email   = document.getElementById('cEmail').value;
            const service = document.getElementById('cService').value;
            const msg     = document.getElementById('cMsg').value;

            // Direct background submit via FormSubmit API to reachus@suviraimmigration.com (No Gmail redirect!)
            try {
                const formData = new FormData();
                formData.append("Full Name", name);
                formData.append("Phone / WhatsApp", phone);
                formData.append("Email Address", email);
                formData.append("Service / Country", service);
                formData.append("Message", msg);
                formData.append("_subject", `New Inquiry from Contact Page: ${name} (${service})`);
                formData.append("_captcha", "false");

                fetch("https://formsubmit.co/ajax/reachus@suviraimmigration.com", {
                    method: "POST",
                    headers: { 'Accept': 'application/json' },
                    body: formData
                });
            } catch (err) {
                console.log(err);
            }

            // Show on-screen success banner cleanly without page redirect
            const box = document.getElementById('cntSuccessMsg');
            box.style.display = 'flex';
            box.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => document.getElementById('contactPageForm').reset(), 1500);
        }
    


        let currentCategory = 'all';

        function setFilterCategory(cat, btn) {
            currentCategory = cat;
            
            // Highlight active button
            const pills = document.querySelectorAll('.country-filter-pill');
            pills.forEach(p => {
                p.style.background = 'rgba(255,255,255,0.12)';
                p.style.color = 'white';
                p.style.borderColor = 'rgba(255,255,255,0.3)';
                p.classList.remove('active-pill');
            });

            btn.style.background = '#FF9F1C';
            btn.style.color = '#0F172A';
            btn.style.borderColor = '#FF9F1C';
            btn.classList.add('active-pill');

            filterCountries();
        }

        function filterCountries() {
            const query = (document.getElementById('countrySearchInput').value || '').toLowerCase().trim();
            const cards = document.querySelectorAll('.country-card-pro');
            let visibleCount = 0;

            cards.forEach(card => {
                const categories = (card.getAttribute('data-category') || '').toLowerCase();
                const cardText = card.innerText.toLowerCase();

                const matchesCat = (currentCategory === 'all') || categories.includes(currentCategory);
                const matchesSearch = !query || cardText.includes(query) || categories.includes(query);

                if (matchesCat && matchesSearch) {
                    card.style.display = 'flex';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            const noRes = document.getElementById('noResultsMsg');
            if (noRes) {
                noRes.style.display = (visibleCount === 0) ? 'block' : 'none';
            }
        }
    


        function handleTouchSubmit(e) {
            e.preventDefault();
            const name = document.getElementById('tName').value;
            const phone = document.getElementById('tPhone').value;
            const email = document.getElementById('tEmail').value;
            const service = document.getElementById('tService').value;
            const msg = document.getElementById('tMsg').value;

            try {
                const formData = new FormData();
                formData.append("Full Name", name);
                formData.append("Phone / WhatsApp", phone);
                formData.append("Email Address", email);
                formData.append("Service Required", service);
                formData.append("Message", msg);
                formData.append("_subject", `New Inquiry from Process Page: ${name} (${service})`);
                formData.append("_captcha", "false");

                fetch("https://formsubmit.co/ajax/reachus@suviraimmigration.com", {
                    method: "POST",
                    headers: { 'Accept': 'application/json' },
                    body: formData
                });
            } catch (err) {
                console.log(err);
            }

            const box = document.getElementById('touchSuccess');
            if (box) {
                box.style.display = 'flex';
                box.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => document.getElementById('processTouchForm').reset(), 1500);
            }
        }
    


        function filterServices(category, btn) {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const cards = document.querySelectorAll('.service-card-pro');
            cards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        }
    


// Accessibility UI/UX enhancements
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const closeBtn = document.querySelector('.close-menu') || document.querySelector('.mobile-menu-close');
    const mobileMenu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-menu-overlay');

    if (menuBtn && mobileMenu) {
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.setAttribute('aria-controls', 'mobile-menu');
        menuBtn.setAttribute('role', 'button');
        menuBtn.tabIndex = 0;
        
        const toggleMenu = () => {
            const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
            menuBtn.setAttribute('aria-expanded', !isExpanded);
            mobileMenu.classList.toggle('active');
            if(overlay) overlay.classList.toggle('active');
        };

        menuBtn.addEventListener('click', toggleMenu);
        menuBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') toggleMenu();
        });
        
        if (closeBtn) {
            closeBtn.addEventListener('click', toggleMenu);
            closeBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') toggleMenu();
            });
        }
        if (overlay) overlay.addEventListener('click', toggleMenu);
    }
});
