    // Mobile menu toggle functionality
        function toggleMenu() {
            const navLinks = document.getElementById('nav-links');
            const menuIcon = document.getElementById('menu-icon');
            
            navLinks.classList.toggle('active');
            menuIcon.classList.toggle('active');
            
            // Prevent body scrolling when menu is open
            if (navLinks.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        }

        // Close menu when a link is clicked
        document.addEventListener('DOMContentLoaded', function() {
            const navLinks = document.querySelectorAll('.nav-links a');
            const menuIcon = document.getElementById('menu-icon');
            const navLinksContainer = document.getElementById('nav-links');
            
            navLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    // Close the menu
                    navLinksContainer.classList.remove('active');
                    menuIcon.classList.remove('active');
                    document.body.style.overflow = 'auto';
                    
                    // Handle smooth scrolling for anchor links
                    const href = this.getAttribute('href');
                    if (href.startsWith('#')) {
                        e.preventDefault();
                        const targetId = href;
                        const targetElement = document.querySelector(targetId);
                        
                        if (targetElement) {
                            // Close menu first, then scroll
                            setTimeout(() => {
                                targetElement.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'start'
                                });
                            }, 100);
                        }
                    }
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', function(event) {
                const navLinks = document.getElementById('nav-links');
                const menuIcon = document.getElementById('menu-icon');
                
                if (!navLinks.contains(event.target) && !menuIcon.contains(event.target)) {
                    navLinks.classList.remove('active');
                    menuIcon.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
            });

            // Handle window resize
            window.addEventListener('resize', function() {
                const navLinks = document.getElementById('nav-links');
                const menuIcon = document.getElementById('menu-icon');
                
                if (window.innerWidth > 768) {
                    navLinks.classList.remove('active');
                    menuIcon.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
            });
        });
