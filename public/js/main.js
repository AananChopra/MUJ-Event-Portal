/**
 * Main JavaScript File
 * 
 * Handles client-side form validation, dark/light mode toggle,
 * and user interactions
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // DARK/LIGHT MODE TOGGLE
    // ============================================
    
    const themeToggle = document.getElementById('themeToggle');
    const themeLabel = document.getElementById('themeLabel');
    const html = document.documentElement;
    const body = document.body;
    
    // Get saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    body.setAttribute('data-theme', savedTheme);
    
    // Set background colors immediately using cssText for maximum priority
    const bgColor = savedTheme === 'dark' ? '#1a1a1a' : '#ffffff';
    const textColor = savedTheme === 'dark' ? '#f8f9fa' : '#212529';
    html.style.cssText += 'background-color: ' + bgColor + ' !important; color: ' + textColor + ' !important;';
    body.style.cssText += 'background-color: ' + bgColor + ' !important; color: ' + textColor + ' !important;';
    
    // Re-enable transitions after page is fully loaded
    if (document.readyState === 'complete') {
        setTimeout(function() {
            html.classList.add('loaded');
            body.classList.add('loaded');
        }, 100);
    } else {
        window.addEventListener('load', function() {
            setTimeout(function() {
                html.classList.add('loaded');
                body.classList.add('loaded');
            }, 100);
        });
    }
    
    updateThemeToggle(savedTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('change', function() {
            const newTheme = this.checked ? 'dark' : 'light';
            const bgColor = newTheme === 'dark' ? '#1a1a1a' : '#ffffff';
            const textColor = newTheme === 'dark' ? '#f8f9fa' : '#212529';
            
            // Update immediately using cssText for maximum priority
            html.setAttribute('data-theme', newTheme);
            body.setAttribute('data-theme', newTheme);
            html.style.cssText += 'background-color: ' + bgColor + ' !important; color: ' + textColor + ' !important;';
            body.style.cssText += 'background-color: ' + bgColor + ' !important; color: ' + textColor + ' !important;';
            
            localStorage.setItem('theme', newTheme);
            updateThemeToggle(newTheme);
        });
    }
    
    function updateThemeToggle(theme) {
        if (themeToggle) {
            themeToggle.checked = theme === 'dark';
        }
        // Label is now empty, no emoji needed
    }
    
    // ============================================
    // FORM VALIDATION
    // ============================================
    
    // Get the registration form if it exists on the page
    const registrationForm = document.getElementById('registrationForm');
    
    if (registrationForm) {
        // Add event listener for form submission
        registrationForm.addEventListener('submit', function(event) {
            // Get form fields
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            
            // Remove previous validation classes
            nameInput.classList.remove('is-invalid', 'is-valid');
            emailInput.classList.remove('is-invalid', 'is-valid');
            
            // Validation flag
            let isValid = true;
            
            // Validate name field
            if (!nameInput.value || nameInput.value.trim().length === 0) {
                nameInput.classList.add('is-invalid');
                isValid = false;
            } else {
                nameInput.classList.add('is-valid');
            }
            
            // Validate email field
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailInput.value || !emailRegex.test(emailInput.value)) {
                emailInput.classList.add('is-invalid');
                isValid = false;
            } else {
                emailInput.classList.add('is-valid');
            }
            
            // Prevent form submission if validation fails
            if (!isValid) {
                event.preventDefault();
                event.stopPropagation();
                
                // Show alert message
                showAlert('Please fill in all required fields correctly.', 'danger');
            }
            
            // Add Bootstrap validation classes
            registrationForm.classList.add('was-validated');
        });
        
        // Real-time validation on input
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        
        if (nameInput) {
            nameInput.addEventListener('blur', function() {
                if (this.value.trim().length === 0) {
                    this.classList.add('is-invalid');
                    this.classList.remove('is-valid');
                } else {
                    this.classList.add('is-valid');
                    this.classList.remove('is-invalid');
                }
            });
        }
        
        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(this.value)) {
                    this.classList.add('is-invalid');
                    this.classList.remove('is-valid');
                } else {
                    this.classList.add('is-valid');
                    this.classList.remove('is-invalid');
                }
            });
        }
    }
    
    // ============================================
    // AUTO-DISMISS ALERTS
    // ============================================
    
    // Auto-dismiss success alerts after 5 seconds
    const successAlerts = document.querySelectorAll('.alert-success');
    successAlerts.forEach(function(alert) {
        setTimeout(function() {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });
    
    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    
    /**
     * Show alert message dynamically
     * @param {string} message - The message to display
     * @param {string} type - Alert type (success, danger, warning, info)
     */
    function showAlert(message, type) {
        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Insert at the top of main container
        const main = document.querySelector('main');
        if (main) {
            main.insertBefore(alertDiv, main.firstChild);
            
            // Auto-dismiss after 5 seconds
            setTimeout(function() {
                const bsAlert = new bootstrap.Alert(alertDiv);
                bsAlert.close();
            }, 5000);
        }
    }
    
    // ============================================
    // SMOOTH SCROLLING
    // ============================================
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
});
