// Study Hub JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Load courses data when page loads for better performance
    loadCoursesData();
    
    // Mobile menu toggle functionality - works as back button in courses section
    const menuToggle = document.getElementById('menuToggle');
    
    menuToggle.addEventListener('click', function() {
        const coursesSection = document.getElementById('coursesSection');
        const courseDetailSection = document.getElementById('courseDetailSection');
        
        // Check if we're in course detail section
        if (courseDetailSection.style.display === 'block') {
            hideCourseDetailSection();
        }
        // Check if we're in courses section, then act as back button  
        else if (coursesSection.style.display !== 'none') {
            hideCoursesSection();
        } else {
            // Normal menu toggle behavior for home page
            this.classList.toggle('active');
            // Add animation to hamburger menu
            const spans = this.querySelectorAll('span');
            spans.forEach(span => span.style.transform = this.classList.contains('active') ? 'rotate(45deg)' : 'rotate(0deg)');
        }
    });

    // Button click handlers
    const exploreCourses = document.getElementById('exploreCourses');
    const joinCommunity = document.getElementById('joinCommunity');

    exploreCourses.addEventListener('click', function() {
        // Add click effect
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
        
        console.log('Explore Courses clicked');
        showCoursesSection();
    });

    joinCommunity.addEventListener('click', function() {
        // Add click effect
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
        
        console.log('Join Community clicked');
        // Here you can add navigation or modal functionality
        alert('Community section coming soon!');
    });

    // Smooth scrolling for any future navigation
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

    // Add some interactive animations
    const heroIcon = document.querySelector('.icon-circle');
    if (heroIcon) {
        heroIcon.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05) rotate(5deg)';
        });
        
        heroIcon.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
        });
    }
});

// Add loading animation
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease-in-out';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Course data - loaded from courses/metadata.json
let coursesData = [];
let currentCourseDetails = null;

// Parse txt file content to count videos and PDFs
function parseContentCounts(content) {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
    
    let videoCount = 0;
    let pdfCount = 0;
    
    lines.forEach(line => {
        if (line.includes('.mp4') || line.includes('.m3u8') || line.includes('youtube.com') || line.includes('youtu.be')) {
            videoCount++;
        } else if (line.includes('.pdf')) {
            pdfCount++;
        }
    });
    
    return { videos: videoCount, pdfs: pdfCount };
}

// Load and parse txt file for course content
async function loadCourseContentCounts(txtFileName) {
    try {
        const response = await fetch(`/course_txts/${txtFileName}`);
        if (response.ok) {
            const content = await response.text();
            return parseContentCounts(content);
        } else {
            console.error(`Failed to load txt file: ${txtFileName}`);
            return null;
        }
    } catch (error) {
        console.error(`Error loading txt file ${txtFileName}:`, error);
        return null;
    }
}

// Load course data from metadata.json
async function loadCoursesData() {
    try {
        const response = await fetch('/courses/metadata.json');
        if (response.ok) {
            coursesData = await response.json();
            console.log('Courses loaded from metadata.json:', coursesData.length + ' courses');
            
            // Process courses with txt files to get dynamic counts
            for (let course of coursesData) {
                console.log(`Checking course: ${course.title}, txtFile: ${course.txtFile}`);
                if (course.txtFile) {
                    console.log(`Loading content counts for ${course.title} from ${course.txtFile}`);
                    const counts = await loadCourseContentCounts(course.txtFile);
                    if (counts) {
                        console.log(`Found counts:`, counts);
                        course.videos = counts.videos;
                        course.pdfs = counts.pdfs;
                        console.log(`Updated ${course.title}: ${counts.videos} videos, ${counts.pdfs} PDFs`);
                    } else {
                        console.log(`No counts found for ${course.title}`);
                        course.videos = 0;
                        course.pdfs = 0;
                    }
                } else {
                    console.log(`No txtFile for ${course.title} - setting counts to 0`);
                    course.videos = 0;
                    course.pdfs = 0;
                }
            }
            console.log(`Final courses data:`, coursesData);
        } else {
            console.error('Failed to load courses metadata');
            coursesData = [];
        }
    } catch (error) {
        console.error('Error loading courses metadata:', error);
        coursesData = [];
    }
}

