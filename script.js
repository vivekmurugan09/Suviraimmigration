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
            calculatePoints();
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
    calculatePoints();

    const activeTheme = localStorage.getItem('suvira_site_theme') || 't6';
    switchSiteTheme(activeTheme);
    const select = document.getElementById('themeSelectDropdown');
    if (select) select.value = activeTheme;
});

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




