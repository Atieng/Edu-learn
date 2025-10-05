// Course Data
        const coursesData = [
            {
                id: 1,
                title: "Web Development Fundamentals",
                description: "Learn HTML, CSS, and JavaScript from scratch. Build your first website with hands-on projects.",
                icon: "💻",
                lessons: [
                    { id: 1, title: "Introduction to HTML", duration: "45 min" },
                    { id: 2, title: "CSS Styling Basics", duration: "60 min" },
                    { id: 3, title: "JavaScript Fundamentals", duration: "90 min" },
                    { id: 4, title: "Responsive Design", duration: "75 min" },
                    { id: 5, title: "Building Your First Website", duration: "120 min" }
                ]
            },
            {
                id: 2,
                title: "Python Programming",
                description: "Master Python programming with practical examples. From basics to advanced concepts.",
                icon: "🐍",
                lessons: [
                    { id: 1, title: "Python Basics & Syntax", duration: "50 min" },
                    { id: 2, title: "Data Structures", duration: "70 min" },
                    { id: 3, title: "Functions & Modules", duration: "65 min" },
                    { id: 4, title: "Object-Oriented Programming", duration: "80 min" },
                    { id: 5, title: "File Handling & APIs", duration: "60 min" }
                ]
            },
            {
                id: 3,
                title: "Digital Marketing Basics",
                description: "Understand SEO, social media marketing, and content strategy for business growth.",
                icon: "📱",
                lessons: [
                    { id: 1, title: "Introduction to Digital Marketing", duration: "40 min" },
                    { id: 2, title: "SEO Fundamentals", duration: "55 min" },
                    { id: 3, title: "Social Media Strategy", duration: "50 min" },
                    { id: 4, title: "Content Marketing", duration: "45 min" },
                    { id: 5, title: "Analytics & Metrics", duration: "60 min" }
                ]
            },
            {
                id: 4,
                title: "Data Science with R",
                description: "Explore data analysis, visualization, and statistical modeling using R programming.",
                icon: "📊",
                lessons: [
                    { id: 1, title: "R Basics & RStudio", duration: "45 min" },
                    { id: 2, title: "Data Manipulation", duration: "70 min" },
                    { id: 3, title: "Data Visualization", duration: "65 min" },
                    { id: 4, title: "Statistical Analysis", duration: "85 min" },
                    { id: 5, title: "Machine Learning Intro", duration: "90 min" }
                ]
            }
        ];

        // State
        let currentUser = null;
        let isLoginMode = true;
        let currentCourseId = null;
        let userProgress = {};

        // Initialize
        function init() {
            // Load last logged-in user (if any)
            try {
                const savedUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
                if (savedUser && savedUser.username) {
                    currentUser = savedUser;
                    // Load per-user progress
                    const savedProgress = JSON.parse(localStorage.getItem(`progress_${currentUser.username}`) || '{}');
                    userProgress = savedProgress || {};
                    updateUIForLoggedInUser();
                }
            } catch (err) {
                console.error('Failed to parse saved user/progress', err);
                currentUser = null;
                userProgress = {};
            }
        }

        // Auth Functions
        function showAuthModal() {
            document.getElementById('authModal').classList.add('active');
        }

        function hideAuthModal() {
            document.getElementById('authModal').classList.remove('active');
        }

        function toggleAuthMode() {
            isLoginMode = !isLoginMode;
            document.getElementById('authTitle').textContent = isLoginMode ? 'Login' : 'Sign Up';
            document.getElementById('authBtnText').textContent = isLoginMode ? 'Login' : 'Sign Up';
            document.getElementById('toggleText').textContent = isLoginMode ? "Don't have an account?" : "Already have an account?";
            document.getElementById('toggleLink').textContent = isLoginMode ? 'Sign up' : 'Login';
        }

        function handleAuth(e) {
            e.preventDefault();
            // Trim and normalize username to avoid duplicates due to case/whitespace
            let username = (document.getElementById('username').value || '').trim();
            const password = (document.getElementById('password').value || '');

            if (!username || !password) {
                alert('Please enter both username and password.');
                return;
            }

            // Use lowercase keys for storage but preserve display name
            const key = username.toLowerCase();

            // Load users map safely
            const users = (() => {
                try { return JSON.parse(localStorage.getItem('users') || '{}'); } catch (e) { return {}; }
            })();

            if (isLoginMode) {
                // Simple login
                if (users[key] && users[key].password === password) {
                    currentUser = { username: users[key].display || username };
                    // Persist current user
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    // Load per-user progress
                    const savedProgress = JSON.parse(localStorage.getItem(`progress_${key}`) || '{}');
                    userProgress = savedProgress || {};
                    updateUIForLoggedInUser();
                    hideAuthModal();
                } else {
                    alert('Invalid credentials! Please try again or sign up.');
                }
            } else {
                // Simple signup
                if (users[key]) {
                    alert('Username already exists! Please choose another.');
                } else {
                    // Store user with password and a display name
                    users[key] = { password, display: username };
                    try {
                        localStorage.setItem('users', JSON.stringify(users));
                    } catch (err) {
                        console.error('Failed to save users', err);
                        alert('Could not create account due to storage error.');
                        return;
                    }

                    // Auto-login new user
                    currentUser = { username };
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    userProgress = {};
                    localStorage.setItem(`progress_${key}`, JSON.stringify(userProgress));
                    updateUIForLoggedInUser();
                    hideAuthModal();
                }
            }

            document.getElementById('authForm').reset();
        }

        function logout() {
            if (currentUser) {
                const key = (currentUser.username || '').toLowerCase();
                try { localStorage.setItem(`progress_${key}`, JSON.stringify(userProgress)); } catch (e) { /* ignore */ }
            }
            currentUser = null;
            userProgress = {};
            localStorage.removeItem('currentUser');
            
            document.getElementById('welcomeSection').style.display = 'block';
            document.getElementById('coursesSection').style.display = 'none';
            document.getElementById('authBtn').style.display = 'inline-block';
            document.getElementById('logoutBtn').style.display = 'none';
            document.getElementById('userGreeting').textContent = '';
            showHome();
        }

        function updateUIForLoggedInUser() {
            document.getElementById('welcomeSection').style.display = 'none';
            document.getElementById('coursesSection').style.display = 'block';
            document.getElementById('authBtn').style.display = 'none';
            document.getElementById('logoutBtn').style.display = 'inline-block';
            document.getElementById('userGreeting').textContent = `Hello, ${currentUser.username}!`;
            renderCourses();
        }

        // Course Functions
    function renderCourses() {
            const grid = document.getElementById('courseGrid');
            grid.innerHTML = '';

            coursesData.forEach(course => {
        const completed = !!userProgress[course.id];
                const card = document.createElement('div');
                card.className = 'course-card';
                card.onclick = () => showCourseDetail(course.id);
                
                card.innerHTML = `
                    <div class="course-icon">${course.icon}</div>
                    <div class="course-title">${course.title}</div>
                    <div class="course-description">${course.description}</div>
                    <div class="course-meta">
                        <div class="course-lessons">${course.lessons.length} Lessons</div>
                        <div class="course-progress ${completed ? 'completed' : ''}">
                            ${completed ? '✓ Completed' : 'In Progress'}
                        </div>
                    </div>
                `;
                
                grid.appendChild(card);
            });
        }

        function showCourseDetail(courseId) {
            if (!currentUser) {
                showAuthModal();
                return;
            }

            currentCourseId = courseId;
            const course = coursesData.find(c => c.id === courseId);
            
            document.getElementById('homePage').style.display = 'none';
            document.getElementById('courseDetailPage').classList.add('active');

            // Render header
            const header = document.getElementById('courseDetailHeader');
            header.innerHTML = `
                <h1>${course.title}</h1>
                <p>${course.description}</p>
            `;

            // Render lessons
            const lessonsList = document.getElementById('lessonsList');
            lessonsList.innerHTML = '';
            
            course.lessons.forEach((lesson, index) => {
                const completed = !!userProgress[courseId];
                const lessonDiv = document.createElement('div');
                lessonDiv.className = 'lesson-item';
                lessonDiv.innerHTML = `
                    <div class="lesson-number">${index + 1}</div>
                    <div class="lesson-content">
                        <div class="lesson-title">${lesson.title}</div>
                        <div class="lesson-duration">Duration: ${lesson.duration}</div>
                    </div>
                    <div class="lesson-status ${completed ? 'completed' : ''}"></div>
                `;
                lessonsList.appendChild(lessonDiv);
            });
        }

        function markCourseComplete() {
            if (currentCourseId) {
                userProgress[currentCourseId] = true;
                localStorage.setItem('userProgress', JSON.stringify(userProgress));
                if (currentUser) {
                    localStorage.setItem(`progress_${currentUser.username}`, JSON.stringify(userProgress));
                }
                alert('Congratulations! Course marked as completed! 🎉');
                showCourseDetail(currentCourseId); // Refresh the view
            }
        }

        function showHome() {
            document.getElementById('homePage').style.display = 'block';
            document.getElementById('courseDetailPage').classList.remove('active');
            currentCourseId = null;
            if (currentUser) {
                renderCourses();
            }
        }

        // Attach modal click listener and initialize once DOM is ready
        document.addEventListener('DOMContentLoaded', function () {
            const authModal = document.getElementById('authModal');
            if (authModal) {
                authModal.addEventListener('click', function(e) {
                    if (e.target === this) {
                        hideAuthModal();
                    }
                });
            }

            // Ensure auth form exists and attach submit handler in case inline attribute missing
            const authForm = document.getElementById('authForm');
            if (authForm) {
                authForm.addEventListener('submit', handleAuth);
            }

            init();
        });
   