// Functions to handle courses section
async function showCoursesSection() {
    const heroSection = document.querySelector('.hero');
    const trustSection = document.querySelector('.trust');
    const coursesSection = document.getElementById('coursesSection');
    const menuToggle = document.getElementById('menuToggle');
    
    // Hide hero and trust sections
    heroSection.style.display = 'none';
    trustSection.style.display = 'none';
    
    // Show courses section
    coursesSection.style.display = 'block';
    
    // Change hamburger menu to home icon
    menuToggle.innerHTML = '<span style="font-size: 24px;">🏠</span>';
    
    // Load courses data first, then populate courses
    await loadCoursesData();
    populateCourses();
    
    // Back button functionality now handled by hamburger menu
    
    // Add search functionality
    const searchInput = document.getElementById('searchCourses');
    searchInput.addEventListener('input', function() {
        filterCourses(this.value);
    });
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function hideCoursesSection() {
    const heroSection = document.querySelector('.hero');
    const trustSection = document.querySelector('.trust');
    const coursesSection = document.getElementById('coursesSection');
    const menuToggle = document.getElementById('menuToggle');
    
    // Show hero and trust sections
    heroSection.style.display = 'block';
    trustSection.style.display = 'block';
    
    // Hide courses section
    coursesSection.style.display = 'none';
    
    // Change home icon back to hamburger menu
    menuToggle.innerHTML = '<span></span><span></span><span></span>';
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function populateCourses(courses = coursesData) {
    const coursesList = document.getElementById('coursesList');
    coursesList.innerHTML = '';
    
    courses.forEach(course => {
        const courseCard = createCourseCard(course);
        coursesList.appendChild(courseCard);
    });
}

function createCourseCard(course) {
    const card = document.createElement('div');
    card.className = 'course-card';
    
    // Check if thumbnail is a URL or text
    const isImageUrl = course.thumbnail.startsWith('http');
    const thumbnailContent = isImageUrl 
        ? `<img src="${course.thumbnail}" alt="${course.title}" style="width: 100%; height: 100%; object-fit: cover;">`
        : course.thumbnail;
    
    card.innerHTML = `
        <div class="course-thumbnail">
            ${thumbnailContent}
        </div>
        <div class="course-content">
            <h3 class="course-title">${course.title}</h3>
            <p class="course-description">${course.description}</p>
            
            <div class="course-stats">
                <div class="stat-item stat-videos">
                    ▶ ${course.videos} Videos
                </div>
                <div class="stat-item stat-pdfs">
                    📄 ${course.pdfs} PDFs
                </div>
            </div>
            
            <div class="course-dates">
                <div class="date-item start-date">
                    📅 ${course.startDate}
                </div>
                <div class="date-item end-date">
                    📅 
${course.endDate}
                </div>
            </div>
            
            <button class="course-explore-btn" onclick="exploreCourse(${course.id})">
                Explore
            </button>
        </div>
    `;
    
    return card;
}

function filterCourses(searchTerm) {
    const filteredCourses = coursesData.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    populateCourses(filteredCourses);
}

// Parse detailed course content from txt file
async function parseDetailedCourseContent(txtFile) {
    try {
        const response = await fetch(`/course_txts/${txtFile}`);
        
        if (!response.ok) {
            return { videos: [], pdfs: [] };
        }
        
        const content = await response.text();
        const lines = content.split('\n').filter(line => line.trim() !== '');
        
        const videos = [];
        const pdfs = [];
        let currentSection = 'videos'; // default
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Skip comments and empty lines
            if (line.startsWith('#') || line === '') {
                // Check section headers
                if (line.toLowerCase().includes('video')) {
                    currentSection = 'videos';
                } else if (line.toLowerCase().includes('pdf')) {
                    currentSection = 'pdfs';
                }
                continue;
            }
            
            // Check if line contains title: url format
            if (line.includes(': ')) {
                const [title, url] = line.split(': ');
                const item = { title: title.trim(), url: url.trim() };
                
                // Determine if it's video or pdf based on URL
                if (isVideoUrl(url.trim())) {
                    videos.push(item);
                } else if (isPdfUrl(url.trim())) {
                    pdfs.push(item);
                } else {
                    // Use current section
                    if (currentSection === 'videos') {
                        videos.push(item);
                    } else {
                        pdfs.push(item);
                    }
                }
            } else if (isUrl(line)) {
                // Simple URL format without title
                const url = line.trim();
                const title = extractTitleFromUrl(url);
                const item = { title, url };
                
                if (isVideoUrl(url)) {
                    videos.push(item);
                } else if (isPdfUrl(url)) {
                    pdfs.push(item);
                } else {
                    // Use current section
                    if (currentSection === 'videos') {
                        videos.push(item);
                    } else {
                        pdfs.push(item);
                    }
                }
            }
        }
        
        return { videos, pdfs };
    } catch (error) {
        console.error('Error parsing detailed course content:', error);
        return { videos: [], pdfs: [] };
    }
}

// Helper functions for URL detection
function isUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function isVideoUrl(url) {
    const videoExtensions = ['.mp4', '.m3u8', '.avi', '.mov', '.wmv'];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowerUrl.includes(ext)) || 
           lowerUrl.includes('youtube.com') || 
           lowerUrl.includes('youtu.be') ||
           lowerUrl.includes('/videos/');
}

function isPdfUrl(url) {
    return url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('/pdf/');
}

function extractTitleFromUrl(url) {
    try {
        const urlParts = url.split('/');
        const filename = urlParts[urlParts.length - 1];
        return filename.split('.')[0].replace(/[-_]/g, ' ');
    } catch (_) {
        return 'Untitled';
    }
}

