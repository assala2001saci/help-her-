// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Start Button Click Animation
const startButton = document.getElementById('startButton');
startButton.addEventListener('click', () => {
    const mentorSection = document.getElementById('find-mentor');
    mentorSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
});

// Card Button Interactions
const cardButtons = document.querySelectorAll('.card-button');
cardButtons.forEach(button => {
    button.addEventListener('click', function() {
        const card = this.closest('.learning-card');
        const cardTitle = card.querySelector('h3').textContent;
        
        // Create a simple alert for now (will be replaced with actual learning content later)
        alert(`Starting ${cardTitle} module! This feature is coming soon.`);
    });
});

// Chat Functionality (preserved but UI removed - add null checks to prevent errors)
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');
const chatMessages = document.getElementById('chatMessages');

// Only initialize chat if elements exist (prevents errors when UI is removed)
if (chatInput && sendButton && chatMessages) {
    // Send message function
    async function sendMessage() {
        const message = chatInput.value.trim();

        if (!message) return;

        // Add user message to chat
        addMessage(message, 'user');

        // Clear input
        chatInput.value = '';

        // Disable input while loading
        chatInput.disabled = true;
        sendButton.disabled = true;
        sendButton.textContent = 'Sending...';

        // Show loading indicator
        const loadingId = showLoadingIndicator();

        // Start timing
        const frontendStartTime = performance.now();

        try {
            // Send to backend API
            const apiStartTime = performance.now();
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });
            const apiEndTime = performance.now();

            const data = await response.json();
            const frontendEndTime = performance.now();

            // Remove loading indicator
            removeLoadingIndicator(loadingId);

            if (response.ok) {
                // Add AI response to chat
                addMessage(data.reply, 'ai');

                // Log detailed timing
                const totalTime = Math.round(frontendEndTime - frontendStartTime);
                const apiTime = Math.round(apiEndTime - apiStartTime);
                const serverTime = data.responseTime;
                const frontendProcessing = totalTime - apiTime;

                console.log('='.repeat(50));
                console.log('TIMING BREAKDOWN:');
                console.log('='.repeat(50));
                console.log(`Total time (Send click to display): ${totalTime}ms`);
                console.log(`  - API call duration: ${apiTime}ms`);
                console.log(`  - Server AI processing: ${serverTime}ms`);
                console.log(`  - Frontend processing: ${frontendProcessing}ms`);
                console.log('='.repeat(50));
            } else {
                // Show specific error message based on status code
                let errorMessage = 'Sorry, I encountered an error. Please try again.';
                if (response.status === 504) {
                    errorMessage = 'The request took too long. Please try again with a shorter message.';
                } else if (response.status === 429) {
                    errorMessage = 'Too many requests. Please wait a moment and try again.';
                } else if (response.status === 503) {
                    errorMessage = 'The AI service is temporarily unavailable. Please try again in a few moments.';
                } else if (data.error) {
                    errorMessage = data.error;
                }
                addMessage(errorMessage, 'ai');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            // Remove loading indicator
            removeLoadingIndicator(loadingId);
            addMessage('Sorry, I encountered an error. Please try again.', 'ai');
        } finally {
            // Re-enable input
            chatInput.disabled = false;
            sendButton.disabled = false;
            sendButton.textContent = 'Send';
            chatInput.focus();
        }
    }

    // Show loading indicator
    function showLoadingIndicator() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message ai-message';
        loadingDiv.id = 'loading-' + Date.now();

        const contentDiv = document.createElement('div');
        contentDiv.className = 'loading-message';

        const dotsDiv = document.createElement('div');
        dotsDiv.className = 'loading-dots';

        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'loading-dot';
            dotsDiv.appendChild(dot);
        }

        contentDiv.appendChild(dotsDiv);
        loadingDiv.appendChild(contentDiv);
        chatMessages.appendChild(loadingDiv);

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;

        return loadingDiv.id;
    }

    // Remove loading indicator
    function removeLoadingIndicator(id) {
        const loadingElement = document.getElementById(id);
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    // Add message to chat
    function addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;

        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Send button click
    sendButton.addEventListener('click', sendMessage);

    // Enter key to send
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
} else {
    console.log('Chat UI elements not found - chat functionality disabled (UI removed as requested)');
}

