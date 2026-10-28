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

// API Configuration - use deployed backend in production, local for development
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? ''
    : 'https://help-her-backend.onrender.com';

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
            const response = await fetch(`${API_BASE_URL}/api/chat`, {
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

// Modal elements
const mentorModal = document.getElementById('mentorModal');
const modalBody = document.getElementById('modalBody');
const closeModalBtn = document.querySelector('.close-modal');

// Messaging modal elements
const messageModal = document.getElementById('messageModal');
const messageModalBody = document.getElementById('messageModalBody');
const closeMessageModalBtn = document.getElementById('closeMessageModal');

// Store mentors globally for button access
let currentMentors = [];
let selectedMentor = null;

// Close modal - with null checks
if (closeModalBtn && mentorModal) {
    closeModalBtn.addEventListener('click', closeModal);
    mentorModal.addEventListener('click', (e) => {
        if (e.target === mentorModal) {
            closeModal();
        }
    });
}

// Messaging modal functions
function showMessageModal(mentor) {
    selectedMentor = mentor;
    const initial = mentor.displayName.charAt(0);

    messageModalBody.innerHTML = `
        <div class="modal-mentor-header">
            <div class="mentor-avatar" style="width: 60px; height: 60px; font-size: 1.5rem; margin: 0 auto 1rem;">${initial}</div>
            <h2 class="modal-mentor-name">Send a Message</h2>
            <p style="color: var(--text-light);">to ${mentor.displayName}</p>
        </div>
        <div class="privacy-notice">
            <strong>📌 Demo Mode:</strong> This is a prototype using fictional mentor profiles. 
            Your message will be stored temporarily in memory for demonstration purposes. 
            No real mentor will receive this message.
        </div>
        <form class="request-form" id="messageForm">
            <div class="form-group">
                <label for="learnerName">Your Name</label>
                <input type="text" id="learnerName" name="learnerName" required
                    style="width: 100%; padding: 12px 15px; border: 2px solid var(--light-gold); border-radius: 10px; font-size: 1rem;"
                    placeholder="Enter your name">
            </div>
            <div class="form-group">
                <label for="messageLanguage">Preferred Language</label>
                <select id="messageLanguage" name="messageLanguage" required>
                    <option value="">Select a language</option>
                    ${mentor.languages.map(lang => `<option value="${lang}">${lang}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="messageText">Your Message</label>
                <textarea id="messageText" name="messageText" required rows="4"
                    placeholder="Explain what you need help with and why you're interested in this mentor..."></textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="form-cancel-btn" onclick="closeMessageModal()">Cancel</button>
                <button type="submit" class="form-submit-btn">Send Message</button>
            </div>
        </form>
    `;

    messageModal.classList.add('show');

    // Handle form submission
    const form = document.getElementById('messageForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const learnerName = document.getElementById('learnerName').value;
        const language = document.getElementById('messageLanguage').value;
        const messageText = document.getElementById('messageText').value;

        // Disable submit button
        const submitBtn = form.querySelector('.form-submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        try {
            const response = await fetch(`${API_BASE_URL}/api/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    mentorId: mentor.id || 'demo-mentor',
                    mentorName: mentor.displayName,
                    learnerName,
                    language,
                    message: messageText
                })
            });

            const data = await response.json();

            if (data.success) {
                messageModalBody.innerHTML = `
                    <div class="modal-mentor-header">
                        <div class="mentor-avatar" style="width: 60px; height: 60px; font-size: 1.5rem; margin: 0 auto 1rem;">✓</div>
                        <h2 class="modal-mentor-name">Message Sent!</h2>
                    </div>
                    <div class="privacy-notice" style="background-color: #E8F5E9; color: #2E7D32; border-color: #4CAF50;">
                        <strong>Success!</strong> Your message has been received.
                    </div>
                    <div style="padding: 1.5rem; text-align: center; color: var(--text-light);">
                        <p><strong>⚠️ Demo Notice:</strong></p>
                        <p>This is a prototype with fictional mentor profiles. Your message has been stored temporarily in memory for demonstration purposes.</p>
                        <p>No real mentor has been notified. In a production version, mentors would receive real notifications and could respond.</p>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="form-submit-btn" onclick="closeMessageModal()">Close</button>
                    </div>
                `;
            } else {
                throw new Error(data.error || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            messageModalBody.innerHTML = `
                <div class="modal-mentor-header">
                    <div class="mentor-avatar" style="width: 60px; height: 60px; font-size: 1.5rem; margin: 0 auto 1rem; background-color: #FFEBEE;">✗</div>
                    <h2 class="modal-mentor-name">Error</h2>
                </div>
                <div class="privacy-notice" style="background-color: #FFEBEE; color: #C62828; border-color: #F44336;">
                    <strong>Error:</strong> Failed to send your message. Please try again.
                </div>
                <div class="form-actions">
                    <button type="button" class="form-submit-btn" onclick="closeMessageModal()">Close</button>
                </div>
            `;
        }
    });
}

