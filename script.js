// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Functionality
    initMobileMenu();
    
    // FAQ Functionality
    initFAQ();
    
    // Contact Form Functionality
    initContactForm();
    
    // Swiper Initialization
    initSwiper();
    
    // Stats Counter
    initStatsCounter();
    
    // Scroll and Navigation
    initScrollAndNavigation();
    
    // Footer Year Update
    updateFooterYear();
    
    // Fix Country Links
    fixCountryLinks();
    setActiveNavLink();
});

// Mobile Menu Functions
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const closeMenuBtn = document.querySelector('.close-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav a');
    
    if (!mobileMenuBtn || !mobileMenu) return;
    
    const openMobileMenu = () => {
        mobileMenu.classList.add('active');
        if (mobileMenuOverlay) mobileMenuOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    };
    
    const closeMobileMenu = () => {
        mobileMenu.classList.remove('active');
        if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    };
    
    mobileMenuBtn.addEventListener('click', openMobileMenu);
    
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMobileMenu);
    if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', closeMobileMenu);
    
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
}

// FAQ Functions
function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const answer = this.nextElementSibling;
            
            // Close other open FAQs
            document.querySelectorAll('.faq-item.active').forEach(item => {
                if (item !== faqItem) {
                    closeFAQItem(item);
                }
            });
            
            // Toggle current FAQ
            if (faqItem.classList.contains('active')) {
                closeFAQItem(faqItem);
            } else {
                openFAQItem(faqItem, answer);
            }
        });
    });
}

function closeFAQItem(item) {
    item.classList.remove('active');
    const answer = item.querySelector('.faq-answer');
    if (answer) {
        answer.style.maxHeight = '0';
        answer.style.opacity = '0';
        answer.style.padding = '0 25px';
    }
}

function openFAQItem(item, answer) {
    item.classList.add('active');
    answer.style.maxHeight = answer.scrollHeight + 'px';
    answer.style.opacity = '1';
    answer.style.padding = '0 25px 25px';
}

// Contact Form Functions
function initContactForm() {
    const messageTextarea = document.getElementById('message');
    const charCount = document.getElementById('charCount');
    const fileInput = document.getElementById('documents');
    const fileList = document.getElementById('fileList');
    const uploadArea = document.getElementById('uploadArea');
    const contactForm = document.getElementById('contactForm');
    const resetBtn = document.querySelector('button[type="reset"]');
    
    // Character Counter
    if (messageTextarea && charCount) {
        const updateCharCount = () => {
            const length = Math.min(messageTextarea.value.length, 1000);
            messageTextarea.value = messageTextarea.value.substring(0, 1000);
            charCount.textContent = length;
        };
        
        messageTextarea.addEventListener('input', updateCharCount);
        updateCharCount(); // Initialize
    }
    
    // File Upload
    if (fileInput && fileList && uploadArea) {
        uploadArea.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', updateFileList);
        
        // Drag and Drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, highlightUploadArea, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, unhighlightUploadArea, false);
        });
        
        uploadArea.addEventListener('drop', handleDrop, false);
        
        function updateFileList() {
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
        }
    }
    
    // Form Submission
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('.submit-btn');
            const loader = this.querySelector('.loader');
            
            // Show loading state
            if (submitBtn) submitBtn.disabled = true;
            if (loader) loader.style.display = 'block';
            
            // Validate privacy policy
            const privacyCheckbox = document.getElementById('privacy');
            if (privacyCheckbox && !privacyCheckbox.checked) {
                e.preventDefault();
                alert('Please agree to the Privacy Policy');
                resetFormState(submitBtn, loader);
                return false;
            }
            
            // Validate file sizes
            if (fileInput && fileInput.files.length > 0) {
                const maxSize = 5 * 1024 * 1024; // 5MB
                for (let file of fileInput.files) {
                    if (file.size > maxSize) {
                        e.preventDefault();
                        alert(`File "${file.name}" exceeds 5MB limit. Please upload smaller files.`);
                        resetFormState(submitBtn, loader);
                        return false;
                    }
                }
            }
            
            // Allow form submission to proceed
        });
    }
    
    // Form Reset
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            // Reset file list
            if (fileList) fileList.innerHTML = '';
            
            // Reset character count
            if (charCount) charCount.textContent = '0';
        });
    }
    
    // Helper Functions
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlightUploadArea() {
        uploadArea.style.borderColor = 'var(--primary)';
        uploadArea.style.background = 'rgba(10, 36, 114, 0.05)';
    }
    
    function unhighlightUploadArea() {
        uploadArea.style.borderColor = 'var(--light-gray)';
        uploadArea.style.background = 'var(--light)';
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        fileInput.files = files;
        
        // Trigger change event
        const event = new Event('change');
        fileInput.dispatchEvent(event);
    }
    
    function resetFormState(submitBtn, loader) {
        if (submitBtn) submitBtn.disabled = false;
        if (loader) loader.style.display = 'none';
    }
}