// Add scroll effect to navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 20px rgba(74, 63, 53, 0.15)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(74, 63, 53, 0.1)';
    }
});

// Add animation on scroll for cards
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all learning cards
document.querySelectorAll('.learning-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `opacity 0.6s ease ${index * 0.2}s, transform 0.6s ease ${index * 0.2}s`;
    observer.observe(card);
});

// Observe SDG highlights
document.querySelectorAll('.highlight-item').forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.style.transition = `opacity 0.5s ease ${index * 0.15}s, transform 0.5s ease ${index * 0.15}s`;
    observer.observe(item);
});

// Add hover effect enhancement for cards
document.querySelectorAll('.learning-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Mentor Discovery Functionality
const technologyFilter = document.getElementById('technologyFilter');
const languageFilter = document.getElementById('languageFilter');
const experienceFilter = document.getElementById('experienceFilter');
const searchMentorsBtn = document.getElementById('searchMentors');
const mentorCardsContainer = document.getElementById('mentorCards');
const mentorModal = document.getElementById('mentorModal');
const modalBody = document.getElementById('modalBody');
const closeModalBtn = document.querySelector('.close-modal');

// Store mentors globally for button access
let currentMentors = [];
let matchingMentors = [];

// Load mentors on page load - with null check
if (searchMentorsBtn && mentorCardsContainer) {
    loadMentors();
    searchMentorsBtn.addEventListener('click', loadMentors);
}

// Close modal - with null checks
if (closeModalBtn && mentorModal) {
    closeModalBtn.addEventListener('click', closeModal);
    mentorModal.addEventListener('click', (e) => {
        if (e.target === mentorModal) {
            closeModal();
        }
    });
}

// Load mentors from API
async function loadMentors() {
    if (!mentorCardsContainer) {
        console.error('Mentor cards container not found');
        return;
    }

    const technology = technologyFilter ? technologyFilter.value : '';
    const language = languageFilter ? languageFilter.value : '';
    const experience = experienceFilter ? experienceFilter.value : '';

    console.log('Loading mentors with filters:', { technology, language, experience });

    // Build query string
    const params = new URLSearchParams();
    if (technology) params.append('technologyField', technology);
    if (language) params.append('language', language);
    if (experience) params.append('experienceLevel', experience);

    mentorCardsContainer.innerHTML = '<div class="loading-mentors">Loading mentors...</div>';

    try {
        const response = await fetch(`/api/mentors/search?${params.toString()}`);
        const data = await response.json();

        console.log('Mentor API response:', data);

        if (data.success && data.mentors.length > 0) {
            displayMentors(data.mentors);
        } else {
            mentorCardsContainer.innerHTML = '<div class="no-mentors">No mentors found matching your criteria. Try adjusting your filters.</div>';
        }
    } catch (error) {
        console.error('Error loading mentors:', error);
        mentorCardsContainer.innerHTML = '<div class="no-mentors">Error loading mentors. Please try again.</div>';
    }
}

// Display mentor cards
function displayMentors(mentors) {
    console.log('displayMentors called with', mentors.length, 'mentors');
    currentMentors = mentors; // Store globally
    mentorCardsContainer.innerHTML = '';

    mentors.forEach((mentor, index) => {
        console.log('Creating card for:', mentor.displayName);
        const card = document.createElement('div');
        card.className = 'mentor-card';
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;

        const initial = mentor.displayName.charAt(0);

        card.innerHTML = `
            <div class="mentor-card-header">
                <div class="mentor-avatar">${initial}</div>
                <div class="mentor-name">${mentor.displayName}</div>
            </div>
            <div class="mentor-expertise">
                <h4>Expertise</h4>
                <div class="mentor-expertise-tags">
                    ${mentor.expertise.map(exp => `<span class="expertise-tag">${exp}</span>`).join('')}
                </div>
            </div>
            <div class="mentor-languages">
                <h4>Languages</h4>
                ${mentor.languages.map(lang => `<span class="language-tag">${lang}</span>`).join('')}
            </div>
            <div class="mentor-topics">
                <h4>Mentoring Topics</h4>
                <ul>
                    ${mentor.mentoringTopics.map(topic => `<li>${topic}</li>`).join('')}
                </ul>
            </div>
            <div class="mentor-card-actions">
                <button class="view-profile-btn" data-mentor-index="${index}">View Profile</button>
                <button class="request-mentorship-btn" data-mentor-index="${index}">Request Mentorship</button>
            </div>
        `;

        mentorCardsContainer.appendChild(card);

        console.log('Card appended for:', mentor.displayName);

        // Trigger animation
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 50);
    });

    // Add event listeners to buttons
    document.querySelectorAll('.view-profile-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.mentorIndex);
            const mentor = currentMentors[index];
            console.log('View profile clicked for:', mentor.displayName);
            showMentorProfile(mentor);
        });
    });

    document.querySelectorAll('.request-mentorship-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.mentorIndex);
            const mentor = currentMentors[index];
            console.log('Request mentorship clicked for:', mentor.displayName);
            showRequestForm(mentor);
        });
    });
}