function closeMessageModal() {
    messageModal.classList.remove('show');
    selectedMentor = null;
}

// Make functions available globally
window.closeMessageModal = closeMessageModal;
window.showMessageModal = showMessageModal;

// Close message modal on click outside
if (closeMessageModalBtn && messageModal) {
    closeMessageModalBtn.addEventListener('click', closeMessageModal);
    messageModal.addEventListener('click', (e) => {
        if (e.target === messageModal) {
            closeMessageModal();
        }
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
            <button class="modal-btn modal-btn-primary" id="sendMessageBtn">Send Message</button>
        </div>
    `;

    mentorModal.classList.add('show');

    // Add event listener to Send Message button
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', () => {
            showMessageModal(mentor);
        });
    }
}

// Make showMentorProfile available globally
window.showMentorProfile = showMentorProfile;

// Close modal
function closeModal() {
    mentorModal.classList.remove('show');
}

// Make closeModal available globally
window.closeModal = closeModal;

// Mentor Matching Agent Functionality
const topicSelect2 = document.getElementById('topicSelect');
const experienceSelect2 = document.getElementById('experienceSelect');
const languageSelect2 = document.getElementById('languageSelect');
const descriptionSelect2 = document.getElementById('descriptionSelect');
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
            const response = await fetch(`${API_BASE_URL}/api/mentors/search`);
            const data = await response.json();
            if (data.success) {
                allMentorsData = data.mentors;
            }
        } catch (error) {
            console.error('Error loading mentors for matching:', error);
        }
    }

    const topicExpertiseMap = {
        'digital-basics': ['web development', 'html', 'css', 'javascript', 'python'],
        'artificial-intelligence': ['artificial intelligence', 'machine learning', 'tensorflow', 'python', 'neural'],
        'cybersecurity': ['cybersecurity', 'network security', 'ethical hacking', 'secure coding', 'security'],
        'programming': ['python', 'javascript', 'web development', 'mobile development', 'ios', 'swift', 'html'],
        'networking': ['network', 'networking', 'cloud', 'network security']
    };

    const topicLabels = {
        'digital-basics': 'Digital Basics',
        'artificial-intelligence': 'Artificial Intelligence',
        'cybersecurity': 'Cybersecurity',
        'programming': 'Programming',
        'networking': 'Networking'
    };

    function mentorSearchText(mentor) {
        return [
            ...(mentor.expertise || []),
            ...(mentor.mentoringTopics || [])
        ].join(' ').toLowerCase();
    }

    function countKeywordHits(text, keywords) {
        return keywords.filter(keyword => text.includes(keyword)).length;
    }

    function scoreMentors(topic, experience, language, description) {
        const expertiseKeywords = topicExpertiseMap[topic] || [];
        const topicLabel = topicLabels[topic] || topic;
        const descriptionWords = (description || '')
            .toLowerCase()
            .split(/[^a-zA-Z\u0600-\u06FF]+/)
            .filter(word => word.length > 3);
        const hasDescription = descriptionWords.length > 0;
        const maxScore = 45 + 35 + 20 + (hasDescription ? 10 : 0);

        return allMentorsData.map(mentor => {
            let score = 0;
            const reasons = [];
            const haystack = mentorSearchText(mentor);
            const topicHits = countKeywordHits(haystack, expertiseKeywords);
            const topicMatch = topicHits > 0;

            if (topicMatch) {
                score += 45;
                reasons.push(`Expertise matches ${topicLabel}`);
            }

            const languageMatch = language && (mentor.languages || []).includes(language);
            if (languageMatch) {
                score += 35;
                reasons.push(`Speaks ${language}`);
            }

            if (experience) {
                const beginnerFriendly = (mentor.mentoringTopics || []).some(t =>
                    /basic|fundamental|beginner/i.test(t)
                );
                const mentorLevel = mentor.experienceLevel || '';

                if (experience === 'beginner' && (beginnerFriendly || mentorLevel === 'beginner' || mentorLevel === 'intermediate')) {
                    score += 20;
                    reasons.push('Good fit for a beginner');
                } else if (experience === 'intermediate' && (mentorLevel === 'intermediate' || mentorLevel === 'senior')) {
                    score += 20;
                    reasons.push('Experience level matches your goals');
                }
            }

            if (hasDescription) {
                const descriptionHits = descriptionWords.filter(word => haystack.includes(word)).length;
                if (descriptionHits > 0) {
                    const descriptionPoints = Math.min(10, descriptionHits * 4);
                    score += descriptionPoints;
                    reasons.push('Matches details in your description');
                }
            }

            const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

            return {
                mentor,
                score,
                percent,
                reasons,
                topicMatch,
                languageMatch: Boolean(languageMatch)
            };
        });
    }

    function findBestMentors(topic, experience, language, description) {
        return scoreMentors(topic, experience, language, description)
            .filter(match => match.score > 0 && (match.topicMatch || match.languageMatch))
            .sort((a, b) => {
                if (b.percent !== a.percent) return b.percent - a.percent;
                if (Number(b.topicMatch) !== Number(a.topicMatch)) return Number(b.topicMatch) - Number(a.topicMatch);
                return b.score - a.score;
            })
            .slice(0, 2);
    }

    function displayMatchingResults(matchedMentors) {
        matchingMentors = matchedMentors;

        if (matchedMentors.length === 0) {
            matchingResults.innerHTML = `
                <div class="no-match-message">
                    <strong>No mentors found</strong>
                    Unfortunately, we don't currently have mentors who match your specific criteria.
                    Try adjusting your preferences or browse all mentors in the "Meet Our Mentors" section.
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
                            <div class="matching-result-score">Compatibility: ${match.percent}%</div>
                        </div>
                    </div>
                    <div class="matching-result-explanation">
                        <strong>Why this mentor:</strong> ${match.reasons.join('. ')}.
                    </div>
                    <div class="matching-result-actions">
                        <button class="matching-view-btn" data-matching-index="${index}">
                            View Profile
                        </button>
                        <button class="matching-view-btn" data-message-index="${index}" style="background-color: var(--deep-rose);">
                            Send Message
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        document.querySelectorAll('#matchingResults .matching-view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (e.target.dataset.matchingIndex !== undefined) {
                    const index = parseInt(e.target.dataset.matchingIndex, 10);
                    showMentorProfile(matchingMentors[index].mentor);
                } else if (e.target.dataset.messageIndex !== undefined) {
                    const index = parseInt(e.target.dataset.messageIndex, 10);
                    showMessageModal(matchingMentors[index].mentor);
                }
            });
        });
    }

    findMyMentorBtn.addEventListener('click', async () => {
        const topic = topicSelect2.value;
        const experience = experienceSelect2.value;
        const language = languageSelect2.value;
        const description = descriptionSelect2 ? descriptionSelect2.value.trim() : '';

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

        if (allMentorsData.length === 0) {
            await loadMentorsForMatching();
        }

        displayMatchingResults(findBestMentors(topic, experience, language, description));
    });

    loadMentorsForMatching();
}