// Swiper Initialization
function initSwiper() {
    if (typeof Swiper !== 'undefined' && document.querySelector('.mySwiper')) {
        window.swiperInstance = new Swiper('.mySwiper', {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
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
                    slidesPerView: 2,
                    spaceBetween: 20,
                },
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                },
            },
        });
    }
}

// Stats Counter
function initStatsCounter() {
    const statNumbers = document.querySelectorAll('[data-count]');
    
    if (!statNumbers.length) return;
    
    function animateCounter(element, target) {
        let current = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString();
        }, 20);
    }
    
    function checkScroll() {
        statNumbers.forEach(stat => {
            const position = stat.getBoundingClientRect();
            if (position.top < window.innerHeight && position.bottom >= 0) {
                const target = parseInt(stat.getAttribute('data-count'));
                if (!stat.classList.contains('animated')) {
                    stat.classList.add('animated');
                    animateCounter(stat, target);
                }
            }
        });
    }
    
    // Use Intersection Observer for better performance
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const stat = entry.target;
                    const target = parseInt(stat.getAttribute('data-count'));
                    if (!stat.classList.contains('animated')) {
                        stat.classList.add('animated');
                        animateCounter(stat, target);
                    }
                    observer.unobserve(stat);
                }
            });
        }, {
            threshold: 0.5
        });
        
        statNumbers.forEach(stat => observer.observe(stat));
    } else {
        // Fallback for older browsers
        window.addEventListener('scroll', checkScroll);
        window.addEventListener('load', checkScroll);
    }
}

// Scroll and Navigation
function initScrollAndNavigation() {
    const scrollTopBtn = document.querySelector('.scroll-top');
    const navbar = document.querySelector('.navbar');
    
    // Scroll Event
    function handleScroll() {
        // Scroll to top button
        if (scrollTopBtn) {
            scrollTopBtn.classList.toggle('active', window.pageYOffset > 300);
        }
        
        // Navbar scrolled state
        if (navbar) {
            navbar.classList.toggle('scrolled', window.pageYOffset > 50);
        }
    }
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initialize on load
    
    // Scroll to top functionality
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Smooth scrolling for anchor links (homepage only)
    if (!window.location.pathname.includes('/countries/')) {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
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
                    }
                }
            });
        });
    }
}

// Footer Year
function updateFooterYear() {
    const currentYearSpan = document.querySelector('.current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
}

// Country Links Fix
function fixCountryLinks() {
    const countryFiles = ['australia', 'canada', 'uk', 'usa', 'germany', 'newzealand', 'ireland', 'singapore'];
    
    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        
        if (!href) return;
        
        countryFiles.forEach(country => {
            // Fix links like "canada.html" or "/canada.html"
            if (href === `${country}.html` || href === `/${country}.html`) {
                link.setAttribute('href', `countries/${country}.html`);
            }
        });
        
        // Fix countries page links from homepage
        if (href === 'countries/') {
            link.setAttribute('href', 'countries/index.html');
        }
    });
}

// Set Active Navigation Link
function setActiveNavLink() {
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link, .nav-home');
    
    // Remove all active classes
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Set active class based on current page
    if (currentPage.includes('/countries/')) {
        // On country pages, highlight "Countries" link
        document.querySelectorAll('a[href*="countries/index.html"]').forEach(link => {
            link.classList.add('active');
        });
    } else if (currentPage.includes('index.html') || currentPage.endsWith('/')) {
        // On homepage, highlight "Home" link
        document.querySelectorAll('.nav-home').forEach(link => {
            link.classList.add('active');
        });
    }
}