// Show mentor profile modal (handles both regular and matching mentors)
function showMentorProfile(mentor) {
    const initial = mentor.displayName.charAt(0);

    modalBody.innerHTML = `
        <div class="modal-mentor-header">
            <div class="mentor-avatar" style="width: 80px; height: 80px; font-size: 2rem; margin: 0 auto 1rem;">${initial}</div>
            <h2 class="modal-mentor-name">${mentor.displayName}</h2>
            <div class="modal-mentor-badges">
                <span class="modal-badge">✓ Opted In</span>
                <span class="modal-badge">Verified Mentor</span>
            </div>
        </div>
        <div class="modal-section">
            <h3>Expertise</h3>
            <div class="mentor-expertise-tags">
                ${mentor.expertise.map(exp => `<span class="expertise-tag">${exp}</span>`).join('')}
            </div>
        </div>
        <div class="modal-section">
            <h3>Languages</h3>
            <p>${mentor.languages.join(', ')}</p>
        </div>
        <div class="modal-section">
            <h3>Mentoring Topics</h3>
            <ul>
                ${mentor.mentoringTopics.map(topic => `<li>${topic}</li>`).join('')}
            </ul>
        </div>
        <div class="modal-section">
            <h3>Privacy Notice</h3>
            <p>Contact details are not publicly displayed. The mentor must consent before any personal information is shared.</p>
        </div>
        <div class="modal-actions">
            <button class="modal-btn modal-btn-secondary" onclick="closeModal()">Close</button>
            <button class="modal-btn modal-btn-primary" onclick="showRequestForm('${JSON.stringify(mentor).replace(/'/g, "\\'")}')">Request Mentorship</button>
        </div>
    `;

    mentorModal.classList.add('show');
}

// Make showMentorProfile available globally
window.showMentorProfile = showMentorProfile;