// Load and display all mentors in the "Meet Our Mentors" directory
const mentorsDirectoryContainer = document.getElementById('mentorsDirectoryContainer');

if (mentorsDirectoryContainer) {
    async function loadMentorsDirectory() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/mentors/search`);
            const data = await response.json();
            if (data.success && data.mentors.length > 0) {
                displayMentorsDirectory(data.mentors);
            }
        } catch (error) {
            console.error('Error loading mentors directory:', error);
            mentorsDirectoryContainer.innerHTML = '<div class="no-mentors">Error loading mentors.</div>';
        }
    }

    function displayMentorsDirectory(mentors) {
        mentorsDirectoryContainer.innerHTML = '';

        mentors.forEach((mentor, index) => {
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
                    <button class="request-mentorship-btn" data-mentor-index="${index}">Send Message</button>
                </div>
            `;

            mentorsDirectoryContainer.appendChild(card);

            // Trigger animation
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50);
        });

        // Store mentors globally for button access
        currentMentors = mentors;

        // Add event listeners to buttons
        document.querySelectorAll('.view-profile-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.mentorIndex);
                const mentor = currentMentors[index];
                showMentorProfile(mentor);
            });
        });

        document.querySelectorAll('.request-mentorship-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.mentorIndex);
                const mentor = currentMentors[index];
                showMessageModal(mentor);
            });
        });
    }

    // Load mentors directory on page load
    loadMentorsDirectory();
}

console.log('HELP HER website loaded successfully!');