// Explore course function - shows detailed course content
async function exploreCourse(courseId) {
    console.log(`Exploring course with ID: ${courseId}`);
    const course = coursesData.find(c => c.id === courseId);
    console.log('Found course:', course);
    
    if (!course || !course.txtFile) {
        alert('Course content not available');
        return;
    }
    
    // Parse detailed content
    console.log(`Parsing detailed content from: ${course.txtFile}`);
    const detailedContent = await parseDetailedCourseContent(course.txtFile);
    console.log('Detailed content parsed:', detailedContent);
    currentCourseDetails = { course, ...detailedContent };
    console.log('Current course details set:', currentCourseDetails);
    
    // Show course detail view
    showCourseDetailSection();
}

// Show course detail section
function showCourseDetailSection() {
    if (!currentCourseDetails) return;
    
    // Hide other sections
    const heroSection = document.querySelector('.hero');
    const trustSection = document.querySelector('.trust'); 
    const coursesSection = document.getElementById('coursesSection');
    const courseDetailSection = document.getElementById('courseDetailSection');
    const menuToggle = document.getElementById('menuToggle');
    
    heroSection.style.display = 'none';
    trustSection.style.display = 'none';
    coursesSection.style.display = 'none';
    courseDetailSection.style.display = 'block';
    
    // Update hamburger menu to home icon
    menuToggle.innerHTML = '<span style="font-size: 24px;">🏠</span>';
    
    // Populate course detail content
    populateCourseDetail();
    
    // Set up tab functionality
    setupCourseTabs();
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Hide course detail section
function hideCourseDetailSection() {
    const heroSection = document.querySelector('.hero');
    const trustSection = document.querySelector('.trust');
    const coursesSection = document.getElementById('coursesSection');
    const courseDetailSection = document.getElementById('courseDetailSection');
    const menuToggle = document.getElementById('menuToggle');
    
    // Show courses section
    heroSection.style.display = 'none';
    trustSection.style.display = 'none';
    coursesSection.style.display = 'block';
    courseDetailSection.style.display = 'none';
    
    // Keep hamburger menu as home icon since we're going back to courses
    menuToggle.innerHTML = '<span style="font-size: 24px;">🏠</span>';
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Populate course detail content
function populateCourseDetail() {
    console.log('Populating course detail...');
    if (!currentCourseDetails) {
        console.log('No currentCourseDetails found!');
        return;
    }
    
    const { course, videos, pdfs } = currentCourseDetails;
    console.log('Videos to populate:', videos.length);
    console.log('PDFs to populate:', pdfs.length);
    console.log('Videos data:', videos);
    console.log('PDFs data:', pdfs);
    
    // Update title and counts
    document.getElementById('courseDetailTitle').textContent = course.title;
    document.getElementById('videosCount').textContent = videos.length;
    document.getElementById('pdfsCount').textContent = pdfs.length;
    
    // Populate videos
    const videosItems = document.getElementById('videosItems');
    console.log('Videos container element:', videosItems);
    videosItems.innerHTML = '';
    videos.forEach((video, index) => {
        console.log(`Creating video item ${index + 1}:`, video);
        const item = createContentItem(video, index + 1, 'video');
        videosItems.appendChild(item);
    });
    
    // Update section title for videos
    document.querySelector('#videosList .content-section-title').textContent = `All Videos - ${course.title}`;
    
    // Populate PDFs
    const pdfsItems = document.getElementById('pdfsItems');
    console.log('PDFs container element:', pdfsItems);
    pdfsItems.innerHTML = '';
    pdfs.forEach((pdf, index) => {
        console.log(`Creating PDF item ${index + 1}:`, pdf);
        const item = createContentItem(pdf, index + 1, 'pdf');
        pdfsItems.appendChild(item);
    });
    
    // Update section title for PDFs
    document.querySelector('#pdfsList .content-section-title').textContent = `All PDFs - ${course.title}`;
    console.log('Course detail population completed');
}

// Create content item element
function createContentItem(content, number, type) {
    const item = document.createElement('div');
    item.className = `content-item ${type}`;
    item.onclick = () => openContent(content.url);
    
    item.innerHTML = `
        <div class="content-number">${number}</div>
        <div class="content-title">${content.title}</div>
        ${type === 'video' && number === 1 ? '<div class="content-status">Playing</div>' : ''}
    `;
    
    // Add playing class to first video
    if (type === 'video' && number === 1) {
        item.classList.add('playing');
    }
    
    return item;
}

// Setup tab functionality
function setupCourseTabs() {
    const videosTab = document.getElementById('videosTab');
    const pdfsTab = document.getElementById('pdfsTab');
    const videosList = document.getElementById('videosList');
    const pdfsList = document.getElementById('pdfsList');
    
    videosTab.onclick = () => {
        // Update tabs
        videosTab.classList.add('active');
        pdfsTab.classList.remove('active');
        
        // Update content
        videosList.classList.add('active');
        pdfsList.classList.remove('active');
    };
    
    pdfsTab.onclick = () => {
        // Update tabs
        pdfsTab.classList.add('active');
        videosTab.classList.remove('active');
        
        // Update content
        pdfsList.classList.add('active');
        videosList.classList.remove('active');
    };
}

// Open content in new tab
function openContent(url) {
    window.open(url, '_blank');
}