// Show request form modal
function showRequestForm(mentor) {
    const initial = mentor.displayName.charAt(0);

    modalBody.innerHTML = `
        <div class="modal-mentor-header">
            <div class="mentor-avatar" style="width: 60px; height: 60px; font-size: 1.5rem; margin: 0 auto 1rem;">${initial}</div>
            <h2 class="modal-mentor-name">Request Mentorship</h2>
            <p style="color: var(--text-light);">with ${mentor.displayName}</p>
        </div>
        <div class="privacy-notice">
            <strong>🔒 Privacy Notice:</strong> Your request will be reviewed by the mentor. Contact details will only be shared if the mentor accepts your request. This is a demo - no real message will be sent.
        </div>
        <form class="request-form" id="mentorshipRequestForm">
            <div class="form-group">
                <label for="learnerName">Your Name</label>
                <input type="text" id="learnerName" name="learnerName" required
                    style="width: 100%; padding: 12px 15px; border: 2px solid var(--light-gold); border-radius: 10px; font-size: 1rem;"
                    placeholder="Enter your name">
            </div>
            <div class="form-group">
                <label for="preferredLanguage">Preferred Language</label>
                <select id="preferredLanguage" name="preferredLanguage" required>
                    <option value="">Select a language</option>
                    ${mentor.languages.map(lang => `<option value="${lang}">${lang}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="learningGoals">What do you want to learn?</label>
                <textarea id="learningGoals" name="learningGoals" required
                    placeholder="Explain what you hope to learn and why you're interested in this mentor..."></textarea>
            </div>
            <div class="form-group">
                <label for="availability">Your availability</label>
                <textarea id="availability" name="availability"
                    placeholder="When are you available for mentoring sessions? (e.g., weekends, evenings, etc.)"></textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="form-cancel-btn" onclick="closeModal()">Cancel</button>
                <button type="submit" class="form-submit-btn">Send Request</button>
            </div>
        </form>
    `;

    mentorModal.classList.add('show');

    // Handle form submission
    const form = document.getElementById('mentorshipRequestForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitMentorshipRequest(mentor, form);
    });
}

// Submit mentorship request (demo)
async function submitMentorshipRequest(mentor, form) {
    const submitBtn = form.querySelector('.form-submit-btn');
    const cancelBtn = form.querySelector('.form-cancel-btn');

    submitBtn.disabled = true;
    cancelBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Show success message (demo)
    modalBody.innerHTML = `
        <div class="modal-mentor-header">
            <div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>
            <h2 class="modal-mentor-name">Request Submitted!</h2>
        </div>
        <div class="form-message success">
            <strong>Demo Mode:</strong> Your mentorship request has been recorded in this demo.
            <br><br>
            In a real system, this request would be sent to ${mentor.displayName} for review.
            Contact details would only be shared if the mentor accepts your request.
        </div>
        <div class="modal-section">
            <h3>What happens next?</h3>
            <ul>
                <li>The mentor will review your request</li>
                <li>If interested, they will accept your request</li>
                <li>Contact details will be shared only after consent</li>
                <li>You can then connect directly with your mentor</li>
            </ul>
        </div>
        <div class="modal-actions">
            <button class="modal-btn modal-btn-primary" onclick="closeModal()">Close</button>
        </div>
    `;
}

// Close modal
function closeModal() {
    mentorModal.classList.remove('show');
}

// Make closeModal available globally
window.closeModal = closeModal;
window.showRequestForm = showRequestForm;

// Mentor Matching Agent Functionality
const topicSelect2 = document.getElementById('topicSelect');
const experienceSelect2 = document.getElementById('experienceSelect');
const languageSelect2 = document.getElementById('languageSelect');
const findMyMentorBtn = document.getElementById('findMyMentor');
const matchingResults = document.getElementById('matchingResults');

// Store all mentors for matching
let allMentorsData = [];
let matchingMentors = [];

// Only initialize matching if elements exist
if (topicSelect2 && experienceSelect2 && languageSelect2 && findMyMentorBtn && matchingResults) {
    // Load mentors for matching
    async function loadMentorsForMatching() {
        try {
            const response = await fetch('/api/mentors/search');
            const data = await response.json();
            if (data.success) {
                allMentorsData = data.mentors;
            }
        } catch (error) {
            console.error('Error loading mentors for matching:', error);
        }
    }

    // Topic to expertise mapping
    const topicExpertiseMap = {
        'digital-basics': ['Web Development', 'Python', 'HTML/CSS', 'JavaScript'],
        'artificial-intelligence': ['Artificial Intelligence', 'Machine Learning', 'TensorFlow', 'Python'],
        'online-safety': ['Cybersecurity', 'Network Security', 'Ethical Hacking'],
        'programming': ['Python', 'JavaScript', 'Web Development', 'Mobile Development', 'iOS', 'Swift']
    };

    // Score mentors based on user preferences
    function scoreMentors(topic, experience, language) {
        const expertiseKeywords = topicExpertiseMap[topic] || [];
        
        return allMentorsData.map(mentor => {
            let score = 0;
            let reasons = [];

            // Check expertise match
            let expertiseMatch = false;
            mentor.expertise.forEach(exp => {
                expertiseKeywords.forEach(keyword => {
                    if (exp.toLowerCase().includes(keyword.toLowerCase())) {
                        expertiseMatch = true;
                    }
                });
            });

            if (expertiseMatch) {
                score += 3;
                reasons.push('Expertise matches your topic');
            }

            // Check language match
            if (language && mentor.languages.includes(language)) {
                score += 2;
                reasons.push('Speaks your preferred language');
            }

            // Check experience level match
            if (experience) {
                if (experience === 'beginner' && mentor.mentoringTopics.some(t => t.toLowerCase().includes('basic') || t.toLowerCase().includes('fundamental'))) {
                    score += 1;
                    reasons.push('Suitable for beginners');
                } else if (experience === 'intermediate' && (mentor.experienceLevel === 'intermediate' || mentor.experienceLevel === 'senior')) {
                    score += 1;
                    reasons.push('Suitable experience level');
                }
            }

            return {
                mentor,
                score,
                reasons
            };
        });
    }

    // Find best mentors
    function findBestMentors(topic, experience, language) {
        const scoredMentors = scoreMentors(topic, experience, language);
        
        // Filter out mentors with score 0 (no match)
        const matchedMentors = scoredMentors.filter(m => m.score > 0);
        
        // Sort by score (highest first)
        matchedMentors.sort((a, b) => b.score - a.score);
        
        // Return top 3
        return matchedMentors.slice(0, 3);
    }

    // Display matching results
    function displayMatchingResults(matchedMentors) {
        matchingMentors = matchedMentors; // Store globally

        if (matchedMentors.length === 0) {
            matchingResults.innerHTML = `
                <div class="no-match-message">
                    <strong>No mentors found</strong>
                    Unfortunately, we don't currently have mentors who match your specific criteria.
                    Try adjusting your preferences or browse all mentors in the "Find a Mentor" section.
                </div>
            `;
            return;
        }

        matchingResults.innerHTML = matchedMentors.map((match, index) => {
            const initial = match.mentor.displayName.charAt(0);
            return `
                <div class="matching-result-card">
                    <div class="matching-result-header">
                        <div class="matching-result-avatar">${initial}</div>
                        <div>
                            <div class="matching-result-name">${match.mentor.displayName}</div>
                        <div class="matching-result-score">Match Score: ${match.score}/6</div>
                    </div>
                </div>
                <div class="matching-result-explanation">
                    <strong>Why this mentor:</strong> ${match.reasons.join(', ')}.
                </div>
                <div class="matching-result-actions">
                    <button class="matching-view-btn" data-matching-index="${index}">
                        View Profile
                    </button>
                </div>
            </div>
        `;
    }).join('');

        // Add event listeners to buttons
        document.querySelectorAll('.matching-view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.matchingIndex);
                const mentor = matchingMentors[index].mentor;
                showMentorProfile(mentor);
            });
        });
    }

    // Find mentor button click
    findMyMentorBtn.addEventListener('click', async () => {
        const topic = topicSelect2.value;
        const experience = experienceSelect2.value;
        const language = languageSelect2.value;

        if (!topic || !experience || !language) {
            matchingResults.innerHTML = `
                <div class="no-match-message">
                    <strong>Please fill in all fields</strong>
                    Select a topic, experience level, and language to find your mentor.
                </div>
            `;
            return;
        }

        matchingResults.innerHTML = '<div class="loading-matching">Finding your perfect mentor...</div>';

        // Load mentors if not already loaded
        if (allMentorsData.length === 0) {
            await loadMentorsForMatching();
        }

        const matchedMentors = findBestMentors(topic, experience, language);
        displayMatchingResults(matchedMentors);
    });

    // Load mentors for matching on page load
    loadMentorsForMatching();
}

console.log('HELP HER website loaded successfully!');
    document.querySelectorAll('.matching-view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.matchingIndex);
            const mentor = matchingMentors[index].mentor;
            showMentorProfile(mentor);
        });
    });
}

// Find mentor button click
if (findMyMentorBtn) {
    findMyMentorBtn.addEventListener('click', async () => {
        const topic = topicSelect.value;
        const experience = experienceSelect.value;
        const language = languageSelect.value;

        if (!topic || !experience || !language) {
            matchingResults.innerHTML = `
                <div class="no-match-message">
                    <strong>Please fill in all fields</strong>
                    Select a topic, experience level, and language to find your mentor.
                </div>
            `;
            return;
        }

        matchingResults.innerHTML = '<div class="loading-matching">Finding your perfect mentor...</div>';

        // Load mentors if not already loaded
        if (allMentorsData.length === 0) {
            await loadMentorsForMatching();
        }

        const matchedMentors = findBestMentors(topic, experience, language);
        displayMatchingResults(matchedMentors);
    });
}

// Load mentors for matching on page load
loadMentorsForMatching();

console.log('HELP HER website loaded successfully!');
